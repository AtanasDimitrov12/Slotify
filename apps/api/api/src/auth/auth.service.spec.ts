import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { CustomerProfilesService } from '../customer-profiles/customer-profiles.service';
import { MembershipsService } from '../memberships/memberships.service';
import { TenantsService } from '../tenants/tenants.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');

describe('AuthService (Security & Multi-tenancy)', () => {
  let service: AuthService;
  let membershipsService: MembershipsService;
  let usersService: UsersService;
  let tenantsService: TenantsService;
  let customerProfilesService: CustomerProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mock-jwt') },
        },
        {
          provide: MembershipsService,
          useValue: {
            findActiveByUserIdAndTenantId: jest.fn(),
            findAllByUserId: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: TenantsService,
          useValue: {
            findByName: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CustomerProfilesService,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
    usersService = module.get<UsersService>(UsersService);
    tenantsService = module.get<TenantsService>(TenantsService);
    customerProfilesService = module.get<CustomerProfilesService>(CustomerProfilesService);
  });

  describe('Login Logic', () => {
    const mockUser = {
      _id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'John',
      accountType: 'internal',
    };
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should throw UnauthorizedException for non-existent user', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return a list of tenants if user has multiple memberships and no tenantId is provided', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (membershipsService.findAllByUserId as jest.Mock).mockResolvedValue([
        { tenantId: { _id: 't1', name: 'Tenant 1' }, role: 'owner' },
        { tenantId: { _id: 't2', name: 'Tenant 2' }, role: 'staff' },
      ]);

      const result = (await service.login(loginDto)) as any;

      expect(result).toHaveProperty('tenants');
      expect(result.tenants).toHaveLength(2);
    });

    it('should finalize login if a valid tenantId is provided', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (membershipsService.findActiveByUserIdAndTenantId as jest.Mock).mockResolvedValue({
        tenantId: 't1',
        role: 'owner',
      });

      const result = (await service.login({ ...loginDto, tenantId: 't1' })) as any;

      expect(result).toHaveProperty('accessToken');
      expect(result.account.tenantId).toBe('t1');
      expect(result.account.accountType).toBe('internal');
    });

    it('should login customer successfully', async () => {
      const customerUser = {
        ...mockUser,
        accountType: 'customer',
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(customerUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = (await service.login(loginDto)) as any;

      expect(result).toHaveProperty('accessToken');
      expect(result.account.accountType).toBe('customer');
      expect(result.account.role).toBe('customer');
    });

    it('should throw UnauthorizedException if internal user has no memberships', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (membershipsService.findAllByUserId as jest.Mock).mockResolvedValue([]);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if provided tenantId is not linked to user', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (membershipsService.findActiveByUserIdAndTenantId as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ ...loginDto, tenantId: 'wrong-t' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('switchTenant Logic', () => {
    it('should successfully switch tenant', async () => {
      const mockUserDoc = { _id: 'u1', name: 'John', email: 'j@j.com' };
      const mockMembership = { tenantId: 't2', role: 'staff' };

      (usersService.findById as jest.Mock).mockResolvedValue(mockUserDoc);
      (membershipsService.findActiveByUserIdAndTenantId as jest.Mock).mockResolvedValue(
        mockMembership,
      );

      const result = await service.switchTenant('u1', 't2');

      expect(result).toHaveProperty('accessToken');
      expect(result.account.tenantId).toBe('t2');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.switchTenant('u1', 't2')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if membership not found for switched tenant', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue({ _id: 'u1' });
      (membershipsService.findActiveByUserIdAndTenantId as jest.Mock).mockResolvedValue(null);
      await expect(service.switchTenant('u1', 't2')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMyTenants', () => {
    it('should return list of tenants for user', async () => {
      const mockMemberships = [
        { tenantId: { _id: 't1', name: 'T1', slug: 's1' }, role: 'owner' },
        { tenantId: { _id: 't2', name: 'T2', slug: 's2' }, role: 'staff' },
      ];
      (membershipsService.findAllByUserId as jest.Mock).mockResolvedValue(mockMemberships);

      const result = await service.getMyTenants('u1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ _id: 't1', name: 'T1', slug: 's1', role: 'owner' });
    });
  });

  describe('getId (Private/Internal Utility)', () => {
    it('should handle various ID formats correctly', () => {
      const serviceAny = service as any;
      const objectId = new Types.ObjectId();

      expect(serviceAny.getId(null)).toBe('');
      expect(serviceAny.getId('string-id')).toBe('string-id');
      expect(serviceAny.getId(objectId)).toBe(objectId.toString());
      expect(serviceAny.getId({ _id: objectId })).toBe(objectId.toString());
      expect(serviceAny.getId({ id: 'prop-id' })).toBe('prop-id');
      expect(serviceAny.getId(123)).toBe('123');
    });
  });

  describe('Registration Logic', () => {
    const registerDto = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
      tenantName: 'Jane Salon',
    };

    it('should throw BadRequestException if email is already in use', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'existing',
      });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if tenant name is taken', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (tenantsService.findByName as jest.Mock).mockResolvedValue({
        _id: 'existing-tenant',
      });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should orchestrate user and tenant creation correctly', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (tenantsService.findByName as jest.Mock).mockResolvedValue(null);

      const mockTenant = { _id: 'new-t-id', name: 'Jane Salon' };
      const mockUser = {
        _id: 'new-u-id',
        name: 'Jane',
        email: 'jane@example.com',
        accountType: 'internal',
      };

      (tenantsService.create as jest.Mock).mockResolvedValue(mockTenant);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      (membershipsService.create as jest.Mock).mockResolvedValue({
        role: 'owner',
        tenantId: 'new-t-id',
      });

      const result = await service.register(registerDto);

      expect(tenantsService.create).toHaveBeenCalledWith({
        name: 'Jane Salon',
      });
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ accountType: 'internal' }),
      );
      expect(membershipsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'owner' }),
      );
      expect(result).toHaveProperty('accessToken');
    });

    it('should register customer correctly', async () => {
      const customerDto = {
        name: 'Customer',
        email: 'customer@test.com',
        password: 'password123',
        phone: '+1234567890',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: 'new-u-id',
        name: 'Customer',
        email: 'customer@test.com',
        accountType: 'customer',
      };
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.registerCustomer(customerDto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ accountType: 'customer' }),
      );
      expect(customerProfilesService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+1234567890', userId: 'new-u-id' }),
      );
      expect(result).toHaveProperty('accessToken');
      expect(result.account.accountType).toBe('customer');
    });
  });
});
