import { BadRequestException, NotFoundException } from '@nestjs/common';
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

describe('PublicBookingService', () => {
  let service: PublicBookingService;

  const mockTenantId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockServiceId = new Types.ObjectId();

  const mockModels = {
    tenant: { findOne: jest.fn() },
    tenantDetails: { findOne: jest.fn() },
    service: { findOne: jest.fn(), find: jest.fn(), findById: jest.fn() },
    staffProfile: { find: jest.fn(), findOne: jest.fn() },
    staffAvailability: { findOne: jest.fn() },
    staffTimeOff: { find: jest.fn() },
    staffBlockedSlot: { find: jest.fn() },
    staffServiceAssignment: { find: jest.fn(), findOne: jest.fn() },
    tenantBookingSettings: { findOne: jest.fn() },
    staffBookingSettings: { findOne: jest.fn() },
    reservation: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), deleteOne: jest.fn() },
    reservationLock: {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      deleteOne: jest.fn(),
    },
  };

  const createMockQuery = (data: any) => ({
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(data),
    then: jest.fn().mockImplementation((callback) => Promise.resolve(callback(data))),
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-06T10:00:00Z')); // A Monday
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicBookingService,
        { provide: getModelToken(Tenant.name), useValue: mockModels.tenant },
        { provide: getModelToken(TenantDetails.name), useValue: mockModels.tenantDetails },
        { provide: getModelToken(Service.name), useValue: mockModels.service },
        { provide: getModelToken(StaffProfile.name), useValue: mockModels.staffProfile },
        { provide: getModelToken(StaffAvailability.name), useValue: mockModels.staffAvailability },
        { provide: getModelToken(StaffTimeOff.name), useValue: mockModels.staffTimeOff },
        { provide: getModelToken(StaffBlockedSlot.name), useValue: mockModels.staffBlockedSlot },
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
        { provide: getModelToken(Reservation.name), useValue: mockModels.reservation },
        { provide: getModelToken(ReservationLock.name), useValue: mockModels.reservationLock },
      ],
    }).compile();

    service = module.get<PublicBookingService>(PublicBookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookingOptionsBySlug', () => {
    it('should throw NotFoundException if salon missing', async () => {
      mockModels.tenant.findOne.mockReturnValue(createMockQuery(null));
      await expect(service.getBookingOptionsBySlug('unknown')).rejects.toThrow(NotFoundException);
    });

    it('should return booking options if salon exists', async () => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, name: 'Salon' }),
      );
      mockModels.tenantDetails.findOne.mockReturnValue(createMockQuery({ isPublished: true }));
      mockModels.staffServiceAssignment.find.mockReturnValue(
        createMockQuery([{ userId: mockUserId, serviceId: mockServiceId, isOffered: true }]),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(createMockQuery({}));
      mockModels.staffProfile.find.mockReturnValue(
        createMockQuery([
          { userId: mockUserId, displayName: 'John', isBookable: true, isActive: true },
        ]),
      );
      mockModels.service.find.mockReturnValue(
        createMockQuery([{ _id: mockServiceId, name: 'S1', durationMin: 30, priceEUR: 20 }]),
      );

      const result = await service.getBookingOptionsBySlug('salon');
      expect(result.tenant.name).toBe('Salon');
      expect(result.staff).toHaveLength(1);
    });
  });

  describe('getAvailabilityBySlug', () => {
    beforeEach(() => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, isPublished: true }),
      );
      mockModels.service.findOne.mockReturnValue(
        createMockQuery({ _id: mockServiceId, durationMin: 60, isActive: true }),
      );
      mockModels.staffServiceAssignment.find.mockReturnValue(
        createMockQuery([{ userId: mockUserId, serviceId: mockServiceId, isOffered: true }]),
      );
      mockModels.staffProfile.find.mockReturnValue(
        createMockQuery([{ userId: mockUserId, isBookable: true, isActive: true }]),
      );
      mockModels.staffProfile.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, experienceYears: 1 }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        createMockQuery({ maximumDaysInAdvance: 30, minimumNoticeMinutes: 0 }),
      );
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        createMockQuery({ useGlobalSettings: true }),
      );
      mockModels.tenantDetails.findOne.mockReturnValue(
        createMockQuery({
          isPublished: true,
          openingHours: { mon: [{ start: '09:00', end: '17:00' }] },
        }),
      );
      mockModels.staffAvailability.findOne.mockReturnValue(
        createMockQuery({
          userId: mockUserId,
          weeklyAvailability: [
            {
              dayOfWeek: 1,
              isAvailable: true,
              slots: [{ startTime: '09:00', endTime: '17:00', tenantId: mockTenantId }],
            },
          ],
        }),
      );
      mockModels.staffTimeOff.find.mockReturnValue(createMockQuery([]));
      mockModels.staffBlockedSlot.find.mockReturnValue(createMockQuery([]));
      mockModels.reservation.find.mockReturnValue(createMockQuery([]));
      mockModels.reservationLock.find.mockReturnValue(createMockQuery([]));
    });

    it('should return availability slots', async () => {
      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: mockServiceId.toString(),
        date: '2026-04-06',
      });
      expect(result.slots.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException for invalid date', async () => {
      await expect(
        service.getAvailabilityBySlug('salon', { date: 'invalid' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter overlapping reservations', async () => {
      mockModels.reservation.find.mockReturnValue(
        createMockQuery([
          {
            startTime: new Date('2026-04-06T10:00:00Z'),
            endTime: new Date('2026-04-06T11:00:00Z'),
            status: 'confirmed',
          },
        ]),
      );

      const result = await service.getAvailabilityBySlug('salon', {
        serviceId: mockServiceId.toString(),
        date: '2026-04-06',
      });

      const hasOverlapping = result.slots.some((s) => {
        const start = new Date(s.startTime);
        return start.getUTCHours() === 10 && start.getUTCMinutes() === 30;
      });
      expect(hasOverlapping).toBe(false);
    });
  });

  describe('createReservationLockBySlug', () => {
    it('should throw BadRequestException if startTime is invalid', async () => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, isPublished: true }),
      );
      await expect(
        service.createReservationLockBySlug('salon', {
          startTime: 'invalid',
          serviceId: mockServiceId.toString(),
          staffId: mockUserId.toString(),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a lock', async () => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, isPublished: true }),
      );
      mockModels.staffProfile.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, isBookable: true, isActive: true }),
      );
      mockModels.staffServiceAssignment.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, serviceId: mockServiceId, isOffered: true }),
      );
      mockModels.service.findOne.mockReturnValue(
        createMockQuery({ _id: mockServiceId, durationMin: 30, isActive: true }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        createMockQuery({ minimumNoticeMinutes: 0, maximumDaysInAdvance: 30 }),
      );
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        createMockQuery({ useGlobalSettings: true }),
      );
      mockModels.tenantDetails.findOne.mockReturnValue(
        createMockQuery({
          isPublished: true,
          openingHours: { mon: [{ start: '09:00', end: '17:00' }] },
        }),
      );
      mockModels.staffAvailability.findOne.mockReturnValue(
        createMockQuery({
          userId: mockUserId,
          weeklyAvailability: [
            {
              dayOfWeek: 1,
              isAvailable: true,
              slots: [{ startTime: '09:00', endTime: '17:00', tenantId: mockTenantId }],
            },
          ],
        }),
      );
      mockModels.staffTimeOff.find.mockReturnValue(createMockQuery([]));
      mockModels.staffBlockedSlot.find.mockReturnValue(createMockQuery([]));
      mockModels.reservation.find.mockReturnValue(createMockQuery([]));
      mockModels.reservationLock.find.mockReturnValue(createMockQuery([]));
      mockModels.reservationLock.create.mockResolvedValue({
        _id: 'l1',
        startTime: new Date(),
        endTime: new Date(),
        expiresAt: new Date(),
      });

      const result = await service.createReservationLockBySlug('salon', {
        startTime: '2026-04-06T10:00:00Z',
        serviceId: mockServiceId.toString(),
        staffId: mockUserId.toString(),
      } as any);

      expect(result).toHaveProperty('_id');
    });
  });

  describe('createReservationBySlug', () => {
    it('should successfully create a reservation', async () => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, isPublished: true }),
      );
      mockModels.staffProfile.findOne.mockReturnValue(
        createMockQuery({
          userId: mockUserId,
          isBookable: true,
          isActive: true,
          displayName: 'John',
        }),
      );
      mockModels.staffServiceAssignment.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, serviceId: mockServiceId, isOffered: true }),
      );
      mockModels.service.findOne.mockReturnValue(
        createMockQuery({
          _id: mockServiceId,
          name: 'S1',
          durationMin: 30,
          isActive: true,
          priceEUR: 20,
        }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        createMockQuery({
          minimumNoticeMinutes: 0,
          maximumDaysInAdvance: 30,
          autoConfirmReservations: true,
        }),
      );
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        createMockQuery({ useGlobalSettings: true }),
      );
      mockModels.tenantDetails.findOne.mockReturnValue(
        createMockQuery({
          isPublished: true,
          openingHours: { mon: [{ start: '09:00', end: '17:00' }] },
        }),
      );
      mockModels.staffAvailability.findOne.mockReturnValue(
        createMockQuery({
          userId: mockUserId,
          weeklyAvailability: [
            {
              dayOfWeek: 1,
              isAvailable: true,
              slots: [{ startTime: '09:00', endTime: '17:00', tenantId: mockTenantId }],
            },
          ],
        }),
      );
      mockModels.staffTimeOff.find.mockReturnValue(createMockQuery([]));
      mockModels.staffBlockedSlot.find.mockReturnValue(createMockQuery([]));
      mockModels.reservation.find.mockReturnValue(createMockQuery([]));
      mockModels.reservationLock.find.mockReturnValue(createMockQuery([]));
      mockModels.reservation.create.mockResolvedValue({
        _id: 'r1',
        status: 'confirmed',
        startTime: new Date(),
        endTime: new Date(),
      });

      const result = await service.createReservationBySlug('salon', {
        startTime: '2026-04-06T10:00:00Z',
        serviceId: mockServiceId.toString(),
        staffId: mockUserId.toString(),
        customerName: 'Alice',
        customerPhone: '123456789',
      } as any);

      expect(result.status).toBe('confirmed');
    });

    it('should throw BadRequestException if lock expired', async () => {
      mockModels.tenant.findOne.mockReturnValue(
        createMockQuery({ _id: mockTenantId, isPublished: true }),
      );
      mockModels.staffProfile.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, isBookable: true, isActive: true }),
      );
      mockModels.staffServiceAssignment.findOne.mockReturnValue(
        createMockQuery({ userId: mockUserId, serviceId: mockServiceId, isOffered: true }),
      );
      mockModels.service.findOne.mockReturnValue(
        createMockQuery({ _id: mockServiceId, durationMin: 30, isActive: true }),
      );
      mockModels.tenantBookingSettings.findOne.mockReturnValue(
        createMockQuery({ minimumNoticeMinutes: 0, maximumDaysInAdvance: 30 }),
      );
      mockModels.staffBookingSettings.findOne.mockReturnValue(
        createMockQuery({ useGlobalSettings: true }),
      );
      mockModels.reservationLock.findOne.mockReturnValue(createMockQuery(null));

      await expect(
        service.createReservationBySlug('salon', {
          startTime: '2026-04-06T10:00:00Z',
          serviceId: mockServiceId.toString(),
          staffId: mockUserId.toString(),
          customerName: 'Alice',
          customerPhone: '123456789',
          lockId: 'expired',
        } as any),
      ).rejects.toThrow('Reservation lock is missing or expired');
    });
  });
});
