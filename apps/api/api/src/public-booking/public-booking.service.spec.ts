import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PublicBookingService } from './public-booking.service';
import { Tenant } from '../tenants/tenant.schema';
import { TenantDetails } from '../tenant-details/tenant-details.schema';
import { Service } from '../services/service.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { Reservation } from '../reservations/reservation.schema';
import { ReservationLock } from '../reservations/reservation-lock.schema';

describe('PublicBookingService', () => {
  let service: PublicBookingService;

  const mockModel = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
    exists: jest.fn(),
  });

  const mockTenantModel = mockModel();
  const mockTenantDetailsModel = mockModel();
  const mockServiceModel = mockModel();
  const mockStaffProfileModel = mockModel();
  const mockStaffAvailabilityModel = mockModel();
  const mockStaffTimeOffModel = mockModel();
  const mockStaffServiceAssignmentModel = mockModel();
  const mockTenantBookingSettingsModel = mockModel();
  const mockStaffBookingSettingsModel = mockModel();
  const mockReservationModel = mockModel();
  const mockReservationLockModel = mockModel();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicBookingService,
        { provide: getModelToken(Tenant.name), useValue: mockTenantModel },
        { provide: getModelToken(TenantDetails.name), useValue: mockTenantDetailsModel },
        { provide: getModelToken(Service.name), useValue: mockServiceModel },
        { provide: getModelToken(StaffProfile.name), useValue: mockStaffProfileModel },
        { provide: getModelToken(StaffAvailability.name), useValue: mockStaffAvailabilityModel },
        { provide: getModelToken(StaffTimeOff.name), useValue: mockStaffTimeOffModel },
        { provide: getModelToken(StaffServiceAssignment.name), useValue: mockStaffServiceAssignmentModel },
        { provide: getModelToken(TenantBookingSettings.name), useValue: mockTenantBookingSettingsModel },
        { provide: getModelToken(StaffBookingSettings.name), useValue: mockStaffBookingSettingsModel },
        { provide: getModelToken(Reservation.name), useValue: mockReservationModel },
        { provide: getModelToken(ReservationLock.name), useValue: mockReservationLockModel },
      ],
    }).compile();

    service = module.get<PublicBookingService>(PublicBookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBookingOptionsBySlug', () => {
    const mockTenant = {
      _id: new Types.ObjectId(),
      name: 'Test Salon',
      slug: 'test-salon',
      isPublished: true,
    };

    it('should return booking options if tenant exists and is published', async () => {
      mockTenantModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTenant) });
      mockTenantDetailsModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });
      mockStaffProfileModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      });
      mockStaffServiceAssignmentModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      mockServiceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.getBookingOptionsBySlug('test-salon');

      expect(result.tenant.name).toBe('Test Salon');
      expect(result.services).toEqual([]);
      expect(result.staff).toEqual([]);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await expect(service.getBookingOptionsBySlug('invalid-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailabilityBySlug', () => {
    const tenantId = new Types.ObjectId();
    const serviceId = new Types.ObjectId();
    const mockTenant = { _id: tenantId, slug: 'test-salon', isPublished: true };
    const mockService = { _id: serviceId, tenantId, durationMin: 30, isActive: true };

    it('should throw BadRequestException for invalid date', async () => {
      mockTenantModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTenant) });
      
      await expect(
        service.getAvailabilityBySlug('test-salon', {
          serviceId: serviceId.toString(),
          date: 'invalid-date',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if service not found', async () => {
        mockTenantModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTenant) });
        mockServiceModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

        await expect(
            service.getAvailabilityBySlug('test-salon', {
              serviceId: serviceId.toString(),
              date: new Date().toISOString(),
            }),
          ).rejects.toThrow(NotFoundException);
    });

    it('should return empty slots if no staff offered the service', async () => {
        mockTenantModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTenant) });
        mockServiceModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockService) });
        mockStaffServiceAssignmentModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        const result = await service.getAvailabilityBySlug('test-salon', {
            serviceId: serviceId.toString(),
            date: new Date().toISOString(),
        });

        expect(result.slots).toEqual([]);
    });
  });
});
