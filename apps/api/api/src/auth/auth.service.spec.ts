import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
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
          },
        },
        {
          provide: TenantsService,
          useValue: {
            findByName: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
    usersService = module.get<UsersService>(UsersService);
    tenantsService = module.get<TenantsService>(TenantsService);
  });

  describe('Login Logic', () => {
    const mockUser = {
      _id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'John',
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
      };

      (tenantsService.create as jest.Mock).mockResolvedValue(mockTenant);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      (membershipsService.create as jest.Mock).mockResolvedValue({
        role: 'owner',
      });

      const result = await service.register(registerDto);

      expect(tenantsService.create).toHaveBeenCalledWith({
        name: 'Jane Salon',
      });
      expect(usersService.create).toHaveBeenCalled();
      expect(membershipsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'owner' }),
      );
      expect(result).toHaveProperty('accessToken');
    });
  });
});
