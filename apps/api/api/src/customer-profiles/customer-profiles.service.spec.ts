import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Model, Types } from 'mongoose';
import { CustomerProfile, type CustomerProfileDocument } from './customer-profile.schema';
import { CustomerProfilesService } from './customer-profiles.service';
import type { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import type { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

describe('CustomerProfilesService', () => {
  let service: CustomerProfilesService;

  const mockProfile = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    phone: '+1234567890',
    preferredServiceIds: [],
    favoriteSalonIds: [],
    preferredStaffIds: [],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockModel = jest.fn().mockImplementation(() => ({
    ...mockProfile,
    save: jest.fn().mockResolvedValue(mockProfile),
  }));
  (mockModel as unknown as Model<CustomerProfileDocument>).findOne = jest.fn();
  (mockModel as unknown as Model<CustomerProfileDocument>).findOneAndUpdate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerProfilesService,
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CustomerProfilesService>(CustomerProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a profile', async () => {
      const dto: CreateCustomerProfileDto = { userId: mockProfile.userId.toString(), phone: '123' };
      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  const mockUserId = new Types.ObjectId().toString();

  describe('findByUserId', () => {
    it('should return profile if exists', async () => {
      (mockModel as unknown as Model<CustomerProfileDocument>).findOne = jest
        .fn()
        .mockReturnValue({ lean: () => mockProfile });
      const result = await service.findByUserId(mockUserId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateByUserId', () => {
    it('should update profile with mapped ObjectIds', async () => {
      const dto: UpdateCustomerProfileDto = {
        preferredServiceIds: [new Types.ObjectId().toString()],
      };
      (mockModel as unknown as Model<CustomerProfileDocument>).findOneAndUpdate = jest
        .fn()
        .mockReturnValue({ lean: () => mockProfile });

      await service.updateByUserId(mockUserId, dto);

      expect(
        (mockModel as unknown as Model<CustomerProfileDocument>).findOneAndUpdate,
      ).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            preferredServiceIds: [expect.any(Types.ObjectId)],
          }),
        }),
        expect.anything(),
      );
    });

    it('should throw NotFoundException if profile missing', async () => {
      (mockModel as unknown as Model<CustomerProfileDocument>).findOneAndUpdate = jest
        .fn()
        .mockReturnValue({ lean: () => null });
      await expect(service.updateByUserId(mockUserId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrCreateByUserId', () => {
    it('should return existing if found', async () => {
      (mockModel as unknown as Model<CustomerProfileDocument>).findOne = jest
        .fn()
        .mockReturnValue({ lean: () => mockProfile });
      const result = await service.getOrCreateByUserId(mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it('should create new if not found', async () => {
      (mockModel as unknown as Model<CustomerProfileDocument>).findOne = jest
        .fn()
        .mockReturnValue({ lean: () => null });
      // The constructor is called, we already mocked it to return mockProfile
      const result = await service.getOrCreateByUserId(mockUserId);
      expect(result).toBeDefined();
    });
  });
});
