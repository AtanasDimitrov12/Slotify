import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import { CreatePublicReservationDto } from '../reservations/dto/create-public-reservation.dto';
import { Reservation, type ReservationDocument } from '../reservations/reservation.schema';
import {
  ReservationLock,
  type ReservationLockDocument,
} from '../reservations/reservation-lock.schema';
import { Service } from '../services/service.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails, type WeeklyOpeningHours } from '../tenant-details/tenant-details.schema';
import { Tenant } from '../tenants/tenant.schema';
import { CreateReservationLockDto } from './dto/create-reservation-lock.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import {
  addMinutes,
  buildDateTimeOnDay,
  clampToStep,
  endOfDay,
  maxDate,
  minDate,
  startOfDay,
  subtractRanges,
} from './public-booking.utils';
import {
  AvailabilitySlot,
  EffectiveBookingSettings,
  TimeRange,
} from './types/availability.types';

@Injectable()
export class PublicBookingService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<Tenant>,
    @InjectModel(TenantDetails.name)
    private readonly tenantDetailsModel: Model<TenantDetails>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(StaffProfile.name)
    private readonly staffProfileModel: Model<StaffProfile>,
    @InjectModel(StaffAvailability.name)
    private readonly staffAvailabilityModel: Model<StaffAvailability>,
    @InjectModel(StaffTimeOff.name)
    private readonly staffTimeOffModel: Model<StaffTimeOff>,
    @InjectModel(StaffServiceAssignment.name)
    private readonly staffServiceAssignmentModel: Model<StaffServiceAssignment>,
    @InjectModel(TenantBookingSettings.name)
    private readonly tenantBookingSettingsModel: Model<TenantBookingSettings>,
    @InjectModel(StaffBookingSettings.name)
    private readonly staffBookingSettingsModel: Model<StaffBookingSettings>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(ReservationLock.name)
    private readonly reservationLockModel: Model<ReservationLockDocument>,
  ) {}

  async getBookingOptionsBySlug(slug: string) {
    const tenant = await this.tenantModel.findOne({ slug, isPublished: true }).lean();

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    const tenantId = new Types.ObjectId(String(tenant._id));

    const [details, staffProfiles, assignments, bookingSettings] = await Promise.all([
      this.tenantDetailsModel.findOne({ tenantId: String(tenant._id), isPublished: true }).lean(),
      this.staffProfileModel
        .find({
          tenantId,
          isBookable: true,
          isActive: true,
        })
        .sort({ displayName: 1 })
        .lean(),
      this.staffServiceAssignmentModel
        .find({
          tenantId,
          isOffered: true,
        })
        .lean(),
      this.tenantBookingSettingsModel.findOne({ tenantId }).lean(),
    ]);

    const activeStaffIds = new Set(staffProfiles.map((staff) => String(staff.userId)));

    const filteredAssignments = assignments.filter((assignment) =>
      activeStaffIds.has(String(assignment.userId)),
    );

    const serviceIds = [...new Set(filteredAssignments.map((a) => String(a.serviceId)))];

    const services = await this.serviceModel
      .find({
        _id: { $in: serviceIds.map((id) => new Types.ObjectId(id)) },
        tenantId,
        isActive: true,
      })
      .sort({ name: 1 })
      .lean();

    return {
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
      },
      details,
      services: services.map((service) => {
        const serviceIdStr = String(service._id);
        const relevantAssignments = filteredAssignments.filter(
          (a) => String(a.serviceId) === serviceIdStr,
        );

        let durationMin = service.durationMin;
        let priceEUR = service.priceEUR;

        if (relevantAssignments.length > 0) {
          const effectiveDurations = relevantAssignments.map(
            (a) => a.customDurationMinutes ?? service.durationMin,
          );
          durationMin = Math.min(...effectiveDurations);

          const effectivePrices = relevantAssignments.map((a) => a.customPrice ?? service.priceEUR);
          priceEUR = Math.min(...effectivePrices);
        }

        return {
          _id: service._id,
          name: service.name,
          durationMin,
          priceEUR,
          description: service.description,
        };
      }),
      staff: staffProfiles.map((staff) => ({
        _id: staff.userId,
        displayName: staff.displayName,
        bio: staff.bio,
        avatarUrl: staff.avatarUrl,
        expertise: staff.expertise,
      })),
      maximumDaysInAdvance: bookingSettings?.maximumDaysInAdvance ?? 30,
    };
  }

  async getAvailabilityBySlug(slug: string, query: GetAvailabilityDto) {
    const tenant = await this.tenantModel.findOne({ slug, isPublished: true }).lean();

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    const tenantId = new Types.ObjectId(String(tenant._id));
    const serviceId = new Types.ObjectId(query.serviceId);
    const requestedDate = new Date(query.date);

    if (Number.isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const service = await this.serviceModel
      .findOne({
        _id: serviceId,
        tenantId,
        isActive: true,
      })
      .lean();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const assignments = await this.resolveCandidateAssignments(tenantId, serviceId, query.staffId);

    if (assignments.length === 0) {
      return {
        slots: [],
        nextAvailableDate: null,
      };
    }

    const allSlots: AvailabilitySlot[] = [];

    for (const assignment of assignments) {
      const staffId = String(assignment.userId);
      const settings = await this.getEffectiveSettings(tenantId, staffId);

      try {
        this.validateRequestedDateAgainstBookingRules(requestedDate, settings, {
          isDay: true,
        });
      } catch {
        continue;
      }

      const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;

      const staffSlots = await this.generateStaffSlotsForDate({
        tenantId,
        staffId,
        requestedDate,
        durationMinutes,
        settings,
      });

      allSlots.push(...staffSlots);
    }

    allSlots.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    return {
      slots: allSlots,
      nextAvailableDate:
        allSlots.length > 0
          ? requestedDate.toISOString()
          : await this.findNextAvailableDate(tenantId, serviceId, query.staffId),
    };
  }

  async createReservationLockBySlug(slug: string, dto: CreateReservationLockDto) {
    const tenant = await this.tenantModel.findOne({ slug, isPublished: true }).lean();

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    const tenantId = new Types.ObjectId(String(tenant._id));
    const staffId = new Types.ObjectId(dto.staffId);
    const serviceId = new Types.ObjectId(dto.serviceId);
    const startTime = new Date(dto.startTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    const [staffProfile, assignment] = await Promise.all([
      this.staffProfileModel
        .findOne({
          tenantId,
          userId: staffId,
          isBookable: true,
          isActive: true,
        })
        .lean(),
      this.staffServiceAssignmentModel
        .findOne({
          tenantId,
          userId: staffId,
          serviceId,
          isOffered: true,
        })
        .lean(),
    ]);

    if (!staffProfile) {
      throw new NotFoundException('Staff member not found');
    }

    if (!assignment) {
      throw new NotFoundException('Selected service is not offered by this staff member');
    }

    const service = await this.serviceModel
      .findOne({ _id: assignment.serviceId, tenantId, isActive: true })
      .lean();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const settings = await this.getEffectiveSettings(tenantId, String(staffId));
    this.validateRequestedDateAgainstBookingRules(startTime, settings);

    const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;
    const endTime = addMinutes(startTime, durationMinutes);

    await this.validateSelectedSlot({
      tenantId,
      staffId,
      startTime,
      endTime,
      durationMinutes,
      settings,
    });

    await this.reservationLockModel.deleteMany({
      tenantId,
      expiresAt: { $lte: new Date() },
    });

    const expiresAt = addMinutes(new Date(), settings.lockDurationMinutes);

    const created = await this.reservationLockModel.create({
      tenantId,
      staffId,
      serviceId: service._id,
      staffServiceAssignmentId: assignment._id,
      startTime,
      endTime,
      expiresAt,
      customerName: dto.customerName?.trim(),
      customerEmail: dto.customerEmail?.trim().toLowerCase(),
      source: 'public-booking',
    });

    return {
      _id: created._id,
      startTime: created.startTime,
      endTime: created.endTime,
      expiresAt: created.expiresAt,
    };
  }

  async createReservationBySlug(slug: string, dto: CreatePublicReservationDto) {
    const tenant = await this.tenantModel.findOne({ slug, isPublished: true }).lean();

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    const tenantId = new Types.ObjectId(String(tenant._id));
    const staffId = new Types.ObjectId(dto.staffId);
    const serviceId = new Types.ObjectId(dto.serviceId);
    const startTime = new Date(dto.startTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    const [staffProfile, assignment] = await Promise.all([
      this.staffProfileModel
        .findOne({
          tenantId,
          userId: staffId,
          isBookable: true,
          isActive: true,
        })
        .lean(),
      this.staffServiceAssignmentModel
        .findOne({
          tenantId,
          userId: staffId,
          serviceId,
          isOffered: true,
        })
        .lean(),
    ]);

    if (!staffProfile) {
      throw new NotFoundException('Staff member not found');
    }

    if (!assignment) {
      throw new NotFoundException('Selected service is not offered by this staff member');
    }

    const service = await this.serviceModel
      .findOne({ _id: assignment.serviceId, tenantId, isActive: true })
      .lean();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const settings = await this.getEffectiveSettings(tenantId, String(staffId));
    this.validateRequestedDateAgainstBookingRules(startTime, settings);

    const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;
    const priceEUR = assignment.customPrice ?? service.priceEUR;
    const endTime = addMinutes(startTime, durationMinutes);

    let activeLockId: string | undefined;

    if (dto.lockId) {
      const lock = await this.reservationLockModel.findOne({
        _id: dto.lockId,
        tenantId,
        staffId,
        serviceId: service._id,
        staffServiceAssignmentId: assignment._id,
        startTime,
        endTime,
        expiresAt: { $gt: new Date() },
      });

      if (!lock) {
        throw new BadRequestException('Reservation lock is missing or expired');
      }

      activeLockId = String(lock._id);
    }

    await this.validateSelectedSlot({
      tenantId,
      staffId,
      startTime,
      endTime,
      durationMinutes,
      settings,
      ignoreLockId: activeLockId,
    });

    const status = settings.autoConfirmReservations ? 'confirmed' : 'pending';

    const created = await this.reservationModel.create({
      tenantId,
      staffId,
      staffServiceAssignmentId: assignment._id,
      serviceId: service._id,
      serviceName: service.name,
      durationMin: durationMinutes,
      priceEUR,
      startTime,
      endTime,
      customerName: dto.customerName.trim(),
      customerPhone: dto.customerPhone.trim(),
      customerEmail: dto.customerEmail?.trim().toLowerCase(),
      notes: dto.notes?.trim() ?? '',
      status,
      source: 'public-booking',
    });

    if (activeLockId) {
      await this.reservationLockModel.deleteOne({ _id: activeLockId });
    }

    return {
      _id: created._id,
      status: created.status,
      startTime: created.startTime,
      endTime: created.endTime,
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
      },
      staff: {
        _id: staffProfile.userId,
        displayName: staffProfile.displayName,
      },
      service: {
        _id: service._id,
        name: service.name,
        durationMin: durationMinutes,
        priceEUR,
      },
    };
  }

  private async resolveCandidateAssignments(
    tenantId: Types.ObjectId,
    serviceId: Types.ObjectId,
    requestedStaffId?: string,
  ): Promise<StaffServiceAssignment[]> {
    const assignmentQuery: Record<string, unknown> = {
      tenantId,
      serviceId,
      isOffered: true,
    };

    if (requestedStaffId) {
      assignmentQuery.userId = new Types.ObjectId(requestedStaffId);
    }

    const assignments = await this.staffServiceAssignmentModel.find(assignmentQuery).lean();

    if (assignments.length === 0) {
      return [];
    }

    const activeStaffProfiles = await this.staffProfileModel
      .find({
        tenantId,
        userId: { $in: assignments.map((assignment) => assignment.userId) },
        isBookable: true,
        isActive: true,
      })
      .lean();

    const allowedIds = new Set(activeStaffProfiles.map((profile) => String(profile.userId)));

    return assignments.filter((assignment) => allowedIds.has(String(assignment.userId)));
  }

  private async getEffectiveSettings(
    tenantId: Types.ObjectId,
    staffId: string,
  ): Promise<EffectiveBookingSettings> {
    const [tenantSettings, staffSettings] = await Promise.all([
      this.tenantBookingSettingsModel.findOne({ tenantId }).lean(),
      this.staffBookingSettingsModel
        .findOne({ tenantId, userId: new Types.ObjectId(staffId) })
        .lean(),
    ]);

    const base: EffectiveBookingSettings = {
      minimumNoticeMinutes: tenantSettings?.minimumNoticeMinutes ?? 60,
      maximumDaysInAdvance: tenantSettings?.maximumDaysInAdvance ?? 30,
      autoConfirmReservations: tenantSettings?.autoConfirmReservations ?? true,
      allowBookingToEndAfterWorkingHours:
        tenantSettings?.allowBookingToEndAfterWorkingHours ?? false,
      allowCustomerChooseSpecificStaff: tenantSettings?.allowCustomerChooseSpecificStaff ?? true,
      bufferBeforeMinutes: tenantSettings?.bufferBefore?.enabled
        ? tenantSettings.bufferBefore.minutes
        : 0,
      bufferAfterMinutes: tenantSettings?.bufferAfter?.enabled
        ? tenantSettings.bufferAfter.minutes
        : 0,
      slotIntervalMinutes: 5,
      lockDurationMinutes: 5,
    };

    if (!staffSettings || staffSettings.useGlobalSettings) {
      return base;
    }

    return {
      minimumNoticeMinutes:
        staffSettings.overrides.minimumNoticeMinutes ?? base.minimumNoticeMinutes,
      maximumDaysInAdvance:
        staffSettings.overrides.maximumDaysInAdvance ?? base.maximumDaysInAdvance,
      autoConfirmReservations:
        staffSettings.overrides.autoConfirmReservations ?? base.autoConfirmReservations,
      allowBookingToEndAfterWorkingHours:
        staffSettings.overrides.allowBookingToEndAfterWorkingHours ??
        base.allowBookingToEndAfterWorkingHours,
      allowCustomerChooseSpecificStaff:
        staffSettings.overrides.allowCustomerChooseSpecificStaff ??
        base.allowCustomerChooseSpecificStaff,
      bufferBeforeMinutes:
        staffSettings.overrides.bufferBefore?.enabled === false
          ? 0
          : (staffSettings.overrides.bufferBefore?.minutes ?? base.bufferBeforeMinutes),
      bufferAfterMinutes:
        staffSettings.overrides.bufferAfter?.enabled === false
          ? 0
          : (staffSettings.overrides.bufferAfter?.minutes ?? base.bufferAfterMinutes),
      slotIntervalMinutes: base.slotIntervalMinutes,
      lockDurationMinutes: base.lockDurationMinutes,
    };
  }

  private validateRequestedDateAgainstBookingRules(
    date: Date,
    settings: EffectiveBookingSettings,
    options: { isDay?: boolean } = {},
  ): void {
    const now = new Date();
    const minimumStart = addMinutes(now, settings.minimumNoticeMinutes);
    const maximumStart = addMinutes(now, settings.maximumDaysInAdvance * 24 * 60);

    const tooSoon = options.isDay ? endOfDay(date) < minimumStart : date < minimumStart;

    const tooFar = options.isDay ? startOfDay(date) > maximumStart : date > maximumStart;

    if (tooSoon) {
      throw new BadRequestException('Selected time is too soon');
    }

    if (tooFar) {
      throw new BadRequestException('Selected time is too far in the future');
    }
  }

  private async generateStaffSlotsForDate(params: {
    tenantId: Types.ObjectId;
    staffId: string;
    requestedDate: Date;
    durationMinutes: number;
    settings: EffectiveBookingSettings;
  }): Promise<AvailabilitySlot[]> {
    const { tenantId, staffId, requestedDate, durationMinutes, settings } = params;

    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);
    const weekday = requestedDate.getDay();

    const [tenantDetails, availability, timeOffEntries, reservations, locks] = await Promise.all([
      this.tenantDetailsModel.findOne({ tenantId: String(tenantId), isPublished: true }).lean(),
      this.staffAvailabilityModel.findOne({ tenantId, userId: new Types.ObjectId(staffId) }).lean(),
      this.staffTimeOffModel
        .find({
          tenantId,
          userId: new Types.ObjectId(staffId),
          status: 'approved',
          startDate: { $lt: dayEnd },
          endDate: { $gt: dayStart },
        })
        .lean(),
      this.reservationModel
        .find({
          tenantId,
          staffId: new Types.ObjectId(staffId),
          status: { $in: ['pending', 'confirmed'] },
          startTime: { $lt: dayEnd },
          endTime: { $gt: dayStart },
        })
        .sort({ startTime: 1 })
        .lean(),
      this.reservationLockModel
        .find({
          tenantId,
          staffId: new Types.ObjectId(staffId),
          expiresAt: { $gt: new Date() },
          startTime: { $lt: dayEnd },
          endTime: { $gt: dayStart },
        })
        .sort({ startTime: 1 })
        .lean(),
    ]);

    const staffDayEntries =
      availability?.weeklyAvailability?.filter(
        (entry) => entry.dayOfWeek === weekday && entry.isAvailable,
      ) ?? [];

    if (staffDayEntries.length === 0) {
      return [];
    }

    const salonWindows = this.extractTenantOpeningWindowsForDate(
      requestedDate,
      tenantDetails?.openingHours,
    );

    if (salonWindows.length === 0) {
      return [];
    }

    const staffWindows = staffDayEntries.flatMap((entry) => {
      const windows: TimeRange[] = [];
      const start = buildDateTimeOnDay(requestedDate, entry.startTime);
      const end = buildDateTimeOnDay(requestedDate, entry.endTime);

      if (entry.breakStartTime && entry.breakEndTime) {
        const breakStart = buildDateTimeOnDay(requestedDate, entry.breakStartTime);
        const breakEnd = buildDateTimeOnDay(requestedDate, entry.breakEndTime);

        if (start < breakStart) {
          windows.push({ start, end: breakStart });
        }

        if (breakEnd < end) {
          windows.push({ start: breakEnd, end });
        }
      } else {
        windows.push({ start, end });
      }

      return windows;
    });

    const mergedWorkingWindows = this.intersectMany(staffWindows, salonWindows);

    if (mergedWorkingWindows.length === 0) {
      return [];
    }

    const blockers: TimeRange[] = [
      ...timeOffEntries.map((entry) => ({
        start: new Date(entry.startDate),
        end: new Date(entry.endDate),
      })),
      ...reservations.map((reservation) => ({
        start: addMinutes(new Date(reservation.startTime), -settings.bufferBeforeMinutes),
        end: addMinutes(new Date(reservation.endTime), settings.bufferAfterMinutes),
      })),
      ...locks.map((lock) => ({
        start: new Date(lock.startTime),
        end: new Date(lock.endTime),
      })),
    ];

    const freeWindows = mergedWorkingWindows.flatMap((window) => subtractRanges(window, blockers));

    if (freeWindows.length === 0) {
      return [];
    }

    const earliestAllowed = addMinutes(new Date(), settings.minimumNoticeMinutes);
    const slots: AvailabilitySlot[] = [];

    for (const freeWindow of freeWindows) {
      const candidateStartBase = clampToStep(
        maxDate(freeWindow.start, earliestAllowed),
        settings.slotIntervalMinutes,
      );

      for (
        let candidateStart = new Date(candidateStartBase);
        candidateStart < freeWindow.end;
        candidateStart = addMinutes(candidateStart, settings.slotIntervalMinutes)
      ) {
        const candidateEnd = addMinutes(candidateStart, durationMinutes);

        if (!settings.allowBookingToEndAfterWorkingHours && candidateEnd > freeWindow.end) {
          continue;
        }

        if (candidateEnd > freeWindow.end) {
          continue;
        }

        const gapBefore = Math.max(
          0,
          Math.round((candidateStart.getTime() - freeWindow.start.getTime()) / 60_000),
        );
        const gapAfter = Math.max(
          0,
          Math.round((freeWindow.end.getTime() - candidateEnd.getTime()) / 60_000),
        );

        const score = this.scoreCandidate(gapBefore, gapAfter);

        slots.push({
          staffId,
          startTime: candidateStart.toISOString(),
          endTime: candidateEnd.toISOString(),
          score,
        });
      }
    }

    return slots;
  }

  private scoreCandidate(gapBefore: number, gapAfter: number): number {
    const perfectFitBonus = gapBefore === 0 || gapAfter === 0 ? 1000 : 0;
    const smallGapPenalty = gapBefore + gapAfter;
    const fragmentPenalty =
      (gapBefore > 0 && gapBefore < 15 ? 40 : 0) + (gapAfter > 0 && gapAfter < 15 ? 40 : 0);

    return perfectFitBonus - smallGapPenalty - fragmentPenalty;
  }

  private extractTenantOpeningWindowsForDate(
    date: Date,
    openingHours?: WeeklyOpeningHours,
  ): TimeRange[] {
    if (!openingHours) {
      return [];
    }

    const weekdayMap: Array<keyof WeeklyOpeningHours> = [
      'sun',
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
    ];

    const key = weekdayMap[date.getDay()];
    const entries = openingHours[key] ?? [];

    return entries.map((entry) => ({
      start: buildDateTimeOnDay(date, entry.start),
      end: buildDateTimeOnDay(date, entry.end),
    }));
  }

  private intersectMany(a: TimeRange[], b: TimeRange[]): TimeRange[] {
    const results: TimeRange[] = [];

    for (const left of a) {
      for (const right of b) {
        const start = maxDate(left.start, right.start);
        const end = minDate(left.end, right.end);

        if (start < end) {
          results.push({ start, end });
        }
      }
    }

    return results.sort((x, y) => x.start.getTime() - y.start.getTime());
  }

  private async validateSelectedSlot(params: {
    tenantId: Types.ObjectId;
    staffId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    settings: EffectiveBookingSettings;
    ignoreLockId?: string;
  }): Promise<void> {
    const { tenantId, staffId, startTime, endTime, durationMinutes, settings, ignoreLockId } =
      params;

    const slots = await this.generateStaffSlotsForDate({
      tenantId,
      staffId: String(staffId),
      requestedDate: startTime,
      durationMinutes,
      settings,
    });

    const exists = slots.some(
      (slot) =>
        new Date(slot.startTime).getTime() === startTime.getTime() &&
        new Date(slot.endTime).getTime() === endTime.getTime(),
    );

    if (!exists) {
      throw new BadRequestException('This slot is no longer available');
    }

    const [overlappingReservation, overlappingLock] = await Promise.all([
      this.reservationModel.findOne({
        tenantId,
        staffId,
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      }),
      this.reservationLockModel.findOne({
        tenantId,
        staffId,
        expiresAt: { $gt: new Date() },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        ...(ignoreLockId ? { _id: { $ne: new Types.ObjectId(ignoreLockId) } } : {}),
      }),
    ]);

    if (overlappingReservation) {
      throw new BadRequestException('This slot was just booked by someone else');
    }

    if (overlappingLock) {
      throw new BadRequestException('This slot is temporarily reserved by another customer');
    }
  }

  private async findNextAvailableDate(
    tenantId: Types.ObjectId,
    serviceId: Types.ObjectId,
    requestedStaffId?: string,
  ): Promise<string | null> {
    const today = startOfDay(new Date());

    for (let offset = 0; offset < 30; offset += 1) {
      const date = addMinutes(today, offset * 24 * 60);

      const result = await this.getAvailabilityInternal(
        tenantId,
        serviceId,
        requestedStaffId,
        date,
      );

      if (result.length > 0) {
        return date.toISOString();
      }
    }

    return null;
  }

  private async getAvailabilityInternal(
    tenantId: Types.ObjectId,
    serviceId: Types.ObjectId,
    requestedStaffId: string | undefined,
    requestedDate: Date,
  ): Promise<AvailabilitySlot[]> {
    const service = await this.serviceModel
      .findOne({ _id: serviceId, tenantId, isActive: true })
      .lean();

    if (!service) {
      return [];
    }

    const assignments = await this.resolveCandidateAssignments(
      tenantId,
      serviceId,
      requestedStaffId,
    );

    const slots: AvailabilitySlot[] = [];

    for (const assignment of assignments) {
      const staffId = String(assignment.userId);
      const settings = await this.getEffectiveSettings(tenantId, staffId);

      try {
        this.validateRequestedDateAgainstBookingRules(requestedDate, settings, {
          isDay: true,
        });
      } catch {
        continue;
      }

      const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;

      const generated = await this.generateStaffSlotsForDate({
        tenantId,
        staffId,
        requestedDate,
        durationMinutes,
        settings,
      });

      slots.push(...generated);
    }

    return slots;
  }
}
