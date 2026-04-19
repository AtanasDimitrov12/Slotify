import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CustomerProfile } from './customer-profile.schema';
import { CustomerProfilesService } from './customer-profiles.service';

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
  (mockModel as any).findOne = jest.fn();
  (mockModel as any).findOneAndUpdate = jest.fn();

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
      const dto = { userId: mockProfile.userId.toString(), phone: '123' };
      const result = await service.create(dto as any);
      expect(result).toBeDefined();
    });
  });

  const mockUserId = new Types.ObjectId().toString();

  describe('findByUserId', () => {
    it('should return profile if exists', async () => {
      (mockModel as any).findOne.mockReturnValue({ lean: () => mockProfile });
      const result = await service.findByUserId(mockUserId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateByUserId', () => {
    it('should update profile with mapped ObjectIds', async () => {
      const dto = { preferredServiceIds: [new Types.ObjectId().toString()] };
      (mockModel as any).findOneAndUpdate.mockReturnValue({ lean: () => mockProfile });

      await service.updateByUserId(mockUserId, dto as any);

      expect((mockModel as any).findOneAndUpdate).toHaveBeenCalledWith(
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
      (mockModel as any).findOneAndUpdate.mockReturnValue({ lean: () => null });
      await expect(service.updateByUserId(mockUserId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrCreateByUserId', () => {
    it('should return existing if found', async () => {
      (mockModel as any).findOne.mockReturnValue({ lean: () => mockProfile });
      const result = await service.getOrCreateByUserId(mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it('should create new if not found', async () => {
      (mockModel as any).findOne.mockReturnValue({ lean: () => null });
      // The constructor is called, we already mocked it to return mockProfile
      const result = await service.getOrCreateByUserId(mockUserId);
      expect(result).toBeDefined();
    });
  });
});
