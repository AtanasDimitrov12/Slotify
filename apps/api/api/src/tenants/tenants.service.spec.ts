import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Model } from 'mongoose';
import { BookingSettingsService } from '../booking-settings/booking-settings.service';
import { Tenant } from './tenant.schema';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let model: Model<Tenant>;
  let bookingSettingsService: BookingSettingsService;

  const mockTenant = {
    _id: 'tenant-id',
    name: 'Test Salon',
    slug: 'test-salon',
    status: 'active',
    isPublished: true,
    timezone: 'Europe/Amsterdam',
    toObject: jest.fn().mockReturnValue({
      _id: 'tenant-id',
      name: 'Test Salon',
      slug: 'test-salon',
    }),
  };

  const mockTenantModel = {
    new: jest.fn().mockResolvedValue(mockTenant),
    constructor: jest.fn().mockResolvedValue(mockTenant),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exists: jest.fn(),
  };

  const mockBookingSettingsService = {
    getOrCreateByTenantId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getModelToken(Tenant.name),
          useValue: mockTenantModel,
        },
        {
          provide: BookingSettingsService,
          useValue: mockBookingSettingsService,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    model = module.get<Model<Tenant>>(getModelToken(Tenant.name));
    bookingSettingsService = module.get<BookingSettingsService>(BookingSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant with a unique slug', async () => {
      mockTenantModel.exists.mockResolvedValueOnce(false);
      mockTenantModel.create.mockResolvedValue(mockTenant);

      const dto = { name: 'Test Salon' };
      const result = await service.create(dto);

      expect(mockTenantModel.exists).toHaveBeenCalledWith({
        slug: 'test-salon',
      });
      expect(mockTenantModel.create).toHaveBeenCalledWith({
        ...dto,
        slug: 'test-salon',
      });
      expect(result).toEqual({
        _id: 'tenant-id',
        name: 'Test Salon',
        slug: 'test-salon',
      });
    });

    it('should generate a unique slug if the base slug exists', async () => {
      mockTenantModel.exists
        .mockResolvedValueOnce(true) // 'test-salon' exists
        .mockResolvedValueOnce(false); // 'test-salon-2' is free

      mockTenantModel.create.mockResolvedValue(mockTenant);

      const dto = { name: 'Test Salon' };
      await service.create(dto);

      expect(mockTenantModel.exists).toHaveBeenCalledTimes(2);
      expect(mockTenantModel.exists).toHaveBeenLastCalledWith({
        slug: 'test-salon-2',
      });
    });
  });

  describe('findAll', () => {
    it('should return all tenants sorted by creation date', async () => {
      const mockTenants = [mockTenant];
      mockTenantModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockTenants),
        }),
      });

      const result = await service.findAll();

      expect(mockTenantModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockTenants);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      mockTenantModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTenant),
      });

      const result = await service.findOne('tenant-id');

      expect(mockTenantModel.findById).toHaveBeenCalledWith('tenant-id');
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a tenant by name', async () => {
      mockTenantModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTenant),
      });

      const result = await service.findByName('Test Salon');

      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        name: 'Test Salon',
      });
      expect(result).toEqual(mockTenant);
    });
  });

  describe('update', () => {
    it('should update a tenant and return it', async () => {
      mockTenantModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTenant),
      });

      const dto = { name: 'Updated Salon' };
      const result = await service.update('tenant-id', dto);

      expect(mockTenantModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'tenant-id',
        { $set: dto },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant to update not found', async () => {
      mockTenantModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('invalid-id', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      mockTenantModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTenant),
      });

      const result = await service.remove('tenant-id');

      expect(mockTenantModel.findByIdAndDelete).toHaveBeenCalledWith('tenant-id');
      expect(result).toEqual({ deleted: true, id: 'tenant-id' });
    });

    it('should throw NotFoundException if tenant to delete not found', async () => {
      mockTenantModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
