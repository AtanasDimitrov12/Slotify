import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.schema';

type MockModel<T = any> = Partial<Record<keyof Model<T>, jest.Mock>> & {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  exists: jest.Mock;
};

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantModel: MockModel;

  const tenantId = 'tenant_123';

  beforeEach(async () => {
    tenantModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      exists: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: getModelToken(Tenant.name), useValue: tenantModel },
      ],
    }).compile();

    service = moduleRef.get(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates tenant and generates slug', async () => {
      // slug not taken
      tenantModel.exists.mockResolvedValue(null);

      const dto: any = { name: 'Fade Factory', timezone: 'Europe/Amsterdam' };
      tenantModel.create.mockResolvedValue({
        toObject: () => ({ _id: tenantId, ...dto, slug: 'fade-factory' }),
      });

      const res = await service.create(dto);

      expect(tenantModel.exists).toHaveBeenCalledWith({ slug: 'fade-factory' });
      expect(tenantModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Fade Factory', slug: 'fade-factory' }),
      );
      expect(res.slug).toBe('fade-factory');
    });

    it('adds suffix when slug already exists', async () => {
      // first exists -> true, second -> null
      tenantModel.exists.mockResolvedValueOnce({ _id: 'x' }).mockResolvedValueOnce(null);

      const dto: any = { name: 'Fade Factory' };
      tenantModel.create.mockResolvedValue({
        toObject: () => ({ _id: tenantId, ...dto, slug: 'fade-factory-2' }),
      });

      const res = await service.create(dto);

      expect(tenantModel.exists).toHaveBeenCalledWith({ slug: 'fade-factory' });
      expect(tenantModel.exists).toHaveBeenCalledWith({ slug: 'fade-factory-2' });
      expect(res.slug).toBe('fade-factory-2');
    });
  });

  describe('findAll', () => {
    it('returns tenants sorted by createdAt desc', async () => {
      const rows = [{ _id: '1' }, { _id: '2' }];

      const sortMock = jest.fn().mockReturnValue({ lean: () => rows });
      tenantModel.find.mockReturnValue({ sort: sortMock });

      const res = await service.findAll();

      expect(tenantModel.find).toHaveBeenCalled();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('returns tenant when found', async () => {
      const tenant = { _id: tenantId, name: 'Salon A' };
      tenantModel.findById.mockReturnValue({ lean: () => tenant });

      const res = await service.findOne(tenantId);

      expect(tenantModel.findById).toHaveBeenCalledWith(tenantId);
      expect(res).toEqual(tenant);
    });

    it('throws NotFoundException when missing', async () => {
      tenantModel.findById.mockReturnValue({ lean: () => null });

      await expect(service.findOne(tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns updated tenant', async () => {
      const dto: any = { timezone: 'Europe/Sofia' };
      const updated = { _id: tenantId, ...dto };

      tenantModel.findByIdAndUpdate.mockReturnValue({ lean: () => updated });

      const res = await service.update(tenantId, dto);

      expect(tenantModel.findByIdAndUpdate).toHaveBeenCalledWith(
        tenantId,
        { $set: dto },
        { new: true },
      );
      expect(res).toEqual(updated);
    });

    it('throws NotFoundException when updating missing tenant', async () => {
      tenantModel.findByIdAndUpdate.mockReturnValue({ lean: () => null });

      await expect(service.update(tenantId, { timezone: 'x' } as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes and returns {deleted:true, id}', async () => {
      tenantModel.findByIdAndDelete.mockReturnValue({ lean: () => ({ _id: tenantId }) });

      const res = await service.remove(tenantId);

      expect(tenantModel.findByIdAndDelete).toHaveBeenCalledWith(tenantId);
      expect(res).toEqual({ deleted: true, id: tenantId });
    });

    it('throws NotFoundException when deleting missing tenant', async () => {
      tenantModel.findByIdAndDelete.mockReturnValue({ lean: () => null });

      await expect(service.remove(tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});