import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { MembershipsService } from '../memberships/memberships.service';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';
import { PublicTenantsController } from './public-tenants.controller';
import { TenantsService } from './tenants.service';

describe('PublicTenantsController', () => {
  let controller: PublicTenantsController;
  let tenantsService: TenantsService;
  let tenantDetailsService: TenantDetailsService;
  let membershipsService: MembershipsService;

  const mockTenantsService = {
    findPublished: jest.fn(),
    findPublishedBySlug: jest.fn(),
  };

  const mockTenantDetailsService = {
    findOptionalByTenantId: jest.fn(),
  };

  const mockMembershipsService = {
    findByTenantAndRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicTenantsController],
      providers: [
        { provide: TenantsService, useValue: mockTenantsService },
        { provide: TenantDetailsService, useValue: mockTenantDetailsService },
        { provide: MembershipsService, useValue: mockMembershipsService },
      ],
    }).compile();

    controller = module.get<PublicTenantsController>(PublicTenantsController);
    tenantsService = module.get<TenantsService>(TenantsService);
    tenantDetailsService = module.get<TenantDetailsService>(TenantDetailsService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listPublicTenants', () => {
    it('should return list of non-admin published tenants', async () => {
      const mockTenant = { _id: 't1', name: 'T1' };
      mockTenantsService.findPublished.mockResolvedValue([mockTenant]);
      mockMembershipsService.findByTenantAndRole.mockResolvedValue([]); // No admin role
      mockTenantDetailsService.findOptionalByTenantId.mockResolvedValue({ city: 'Amsterdam' });

      const result = await controller.listPublicTenants();

      expect(result).toHaveLength(1);
      expect(result[0].details).toBeDefined();
    });

    it('should filter out administrative tenants', async () => {
      const mockTenant = { _id: 't1', name: 'T1' };
      mockTenantsService.findPublished.mockResolvedValue([mockTenant]);
      mockMembershipsService.findByTenantAndRole.mockResolvedValue([{ role: 'admin' }]);

      const result = await controller.listPublicTenants();

      expect(result).toHaveLength(0);
    });
  });

  describe('getPublicTenantBySlug', () => {
    it('should return tenant and details if found and not admin', async () => {
      const mockTenant = { _id: 't1', slug: 's1' };
      mockTenantsService.findPublishedBySlug.mockResolvedValue(mockTenant);
      mockMembershipsService.findByTenantAndRole.mockResolvedValue([]);
      mockTenantDetailsService.findOptionalByTenantId.mockResolvedValue({ notes: 'X' });

      const result = await controller.getPublicTenantBySlug('s1');

      expect(result.tenant).toEqual(mockTenant);
      expect(result.details).toBeDefined();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantsService.findPublishedBySlug.mockResolvedValue(null);
      await expect(controller.getPublicTenantBySlug('s1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant is admin', async () => {
      const mockTenant = { _id: 't1', slug: 's1' };
      mockTenantsService.findPublishedBySlug.mockResolvedValue(mockTenant);
      mockMembershipsService.findByTenantAndRole.mockResolvedValue([{ role: 'admin' }]);

      await expect(controller.getPublicTenantBySlug('s1')).rejects.toThrow(NotFoundException);
    });
  });
});
