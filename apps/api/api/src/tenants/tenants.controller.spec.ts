import { ForbiddenException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let tenantsService: TenantsService;

  const mockUser = {
    sub: 'u1',
    tenantId: 't1',
    role: 'owner',
    accountType: 'internal',
    name: 'Owner',
    email: 'owner@test.com',
    _id: 'u1',
  } as JwtPayload;

  const mockTenantsService = {
    create: jest.fn(),
    createForOwner: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    tenantsService = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMySalon', () => {
    it('should call tenantsService.createForOwner for owners', async () => {
      const dto: CreateTenantDto = { name: 'New Salon' };
      await controller.createMySalon(mockUser, dto);
      expect(tenantsService.createForOwner).toHaveBeenCalledWith(mockUser.sub, dto);
    });

    it('should throw ForbiddenException for non-owners', () => {
      const staffUser = { ...mockUser, role: 'staff' } as JwtPayload;
      const dto: CreateTenantDto = { name: 'New Salon' };
      expect(() => controller.createMySalon(staffUser, dto)).toThrow(ForbiddenException);
    });
  });

  describe('getMyTenant', () => {
    it('should call tenantsService.findOne with user tenantId', async () => {
      await controller.getMyTenant(mockUser);
      expect(tenantsService.findOne).toHaveBeenCalledWith(mockUser.tenantId);
    });

    it('should throw error if tenantId is missing', () => {
      const badUser = { sub: 'u1' } as JwtPayload;
      expect(() => controller.getMyTenant(badUser)).toThrow('Tenant ID is required');
    });
  });

  describe('getTenant', () => {
    it('should call tenantsService.findOne if id matches user tenantId', async () => {
      await controller.getTenant('t1', mockUser);
      expect(tenantsService.findOne).toHaveBeenCalledWith('t1');
    });

    it('should throw ForbiddenException if id does not match user tenantId', () => {
      expect(() => controller.getTenant('other', mockUser)).toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should call tenantsService.update if id matches user tenantId', async () => {
      const dto: UpdateTenantDto = { name: 'Updated' };
      await controller.update('t1', dto, mockUser);
      expect(tenantsService.update).toHaveBeenCalledWith('t1', dto);
    });
  });

  describe('remove', () => {
    it('should call tenantsService.remove if id matches user tenantId', async () => {
      await controller.remove('t1', mockUser);
      expect(tenantsService.remove).toHaveBeenCalledWith('t1');
    });
  });
});
