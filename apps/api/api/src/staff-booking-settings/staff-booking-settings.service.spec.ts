import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StaffBookingSettingsService } from './staff-booking-settings.service';
import { StaffBookingSettings } from './staff-booking-settings.schema';
import { BookingSettingsService } from '../booking-settings/booking-settings.service';

describe('StaffBookingSettingsService (Hierarchy Logic)', () => {
  let service: StaffBookingSettingsService;
  let bookingSettingsService: BookingSettingsService;

  const mockQuery = (data: any) => ({
    lean: jest.fn().mockResolvedValue(data),
  });

  const mockStaffBookingSettingsModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBookingSettingsService = {
    getOrCreateByTenantId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffBookingSettingsService,
        { provide: getModelToken(StaffBookingSettings.name), useValue: mockStaffBookingSettingsModel },
        { provide: BookingSettingsService, useValue: mockBookingSettingsService },
      ],
    }).compile();

    service = module.get<StaffBookingSettingsService>(StaffBookingSettingsService);
    bookingSettingsService = module.get<BookingSettingsService>(BookingSettingsService);
  });

  const tenantId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const globalSettings = {
    minimumNoticeMinutes: 60,
    bufferAfter: { enabled: true, minutes: 10 },
    autoConfirmReservations: true,
  };

  describe('getEffectiveSettings', () => {
    it('should return global settings if staff has useGlobalSettings = true', async () => {
      mockBookingSettingsService.getOrCreateByTenantId.mockResolvedValue(globalSettings);
      mockStaffBookingSettingsModel.findOneAndUpdate.mockReturnValue(mockQuery({
        useGlobalSettings: true,
        overrides: {}
      }));

      const result = await service.getEffectiveSettings(tenantId, userId);

      expect(result.source).toBe('global');
      expect(result.effectiveSettings.minimumNoticeMinutes).toBe(60);
      expect(result.effectiveSettings.bufferAfter.minutes).toBe(10);
    });

    it('should correctly merge overrides when useGlobalSettings = false', async () => {
        mockBookingSettingsService.getOrCreateByTenantId.mockResolvedValue(globalSettings);
        mockStaffBookingSettingsModel.findOneAndUpdate.mockReturnValue(mockQuery({
          useGlobalSettings: false,
          overrides: {
            minimumNoticeMinutes: 30, // Override
            bufferAfter: { minutes: 20 } // Nested Override
          }
        }));
  
        const result = await service.getEffectiveSettings(tenantId, userId);
  
        expect(result.source).toBe('custom');
        expect(result.effectiveSettings.minimumNoticeMinutes).toBe(30);
        expect(result.effectiveSettings.bufferAfter.minutes).toBe(20);
        // Ensure properties not overridden remain from global
        expect(result.effectiveSettings.autoConfirmReservations).toBe(true);
      });
  });
});
