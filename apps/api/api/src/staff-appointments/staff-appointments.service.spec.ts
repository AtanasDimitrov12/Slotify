import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StaffAppointmentsService } from './staff-appointments.service';
import { Reservation } from '../reservations/reservation.schema';
import { Service } from '../services/service.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails } from '../tenant-details/tenant-details.schema';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';

describe('StaffAppointmentsService', () => {
  let service: StaffAppointmentsService;

  const mockModel = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    lean: jest.fn(),
  });

  const mockReservationModel = mockModel();
  const mockServiceModel = mockModel();
  const mockStaffProfileModel = mockModel();
  const mockStaffServiceAssignmentModel = mockModel();
  const mockStaffAvailabilityModel = mockModel();
  const mockStaffTimeOffModel = mockModel();
  const mockTenantDetailsModel = mockModel();
  const mockTenantBookingSettingsModel = mockModel();
  const mockStaffBookingSettingsModel = mockModel();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffAppointmentsService,
        { provide: getModelToken(Reservation.name), useValue: mockReservationModel },
        { provide: getModelToken(Service.name), useValue: mockServiceModel },
        { provide: getModelToken(StaffProfile.name), useValue: mockStaffProfileModel },
        { provide: getModelToken(StaffServiceAssignment.name), useValue: mockStaffServiceAssignmentModel },
        { provide: getModelToken(StaffAvailability.name), useValue: mockStaffAvailabilityModel },
        { provide: getModelToken(StaffTimeOff.name), useValue: mockStaffTimeOffModel },
        { provide: getModelToken(TenantDetails.name), useValue: mockTenantDetailsModel },
        { provide: getModelToken(TenantBookingSettings.name), useValue: mockTenantBookingSettingsModel },
        { provide: getModelToken(StaffBookingSettings.name), useValue: mockStaffBookingSettingsModel },
      ],
    }).compile();

    service = module.get<StaffAppointmentsService>(StaffAppointmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listForDay', () => {
    it('should return reservations for a given day', async () => {
      const tenantId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const date = '2023-10-27';

      const mockReservations = [
        {
          _id: new Types.ObjectId(),
          startTime: new Date(),
          endTime: new Date(),
          customerName: 'John Doe',
          status: 'confirmed',
        },
      ];

      mockReservationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockReservations),
        }),
      });

      const result = await service.listForDay({ tenantId, userId, date });

      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('John Doe');
    });

    it('should throw BadRequestException for invalid date', async () => {
      await expect(
        service.listForDay({
          tenantId: new Types.ObjectId().toString(),
          userId: new Types.ObjectId().toString(),
          date: 'invalid',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatusForStaff', () => {
    it('should update the status of a reservation', async () => {
      mockReservationModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await service.updateStatusForStaff({
        tenantId: new Types.ObjectId().toString(),
        userId: new Types.ObjectId().toString(),
        reservationId: new Types.ObjectId().toString(),
        status: 'completed',
      });

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationModel.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        service.updateStatusForStaff({
          tenantId: new Types.ObjectId().toString(),
          userId: new Types.ObjectId().toString(),
          reservationId: new Types.ObjectId().toString(),
          status: 'completed',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
