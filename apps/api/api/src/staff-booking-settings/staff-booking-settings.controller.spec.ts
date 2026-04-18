import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import { StaffBookingSettingsController } from './staff-booking-settings.controller';
import { StaffBookingSettingsService } from './staff-booking-settings.service';

describe('StaffBookingSettingsController', () => {
  let controller: StaffBookingSettingsController;
  let service: StaffBookingSettingsService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  const mockOwnerUser: JwtPayload = {
    sub: mockUserId,
    _id: mockUserId,
    name: 'Owner',
    tenantId: mockTenantId,
    role: 'owner',
    email: 'o@o.com',
    accountType: 'internal',
  };

  const mockStaffUser: JwtPayload = {
    ...mockOwnerUser,
    sub: mockUserId,
    role: 'staff',
  };

  const mockService = {
    getEffectiveSettings: jest.fn(),
    updateByStaff: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffBookingSettingsController],
      providers: [
        {
          provide: StaffBookingSettingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StaffBookingSettingsController>(StaffBookingSettingsController);
    service = module.get<StaffBookingSettingsService>(StaffBookingSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyCurrentSettings', () => {
    it('should call service with current user context', async () => {
      await controller.getMyCurrentSettings(mockStaffUser);
      expect(service.getEffectiveSettings).toHaveBeenCalledWith(mockTenantId, mockUserId);
    });

    it('should throw UnauthorizedException if tenantId missing', async () => {
      const badUser = { ...mockStaffUser, tenantId: undefined };
      await expect(controller.getMyCurrentSettings(badUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateMyCurrentSettings', () => {
    it('should update and return new effective settings', async () => {
      const dto = { useGlobalSettings: false };
      mockService.updateByStaff.mockResolvedValue({});
      mockService.getEffectiveSettings.mockResolvedValue({ effectiveSettings: {} });

      const result = await controller.updateMyCurrentSettings(mockStaffUser, dto);

      expect(service.updateByStaff).toHaveBeenCalledWith(mockTenantId, mockUserId, dto);
      expect(result).toHaveProperty('effectiveSettings');
    });
  });

  describe('getForStaff', () => {
    it('should allow owner to get staff settings', async () => {
      const targetUserId = new Types.ObjectId().toString();
      await controller.getForStaff(mockOwnerUser, targetUserId);
      expect(service.getEffectiveSettings).toHaveBeenCalledWith(mockTenantId, targetUserId);
    });

    it('should throw UnauthorizedException if not owner', async () => {
      const targetUserId = new Types.ObjectId().toString();
      await expect(controller.getForStaff(mockStaffUser, targetUserId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateForStaff', () => {
    it('should allow owner to update staff settings', async () => {
      const targetUserId = new Types.ObjectId().toString();
      const dto = { useGlobalSettings: true };
      mockService.updateByStaff.mockResolvedValue({});
      mockService.getEffectiveSettings.mockResolvedValue({ effectiveSettings: {} });

      await controller.updateForStaff(mockOwnerUser, targetUserId, dto);

      expect(service.updateByStaff).toHaveBeenCalledWith(mockTenantId, targetUserId, dto);
    });
  });
});
