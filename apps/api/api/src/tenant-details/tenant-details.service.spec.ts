import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { TenantDetailsService } from './tenant-details.service';
import { TenantDetails } from './tenant-details.schema';

type MockModel<T = any> = Partial<Record<keyof Model<T>, jest.Mock>> & {
  findOne: jest.Mock;
  create: jest.Mock;
  findOneAndUpdate: jest.Mock;
};

describe('TenantDetailsService', () => {
  let service: TenantDetailsService;
  let model: MockModel;

  const tenantId = 'tenant_123';

  const existingDoc = {
    tenantId,
    contactEmail: 'test@slotify.com',
    toObject: () => ({ tenantId, contactEmail: 'test@slotify.com' }),
  };

  beforeEach(async () => {
    model = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TenantDetailsService,
        { provide: getModelToken(TenantDetails.name), useValue: model },
      ],
    }).compile();

    service = moduleRef.get(TenantDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates tenant details when none exist', async () => {
      model.findOne.mockReturnValue({ lean: () => null });
      model.create.mockResolvedValue(existingDoc);

      const dto: any = { tenantId, contactEmail: 'test@slotify.com' };
      const res = await service.create(dto);

      expect(model.findOne).toHaveBeenCalledWith({ tenantId });
      expect(model.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ tenantId, contactEmail: 'test@slotify.com' });
    });

    it('throws ConflictException if details already exist', async () => {
      model.findOne.mockReturnValue({ lean: () => ({ tenantId }) });

      const dto: any = { tenantId, contactEmail: 'x@x.com' };
      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(model.create).not.toHaveBeenCalled();
    });
  });

  describe('findByTenantId', () => {
    it('returns details when found', async () => {
      model.findOne.mockReturnValue({ lean: () => ({ tenantId, contactEmail: 'a@b.com' }) });

      const res = await service.findByTenantId(tenantId);

      expect(model.findOne).toHaveBeenCalledWith({ tenantId });
      expect(res).toEqual({ tenantId, contactEmail: 'a@b.com' });
    });

    it('throws NotFoundException when not found', async () => {
      model.findOne.mockReturnValue({ lean: () => null });

      await expect(service.findByTenantId(tenantId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateByTenantId', () => {
    it('updates and returns updated document', async () => {
      model.findOneAndUpdate.mockReturnValue({
        lean: () => ({ tenantId, contactPhone: '123' }),
      });

      const res = await service.updateByTenantId(tenantId, { contactPhone: '123' } as any);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { tenantId },
        { $set: { contactPhone: '123' } },
        { new: true },
      );
      expect(res).toEqual({ tenantId, contactPhone: '123' });
    });

    it('throws NotFoundException when updating missing doc', async () => {
      model.findOneAndUpdate.mockReturnValue({ lean: () => null });

      await expect(service.updateByTenantId(tenantId, { contactPhone: '123' } as any))
        .rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('upsertByTenantId', () => {
    it('upserts and returns document', async () => {
      model.findOneAndUpdate.mockReturnValue({
        lean: () => ({ tenantId, contactEmail: 'upsert@x.com' }),
      });

      const res = await service.upsertByTenantId(tenantId, { contactEmail: 'upsert@x.com' } as any);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { tenantId },
        { $set: { contactEmail: 'upsert@x.com', tenantId } },
        { new: true, upsert: true },
      );
      expect(res).toEqual({ tenantId, contactEmail: 'upsert@x.com' });
    });
  });
});