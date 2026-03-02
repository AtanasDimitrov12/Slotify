import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let membershipsService: MembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('test-token'),
          },
        },
        {
          provide: MembershipsService,
          useValue: {
            findActiveByUserIdAndTenantId: jest.fn(),
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: TenantsService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
  });

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
  };

  const mockMembership = {
    _id: 'membership-id',
    tenantId: 'tenant-id-1',
    userId: 'user-id',
    role: 'owner',
  };

  const loginDto = {
    email: 'test@example.com',
    password: 'password',
  };

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    beforeEach(() => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no membership', async () => {
      jest.spyOn(membershipsService, 'findAllByUserId').mockResolvedValue([]);
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken for user with one membership', async () => {
      jest.spyOn(membershipsService, 'findAllByUserId').mockResolvedValue([mockMembership] as any);
      const result = await authService.login(loginDto);
      expect(result.accessToken).toBe('test-token');
      expect(result.account.tenantId).toBe('tenant-id-1');
    });

    it('should return a list of tenants for user with multiple memberships', async () => {
      const memberships = [
        { tenantId: { _id: 'tenant-id-1', name: 'Tenant 1' } },
        { tenantId: { _id: 'tenant-id-2', name: 'Tenant 2' } },
      ];
      jest.spyOn(membershipsService, 'findAllByUserId').mockResolvedValue(memberships as any);
      const result = await authService.login(loginDto);
      expect(result.tenants).toHaveLength(2);
    });

    it('should login with tenantId and return accessToken', async () => {
        jest.spyOn(membershipsService, 'findActiveByUserIdAndTenantId').mockResolvedValue(mockMembership as any);
        const result = await authService.login({ ...loginDto, tenantId: 'tenant-id-1' });
        expect(result.accessToken).toBe('test-token');
        expect(result.account.tenantId).toBe('tenant-id-1');
      });
  
      it('should throw UnauthorizedException for invalid tenantId', async () => {
        jest.spyOn(membershipsService, 'findActiveByUserIdAndTenantId').mockResolvedValue(null);
        await expect(authService.login({ ...loginDto, tenantId: 'invalid-tenant-id' })).rejects.toThrow(UnauthorizedException);
      });
  });
});
