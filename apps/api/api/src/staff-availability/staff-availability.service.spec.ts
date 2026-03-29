import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { StaffAvailability } from './staff-availability.schema';
import { StaffAvailabilityService } from './staff-availability.service';

describe('StaffAvailabilityService', () => {
  let service: StaffAvailabilityService;

  const mockAvailability = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    weeklyAvailability: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    ],
  };

  const mockAvailabilityModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffAvailabilityService,
        {
          provide: getModelToken(StaffAvailability.name),
          useValue: mockAvailabilityModel,
        },
      ],
    }).compile();

    service = module.get<StaffAvailabilityService>(StaffAvailabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new staff availability', async () => {
      mockAvailabilityModel.create.mockResolvedValue(mockAvailability);

      const dto = {
        tenantId: mockAvailability.tenantId.toString(),
        userId: mockAvailability.userId.toString(),
        weeklyAvailability: mockAvailability.weeklyAvailability,
      };

      const result = await service.create(dto);

      expect(mockAvailabilityModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findByStaff', () => {
    it('should return availability if found', async () => {
      mockAvailabilityModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAvailability),
      });

      const result = await service.findByStaff(
        mockAvailability.tenantId.toString(),
        mockAvailability.userId.toString(),
      );

      expect(mockAvailabilityModel.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('update', () => {
    it('should update and return availability', async () => {
      mockAvailabilityModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAvailability),
      });

      const result = await service.update(mockAvailability._id.toString(), {
        weeklyAvailability: [],
      });

      expect(mockAvailabilityModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockAvailability);
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(new Types.ObjectId().toString(), {
          weeklyAvailability: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
