import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import { MembershipsService } from '../memberships/memberships.service';
import { ServicesService } from '../services/services.service';
import { StaffAvailabilityService } from '../staff-availability/staff-availability.service';
import { StaffBookingSettingsService } from '../staff-booking-settings/staff-booking-settings.service';
import { StaffProfilesService } from '../staff-profiles/staff-profiles.service';
import { StaffServiceAssignmentsService } from '../staff-service-assignments/staff-service-assignments.service';
import { StaffTimeOffService } from '../staff-time-off/staff-time-off.service';
import { UsersService } from '../users/users.service';
import { StaffService } from './staff.service';

jest.mock('bcryptjs');

describe('StaffService', () => {
  let service: StaffService;
  let usersService: jest.Mocked<UsersService>;
  let membershipsService: jest.Mocked<MembershipsService>;
  let staffProfilesService: jest.Mocked<StaffProfilesService>;

  const mockTenantId = new Types.ObjectId().toString();
  const mockOwnerId = new Types.ObjectId().toString();
  const mockOwnerUser: JwtPayload = {
    sub: mockOwnerId,
    _id: mockOwnerId,
    name: 'Test Owner',
    tenantId: mockTenantId,
    role: 'owner',
    email: 'owner@test.com',
    accountType: 'internal',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: MembershipsService,
          useValue: {
            create: jest.fn(),
            findByTenantAndRole: jest.fn(),
            findActiveByUserIdAndTenantId: jest.fn(),
            findAllByUserId: jest.fn(),
          },
        },
        {
          provide: StaffProfilesService,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            updateByUserId: jest.fn(),
            findAnyByUserId: jest.fn(),
            upsert: jest.fn(),
          },
        },
        {
          provide: StaffAvailabilityService,
          useValue: {
            create: jest.fn(),
            findByStaff: jest.fn(),
            findByUser: jest.fn(),
            upsertByStaff: jest.fn(),
            upsertByUser: jest.fn(),
          },
        },
        {
          provide: StaffTimeOffService,
          useValue: {
            findAllByStaff: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: StaffServiceAssignmentsService,
          useValue: {
            findAllByStaff: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: ServicesService, useValue: { findOneForTenant: jest.fn() } },
        { provide: StaffBookingSettingsService, useValue: {} },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    usersService = module.get(UsersService);
    membershipsService = module.get(MembershipsService);
    staffProfilesService = module.get(StaffProfilesService);
  });

  describe('onboard', () => {
    const onboardDto = {
      name: 'New Barber',
      email: 'barber@slotify.com',
      password: 'securePassword123',
    };

    it('should successfully onboard a new staff member (Full Orchestration)', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
      const mockUser = {
        _id: new Types.ObjectId(),
        name: 'New Barber',
        email: 'barber@slotify.com',
      };
      usersService.create.mockResolvedValue(mockUser as any);
      membershipsService.create.mockResolvedValue({
        _id: 'm1',
        role: 'staff',
      } as any);
      staffProfilesService.upsert.mockResolvedValue({ _id: 'p1' } as any);

      // Act
      const result = await service.onboard(mockOwnerUser, onboardDto);

      // Assert
      expect(result.message).toContain('successfully');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: onboardDto.email.toLowerCase(),
          accountType: 'internal',
        }),
      );
      expect(membershipsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'staff', tenantId: mockTenantId }),
      );
      expect(staffProfilesService.upsert).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if requester is not an owner', async () => {
      const staffUser: JwtPayload = {
        ...mockOwnerUser,
        role: 'staff',
      };
      await expect(service.onboard(staffUser, onboardDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if user is already a member of this tenant', async () => {
      usersService.findByEmail.mockResolvedValue({ _id: 'exists' } as any);
      membershipsService.findActiveByUserIdAndTenantId.mockResolvedValue({ _id: 'm1' } as any);
      await expect(service.onboard(mockOwnerUser, onboardDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyProfile', () => {
    it('should return combined user and profile data', async () => {
      const userId = new Types.ObjectId().toString();
      const userContext: JwtPayload = {
        sub: userId,
        _id: userId,
        name: 'John Doe',
        tenantId: mockTenantId,
        role: 'staff',
        email: 'staff@test.com',
        accountType: 'internal',
      };

      usersService.findById.mockResolvedValue({
        name: 'John',
        email: 'john@doe.com',
      } as any);
      staffProfilesService.findByUserId.mockResolvedValue({
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        displayName: 'John the Barber',
        isActive: true,
        isBookable: true,
      } as any);

      const result = await service.getMyProfile(userContext);

      expect(result.name).toBe('John the Barber');
      expect(result.email).toBe('john@doe.com');
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      staffProfilesService.findByUserId.mockResolvedValue(null);
      await expect(service.getMyProfile(mockOwnerUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('listStaff', () => {
    it('should only return staff members for the owner tenant (Isolation)', async () => {
      membershipsService.findByTenantAndRole.mockResolvedValue([
        { userId: new Types.ObjectId(), role: 'staff' },
      ] as any);

      // Mock subsequent calls for the one staff found
      usersService.findById.mockResolvedValue({ name: 'Staff 1' } as any);
      staffProfilesService.findByUserId.mockResolvedValue({
        displayName: 'Profile 1',
      } as any);

      const result = await service.listStaff(mockOwnerUser);

      expect(result).toHaveLength(1);
      expect(membershipsService.findByTenantAndRole).toHaveBeenCalledWith(mockTenantId, 'staff');
    });
  });
});
