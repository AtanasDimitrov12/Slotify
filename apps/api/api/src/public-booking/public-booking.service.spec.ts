import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { Reservation } from '../reservations/reservation.schema';
import { ReservationLock } from '../reservations/reservation-lock.schema';
import { Service } from '../services/service.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffBlockedSlot } from '../staff-blocked-slots/staff-blocked-slot.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails } from '../tenant-details/tenant-details.schema';
import { Tenant } from '../tenants/tenant.schema';
import { PublicBookingService } from './public-booking.service';

describe('PublicBookingService (Production Logic)', () => {
  let service: PublicBookingService;

  // Utility to create Mongoose-like Query objects
  const mockQuery = (data: any) => ({
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(data),
    then: (resolve: any) => resolve(data), // Handles await model.find().lean()
  });

  const mockModels = {
    tenant: { findOne: jest.fn() },
    tenantDetails: { findOne: jest.fn() },
    service: { findOne: jest.fn(), find: jest.fn() },
    staffProfile: { find: jest.fn(), findOne: jest.fn() },
    staffAvailability: { findOne: jest.fn() },
    staffTimeOff: { find: jest.fn() },
    staffBlockedSlot: { find: jest.fn() },
    staffServiceAssignment: { find: jest.fn(), findOne: jest.fn() },
    tenantBookingSettings: { findOne: jest.fn() },
    staffBookingSettings: { findOne: jest.fn() },
    reservation: { find: jest.fn(), create: jest.fn() },
    reservationLock: {
      find: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-06T00:00:00Z'));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicBookingService,
        { provide: getModelToken(Tenant.name), useValue: mockModels.tenant },
        {
          provide: getModelToken(TenantDetails.name),
          useValue: mockModels.tenantDetails,
        },
        { provide: getModelToken(Service.name), useValue: mockModels.service },
        {
          provide: getModelToken(StaffProfile.name),
          useValue: mockModels.staffProfile,
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
          provide: getModelToken(StaffServiceAssignment.name),
          useValue: mockModels.staffServiceAssignment,
        },
        {
          provide: getModelToken(TenantBookingSettings.name),
          useValue: mockModels.tenantBookingSettings,
        },
        {
          provide: getModelToken(StaffBookingSettings.name),
          useValue: mockModels.staffBookingSettings,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: mockModels.reservation,
        },
        {
          provide: getModelToken(ReservationLock.name),
          useValue: mockModels.reservationLock,
        },
      ],
    }).compile();

    service = module.get<PublicBookingService>(PublicBookingService);
  });

  const tenantId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const serviceId = new Types.ObjectId();

  describe('Availability Logic (Scenario Testing)', () => {
    const baseDate = new Date('2026-04-06T10:00:00Z'); // A Monday

    beforeEach(() => {
      mockModels.tenant.findOne.mockReturnValue(
        mockQuery({ _id: tenantId, slug: 'salon', isPublished: true }),
      );
      mockModels.service.findOne.mockReturnValue(
        mockQuery({ _id: serviceId, durationMin: 60, isActive: true }),
      );
      mockModels.staffServiceAssignment.find.mockReturnValue(
        mockQuery([{ userId, serviceId, isOffered: true }]),
      );
      mockModels.staffProfile.find.mockReturnValue(
        mockQuery([{ userId, isBookable: true, isActive: true }]),
      );
      mockModels.staffProfile.findOne.mockReturnValue(
        mockQuery({ userId, experienceYears: 5, isBookable: true, isActive: true }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        mockQuery({ minimumNoticeMinutes: 0, maximumDaysInAdvance: 30 }),
      );
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        mockQuery({ useGlobalSettings: true }),
      );

      // Salon Hours: 09:00 - 18:00
      mockModels.tenantDetails.findOne.mockReturnValue(
        mockQuery({
          isPublished: true,
          openingHours: { mon: [{ start: '09:00', end: '18:00' }] },
        }),
      );

      // Staff Hours: 09:00 - 17:00
      mockModels.staffAvailability.findOne.mockReturnValue(
        mockQuery({
          userId,
          weeklyAvailability: [
            {
              dayOfWeek: 1,
              isAvailable: true,
              slots: [
                {
                  startTime: '09:00',
                  endTime: '17:00',
                  tenantId,
                  isAvailable: true,
                },
              ],
            },
          ],
        }),
      );

      mockModels.staffTimeOff.find.mockReturnValue(mockQuery([]));
      mockModels.staffBlockedSlot.find.mockReturnValue(mockQuery([]));
      mockModels.reservation.find.mockReturnValue(mockQuery([]));
      mockModels.reservationLock.find.mockReturnValue(mockQuery([]));
    });

    it('should generate continuous slots when the day is completely free', async () => {
      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: serviceId.toString(),
        date: '2026-04-06', // This is a Monday
      });

      expect(result.slots.length).toBeGreaterThan(0);
      // We look for the start of the day. First slot should match the start of working hours (UTC adjust might apply)
      expect(result.slots[0].startTime).toBeDefined();
    });

    it('should block slots that overlap with an existing reservation', async () => {
      // Create a reservation from 10:00 to 11:00
      const reservationStart = new Date('2026-04-06T10:00:00Z');
      const reservationEnd = new Date('2026-04-06T11:00:00Z');

      mockModels.reservation.find.mockReturnValue(
        mockQuery([
          {
            startTime: reservationStart,
            endTime: reservationEnd,
            status: 'confirmed',
          },
        ]),
      );

      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: serviceId.toString(),
        date: '2026-04-06',
      });

      // A slot starting at 09:30 should be invalid because it ends at 10:30 (overlaps)
      const hasOverlappingSlot = result.slots.some(
        (s) =>
          new Date(s.startTime).getUTCHours() === 9 && new Date(s.startTime).getUTCMinutes() === 30,
      );
      expect(hasOverlappingSlot).toBe(false);
    });

    it('should respect "Buffer After" settings by blocking extra time after reservations', async () => {
      // 15 min buffer after
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        mockQuery({
          bufferAfter: { enabled: true, minutes: 15 },
          minimumNoticeMinutes: 0,
          maximumDaysInAdvance: 30,
        }),
      );

      // Reservation 10:00 - 11:00
      mockModels.reservation.find.mockReturnValue(
        mockQuery([
          {
            startTime: new Date('2026-04-06T10:00:00Z'),
            endTime: new Date('2026-04-06T11:00:00Z'),
            status: 'confirmed',
          },
        ]),
      );

      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: serviceId.toString(),
        date: '2026-04-06',
      });

      // Next available slot should start at 11:15, NOT 11:00
      const slotAt11 = result.slots.find(
        (s) =>
          new Date(s.startTime).getUTCHours() === 11 && new Date(s.startTime).getUTCMinutes() === 0,
      );
      const slotAt1115 = result.slots.find(
        (s) =>
          new Date(s.startTime).getUTCHours() === 11 &&
          new Date(s.startTime).getUTCMinutes() === 15,
      );

      expect(slotAt11).toBeUndefined();
      expect(slotAt1115).toBeDefined();
    });

    it('should return zero slots if the salon is closed on the requested day', async () => {
      mockModels.tenantDetails.findOne.mockReturnValue(
        mockQuery({
          openingHours: { mon: [] }, // Closed Monday
        }),
      );

      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: serviceId.toString(),
        date: '2026-04-06',
      });

      expect(result.slots).toHaveLength(0);
    });

    it('should return empty slots if date is beyond maximumDaysInAdvance (service catches the error)', async () => {
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        mockQuery({
          maximumDaysInAdvance: 7,
        }),
      );

      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 20);

      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: serviceId.toString(),
        date: farFutureDate.toISOString(),
      });

      expect(result.slots).toHaveLength(0);
    });
  });
});
