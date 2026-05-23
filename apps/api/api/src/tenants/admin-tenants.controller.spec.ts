import { Test, type TestingModule } from '@nestjs/testing';
import { AdminTenantsController } from './admin-tenants.controller';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

describe('AdminTenantsController', () => {
  let controller: AdminTenantsController;
  let tenantsService: TenantsService;

  const mockTenantsService = {
    findAllSalons: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTenantsController],
      providers: [{ provide: TenantsService, useValue: mockTenantsService }],
    }).compile();

    controller = module.get<AdminTenantsController>(AdminTenantsController);
    tenantsService = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call tenantsService.findAllSalons', async () => {
      await controller.findAll();
      expect(tenantsService.findAllSalons).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call tenantsService.create', async () => {
      const dto: CreateTenantDto = { name: 'Admin Salon' };
      await controller.create(dto);
      expect(tenantsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call tenantsService.update', async () => {
      const dto: UpdateTenantDto = { name: 'Updated' };
      await controller.update('t1', dto);
      expect(tenantsService.update).toHaveBeenCalledWith('t1', dto);
    });
  });

  describe('remove', () => {
    it('should call tenantsService.remove', async () => {
      await controller.remove('t1');
      expect(tenantsService.remove).toHaveBeenCalledWith('t1');
    });
  });
});
