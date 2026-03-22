import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BookingSettingsService } from './booking-settings.service';
import { TenantBookingSettings } from './tenant-booking-settings.schema';

describe('BookingSettingsService', () => {
  let service: BookingSettingsService;

  const mockSettings = {
    tenantId: new Types.ObjectId(),
    bufferBefore: { enabled: false, minutes: 0 },
    bufferAfter: { enabled: true, minutes: 5 },
    minimumNoticeMinutes: 60,
    maximumDaysInAdvance: 30,
    autoConfirmReservations: true,
    allowBookingToEndAfterWorkingHours: false,
    allowCustomerChooseSpecificStaff: true,
  };

  const mockSettingsModel = {
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingSettingsService,
        {
          provide: getModelToken(TenantBookingSettings.name),
          useValue: mockSettingsModel,
        },
      ],
    }).compile();

    service = module.get<BookingSettingsService>(BookingSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertByTenantId', () => {
    it('should update and return settings', async () => {
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSettings),
      });

      const tenantId = mockSettings.tenantId.toString();
      const dto = { minimumNoticeMinutes: 30 };
      const result = await service.upsertByTenantId(tenantId, dto);

      expect(mockSettingsModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });

  describe('getOrCreateByTenantId', () => {
    it('should return existing or new settings', async () => {
      mockSettingsModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSettings),
      });

      const tenantId = mockSettings.tenantId.toString();
      const result = await service.getOrCreateByTenantId(tenantId);

      expect(mockSettingsModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });
});
