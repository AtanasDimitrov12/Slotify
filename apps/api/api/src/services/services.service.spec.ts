import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Service } from './service.schema';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockService = {
    _id: new Types.ObjectId(),
    name: 'Haircut',
    durationMin: 30,
    priceEUR: 25,
    description: 'A simple haircut',
    tenantId: new Types.ObjectId(),
    isActive: true,
  };

  const mockServiceModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    insertMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createForTenant', () => {
    it('should create a new service', async () => {
      mockServiceModel.create.mockResolvedValue(mockService);

      const dto = {
        name: 'Haircut',
        durationMin: 30,
        priceEUR: 25,
        description: 'A simple haircut',
      };

      const result = await service.createForTenant(mockService.tenantId.toString(), dto);

      expect(mockServiceModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if name is missing', async () => {
      const dto = { name: '', durationMin: 30, priceEUR: 25 };

      await expect(service.createForTenant(new Types.ObjectId().toString(), dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createManyForTenant', () => {
    it('should create multiple services', async () => {
      mockServiceModel.insertMany.mockResolvedValue([mockService]);
      const result = await service.createManyForTenant(new Types.ObjectId().toString(), [
        { name: 'S1', durationMin: 30, priceEUR: 20 },
      ]);
      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException if any name missing', async () => {
      await expect(
        service.createManyForTenant(new Types.ObjectId().toString(), [
          { name: '', durationMin: 30, priceEUR: 20 },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateForTenant', () => {
    it('should update and return service', async () => {
      mockServiceModel.findOneAndUpdate.mockReturnValue({ lean: () => mockService });
      const result = await service.updateForTenant(
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
        { name: 'New Name' },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if missing', async () => {
      mockServiceModel.findOneAndUpdate.mockReturnValue({ lean: () => null });
      await expect(
        service.updateForTenant(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByTenant', () => {
    it('should return all active services for a tenant', async () => {
      mockServiceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockService]),
        }),
      });

      const result = await service.findAllByTenant(new Types.ObjectId().toString());

      expect(mockServiceModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOneForTenant', () => {
    it('should return a service if found', async () => {
      mockServiceModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockService),
      });

      const result = await service.findOneForTenant(
        mockService.tenantId.toString(),
        mockService._id.toString(),
      );

      expect(result).toEqual(mockService);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockServiceModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOneForTenant(new Types.ObjectId().toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeForTenant', () => {
    it('should deactivate a service', async () => {
      mockServiceModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockService),
      });

      const result = await service.removeForTenant(
        mockService.tenantId.toString(),
        mockService._id.toString(),
      );

      expect(result.message).toBe('Service removed successfully');
    });

    it('should throw NotFoundException if service to remove not found', async () => {
      mockServiceModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.removeForTenant(new Types.ObjectId().toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
