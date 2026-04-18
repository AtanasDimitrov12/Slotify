import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { CustomerProfile } from '../customer-profiles/customer-profile.schema';
import { Reservation } from '../reservations/reservation.schema';
import { Service } from '../services/service.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffBlockedSlot } from '../staff-blocked-slots/staff-blocked-slot.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails } from '../tenant-details/tenant-details.schema';
import { User } from '../users/user.schema';
import { StaffAppointmentsService } from './staff-appointments.service';

describe('StaffAppointmentsService (Production Life Cycle)', () => {
  let service: StaffAppointmentsService;

  const mockQuery = (data: any) => ({
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(data),
    then: (resolve: any) => resolve(data),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  });

  const mockModels = {
    reservation: {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    },
    staffProfile: { findOne: jest.fn() },
    staffServiceAssignment: { findOne: jest.fn(), find: jest.fn() },
    service: { findOne: jest.fn(), find: jest.fn() },
    tenantBookingSettings: { findOne: jest.fn() },
    staffBookingSettings: { findOne: jest.fn() },
    tenantDetails: { findOne: jest.fn(), find: jest.fn() },
    staffAvailability: { findOne: jest.fn() },
    staffTimeOff: { find: jest.fn() },
    staffBlockedSlot: { find: jest.fn() },
    user: { findById: jest.fn() },
    customerProfile: { findOne: jest.fn() },
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
          provide: getModelToken(StaffBlockedSlot.name),
          useValue: mockModels.staffBlockedSlot,
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
        { provide: getModelToken(User.name), useValue: mockModels.user },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: mockModels.customerProfile,
        },
      ],
    }).compile();

    service = module.get<StaffAppointmentsService>(StaffAppointmentsService);
  });

  const tenantId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const reservationId = new Types.ObjectId().toString();
  const serviceId = new Types.ObjectId().toString();

  describe('Customer DNA Intelligence', () => {
    it('should flag suspicious phone numbers correctly', async () => {
      const suspiciousPhone = '123123123';
      mockModels.reservation.findById.mockReturnValue(
        mockQuery({
          _id: reservationId,
          customerPhone: suspiciousPhone,
          tenantId,
        }),
      );
      mockModels.reservation.find.mockReturnValue(mockQuery([]));
      mockModels.customerProfile.findOne.mockReturnValue(mockQuery(null));

      const insights = await service.getCustomerInsights({
        tenantId,
        reservationId,
      });

      expect(insights.riskScore).toBeGreaterThan(40);
      expect(insights.riskFactors).toContain(
        'Identity: Phone number matches known suspicious patterns or is fake',
      );
    });
  });

  describe('Appointment Lifecycle', () => {
    it('should update appointment status correctly', async () => {
      mockModels.reservation.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await service.updateStatusForStaff({
        tenantId,
        userId,
        reservationId,
        status: 'completed',
      });

      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException for invalid list date', async () => {
      await expect(service.list({ tenantIds: [tenantId], userId, date: 'invalid' })).rejects.toThrow(BadRequestException);
    });

    it('should return list of appointments', async () => {
      mockModels.reservation.find.mockReturnValue(mockQuery([{
        _id: reservationId,
        tenantId,
        customerPhone: '123'
      }]));
      mockModels.tenantDetails.find.mockReturnValue(mockQuery([]));
      mockModels.customerProfile.findOne.mockReturnValue(mockQuery(null));

      const result = await service.list({ tenantIds: [tenantId], userId, date: '2026-04-06' });
      expect(result).toHaveLength(1);
    });

    it('should list bookable services', async () => {
      mockModels.staffServiceAssignment.find.mockReturnValue(mockQuery([{ serviceId, tenantId, isOffered: true }]));
      mockModels.service.find.mockReturnValue(mockQuery([{ _id: serviceId, name: 'S1', durationMin: 30, priceEUR: 20 }]));

      const result = await service.listBookableServicesForStaff({ tenantIds: [tenantId], userId });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('S1');
    });

    it('should update appointment', async () => {
      const res = { _id: reservationId, save: jest.fn() };
      mockModels.reservation.findOne.mockResolvedValue(res);

      await service.updateForStaff({
        tenantId, userId, reservationId, dto: { customerName: 'New Name' }
      });

      expect(res.save).toHaveBeenCalled();
    });
  });

  describe('Appointment Creation', () => {
    it('should successfully create appointment', async () => {
      const assignmentId = new Types.ObjectId().toString();
      mockModels.staffProfile.findOne.mockReturnValue(mockQuery({ displayName: 'John' }));
      mockModels.staffServiceAssignment.findOne.mockReturnValue(mockQuery({ _id: assignmentId, serviceId }));
      mockModels.service.findOne.mockReturnValue(mockQuery({ _id: serviceId, name: 'S', durationMin: 30 }));
      mockModels.tenantDetails.findOne.mockReturnValue(mockQuery({ openingHours: { mon: [{ start: '09:00', end: '17:00' }] } }));
      mockModels.staffAvailability.findOne.mockReturnValue(mockQuery({ weeklyAvailability: [{ dayOfWeek: 1, isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00', tenantId }] }] }));
      mockModels.tenantBookingSettings.findOne.mockReturnValue(mockQuery({}));
      mockModels.staffBookingSettings.findOne.mockReturnValue(mockQuery({ useGlobalSettings: true }));
      mockModels.staffTimeOff.find.mockReturnValue(mockQuery([]));
      mockModels.staffBlockedSlot.find.mockReturnValue(mockQuery([]));
      mockModels.reservation.find.mockReturnValue(mockQuery([]));
      mockModels.reservation.create.mockResolvedValue({ _id: 'r1', status: 'confirmed' });

      const result = await service.createForStaff({
        tenantId,
        userId,
        dto: {
          staffServiceAssignmentId: assignmentId,
          startTime: '2026-04-06T10:00:00Z',
          customerName: 'Alice',
          customerPhone: '123'
        }
      });
      expect(result.status).toBe('confirmed');
    });
  });
});
