import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StaffProfilesService } from './staff-profiles.service';
import { StaffProfile } from './staff-profile.schema';

describe('StaffProfilesService', () => {
  let service: StaffProfilesService;

  const mockStaffProfile = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
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
        tenantId: mockStaffProfile.tenantId.toString(),
        userId: mockStaffProfile.userId.toString(),
        displayName: 'Barber John',
      };

      const result = await service.create(dto);

      expect(mockStaffProfileModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid tenantId', () => {
      const dto = {
        tenantId: 'invalid',
        userId: mockStaffProfile.userId.toString(),
        displayName: 'John',
      };

      expect(() => service.create(dto as any)).toThrow(BadRequestException);
    });
  });

  describe('findByTenantAndUser', () => {
    it('should return a profile if found', async () => {
      mockStaffProfileModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });

      const result = await service.findByTenantAndUser(
        mockStaffProfile.tenantId.toString(),
        mockStaffProfile.userId.toString()
      );

      expect(result).toEqual(mockStaffProfile);
    });
  });

  describe('updateByTenantAndUser', () => {
    it('should update and return the profile', async () => {
      mockStaffProfileModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockStaffProfile),
      });

      const dto = { displayName: 'John Updated' };
      const result = await service.updateByTenantAndUser(
        mockStaffProfile.tenantId.toString(),
        mockStaffProfile.userId.toString(),
        dto
      );

      expect(result).toEqual(mockStaffProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockStaffProfileModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateByTenantAndUser(
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
            { displayName: 'New' }
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
