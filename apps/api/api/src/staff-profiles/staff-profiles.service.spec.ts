import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { StaffProfile } from './staff-profile.schema';
import { StaffProfilesService } from './staff-profiles.service';

describe('StaffProfilesService', () => {
  let service: StaffProfilesService;

  const mockStaffProfile = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    displayName: 'Barber John',
    bio: 'Expert barber',
    experienceYears: 5,
    expertise: ['Fades', 'Beards'],
    isActive: true,
  };

  const mockStaffProfileModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffProfilesService,
        {
          provide: getModelToken(StaffProfile.name),
          useValue: mockStaffProfileModel,
        },
      ],
    }).compile();

    service = module.get<StaffProfilesService>(StaffProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new staff profile', async () => {
      mockStaffProfileModel.create.mockResolvedValue(mockStaffProfile);

      const dto = {
        userId: mockStaffProfile.userId.toString(),
        displayName: 'Barber John',
      };

      const result = await service.create(dto as any);

      expect(mockStaffProfileModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid userId', () => {
      const dto = {
        userId: 'invalid',
        displayName: 'John',
      };

      expect(() => service.create(dto as any)).toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return a profile if found', async () => {
      mockStaffProfileModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });

      const result = await service.findByUserId(mockStaffProfile.userId.toString());

      expect(result).toEqual(mockStaffProfile);
    });
  });

  describe('updateByUserId', () => {
    it('should update and return the profile', async () => {
      mockStaffProfileModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });

      const dto = { displayName: 'John Updated' };
      const result = await service.updateByUserId(mockStaffProfile.userId.toString(), dto);

      expect(result).toEqual(mockStaffProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockStaffProfileModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateByUserId(new Types.ObjectId().toString(), { displayName: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should upsert and return the profile', async () => {
      mockStaffProfileModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });

      const result = await service.upsert(mockStaffProfile.userId.toString(), {
        displayName: 'Upserted',
      });

      expect(result).toEqual(mockStaffProfile);
      expect(mockStaffProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockStaffProfile.userId },
        expect.any(Object),
        { upsert: true, returnDocument: 'after' },
      );
    });

    it('should throw BadRequestException for invalid userId', async () => {
      await expect(service.upsert('invalid', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAnyByUserId', () => {
    it('should call findByUserId', async () => {
      mockStaffProfileModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });
      const result = await service.findAnyByUserId(mockStaffProfile.userId.toString());
      expect(result).toEqual(mockStaffProfile);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if profile not found', async () => {
      mockStaffProfileModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      await expect(service.update('id1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if profile not found', async () => {
      mockStaffProfileModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove('id1')).rejects.toThrow(NotFoundException);
    });
  });
});
