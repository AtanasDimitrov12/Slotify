import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { Reservation } from '../reservations/reservation.schema';
import { Service } from '../services/service.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails } from '../tenant-details/tenant-details.schema';
import { StaffAppointmentsService } from './staff-appointments.service';

describe('StaffAppointmentsService (Production Life Cycle)', () => {
  let service: StaffAppointmentsService;

  const mockQuery = (data: any) => ({
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(data),
    then: (resolve: any) => resolve(data),
  });

  const mockModels = {
    reservation: {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    },
    staffProfile: { findOne: jest.fn() },
    staffServiceAssignment: { findOne: jest.fn(), find: jest.fn() },
    service: { findOne: jest.fn(), find: jest.fn() },
    tenantBookingSettings: { findOne: jest.fn() },
    staffBookingSettings: { findOne: jest.fn() },
    tenantDetails: { findOne: jest.fn() },
    staffAvailability: { findOne: jest.fn() },
    staffTimeOff: { find: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffAppointmentsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockModels.reservation,
        },
        { provide: getModelToken(Service.name), useValue: mockModels.service },
        {
          provide: getModelToken(StaffProfile.name),
          useValue: mockModels.staffProfile,
        },
        {
          provide: getModelToken(StaffServiceAssignment.name),
          useValue: mockModels.staffServiceAssignment,
        },
        {
          provide: getModelToken(StaffAvailability.name),
          useValue: mockModels.staffAvailability,
        },
        {
          provide: getModelToken(StaffTimeOff.name),
          useValue: mockModels.staffTimeOff,
        },
        {
          provide: getModelToken(TenantDetails.name),
          useValue: mockModels.tenantDetails,
        },
        {
          provide: getModelToken(TenantBookingSettings.name),
          useValue: mockModels.tenantBookingSettings,
        },
        {
          provide: getModelToken(StaffBookingSettings.name),
          useValue: mockModels.staffBookingSettings,
        },
      ],
    }).compile();

    service = module.get<StaffAppointmentsService>(StaffAppointmentsService);
  });

  const tenantId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const reservationId = new Types.ObjectId().toString();

  describe('Appointment Lifecycle', () => {
    it('should update appointment status correctly (Confirmed -> Completed)', async () => {
      mockModels.reservation.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await service.updateStatusForStaff({
        tenantId,
        userId,
        reservationId,
        status: 'completed',
      });

      expect(result.success).toBe(true);
      expect(mockModels.reservation.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: reservationId,
          tenantId: new Types.ObjectId(tenantId),
        }),
        { $set: { status: 'completed' } },
      );
    });

    it('should prevent updating an appointment belonging to another tenant', async () => {
      mockModels.reservation.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        service.updateStatusForStaff({
          tenantId,
          userId,
          reservationId,
          status: 'completed',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should cancel an appointment by setting status to "cancelled"', async () => {
      mockModels.reservation.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await service.cancelForStaff({
        tenantId,
        userId,
        reservationId,
      });

      expect(result.success).toBe(true);
      expect(mockModels.reservation.updateOne).toHaveBeenCalledWith(expect.anything(), {
        $set: { status: 'cancelled' },
      });
    });
  });

  describe('Appointment Creation (Manual Entry)', () => {
    const assignmentId = new Types.ObjectId().toString();
    const startTime = new Date('2026-04-06T10:00:00Z').toISOString();

    beforeEach(() => {
      mockModels.staffProfile.findOne.mockReturnValue(
        mockQuery({
          userId: new Types.ObjectId(userId),
          isActive: true,
          isBookable: true,
        }),
      );
      mockModels.staffServiceAssignment.findOne.mockReturnValue(
        mockQuery({
          _id: new Types.ObjectId(assignmentId),
          serviceId: new Types.ObjectId(),
        }),
      );
      mockModels.service.findOne.mockReturnValue(
        mockQuery({ _id: new Types.ObjectId(), durationMin: 30 }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(mockQuery({}));
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        mockQuery({ useGlobalSettings: true }),
      );
      mockModels.tenantDetails.findOne.mockReturnValue(
        mockQuery({
          isPublished: true,
          openingHours: { mon: [{ start: '09:00', end: '18:00' }] },
        }),
      );
      mockModels.staffAvailability.findOne.mockReturnValue(
        mockQuery({
          weeklyAvailability: [
            {
              dayOfWeek: 1,
              startTime: '09:00',
              endTime: '18:00',
              isAvailable: true,
            },
          ],
        }),
      );
      mockModels.staffTimeOff.find.mockReturnValue(mockQuery([]));
      mockModels.reservation.find.mockReturnValue(mockQuery([]));
    });

    it('should successfully create a manual appointment when slot is free', async () => {
      mockModels.reservation.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        status: 'confirmed',
      });

      const result = await service.createForStaff({
        tenantId,
        userId,
        dto: {
          staffServiceAssignmentId: assignmentId,
          startTime,
          customerName: 'Alice',
          customerPhone: '+123456789',
        },
      });

      expect(result.status).toBe('confirmed');
      expect(mockModels.reservation.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if creating an appointment on a closed day', async () => {
      mockModels.tenantDetails.findOne.mockReturnValue(mockQuery({ openingHours: { mon: [] } })); // Closed

      await expect(
        service.createForStaff({
          tenantId,
          userId,
          dto: {
            staffServiceAssignmentId: assignmentId,
            startTime,
            customerName: 'Alice',
            customerPhone: '+123456789',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
