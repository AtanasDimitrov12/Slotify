import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../customer-profiles/customer-profile.schema';
import {
  addMinutes,
  buildDateTimeOnDay,
  endOfDay,
  maxDate,
  minDate,
  startOfDay,
  subtractRanges,
} from '../public-booking/public-booking.utils';
import { EffectiveBookingSettings, TimeRange } from '../public-booking/types/availability.types';
import { Reservation, type ReservationDocument } from '../reservations/reservation.schema';
import { Service } from '../services/service.schema';
import { StaffAvailability } from '../staff-availability/staff-availability.schema';
import { StaffBlockedSlot } from '../staff-blocked-slots/staff-blocked-slot.schema';
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails, type WeeklyOpeningHours } from '../tenant-details/tenant-details.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateStaffAppointmentDto } from './dto/create-staff-appointment.dto';
import { UpdateStaffAppointmentDto } from './dto/update-staff-appointment.dto';

@Injectable()
export class StaffAppointmentsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(StaffProfile.name)
    private readonly staffProfileModel: Model<StaffProfile>,
    @InjectModel(StaffServiceAssignment.name)
    private readonly staffServiceAssignmentModel: Model<StaffServiceAssignment>,
    @InjectModel(StaffAvailability.name)
    private readonly staffAvailabilityModel: Model<StaffAvailability>,
    @InjectModel(StaffTimeOff.name)
    private readonly staffTimeOffModel: Model<StaffTimeOff>,
    @InjectModel(StaffBlockedSlot.name)
    private readonly staffBlockedSlotModel: Model<StaffBlockedSlot>,
    @InjectModel(TenantDetails.name)
    private readonly tenantDetailsModel: Model<TenantDetails>,
    @InjectModel(TenantBookingSettings.name)
    private readonly tenantBookingSettingsModel: Model<TenantBookingSettings>,
    @InjectModel(StaffBookingSettings.name)
    private readonly staffBookingSettingsModel: Model<StaffBookingSettings>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(CustomerProfile.name)
    private readonly customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async getCustomerInsights(params: { tenantId: string; reservationId: string }) {
    const reservation = await this.reservationModel.findById(params.reservationId).lean();
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.calculateFullRisk(
      params.tenantId,
      reservation.customerPhone,
      String(reservation._id),
    );
  }

  private async calculateFullRisk(tenantId: string, phone: string, currentReservationId?: string) {
    const [allReservations, profile] = await Promise.all([
      this.reservationModel.find({ customerPhone: phone }).lean(),
      this.customerProfileModel.findOne({ phone }).lean(),
    ]);

    const user = profile ? await this.userModel.findById(profile.userId).lean() : null;

    const localReservations = allReservations.filter((r) => String(r.tenantId) === tenantId);

    const calculateStats = (resList: any[]) => {
      const completed = resList.filter((r) => r.status === 'completed').length;
      const cancelled = resList.filter((r) => r.status === 'cancelled').length;
      const noShow = resList.filter((r) => r.status === 'no-show').length;
      const total = resList.length;

      return { total, completed, cancelled, noShow };
    };

    const stats = calculateStats(localReservations);
    const globalStats = calculateStats(allReservations);

    // Suspicious phone number check
    const isSuspiciousPhone = (p: string) => {
      const digitsOnly = p.replace(/\D/g, '');

      // Too short or too long for a valid mobile number in most regions
      if (digitsOnly.length < 7 || digitsOnly.length > 15) return true;

      // All same digits (e.g., 1111111)
      if (/^(\d)\1+$/.test(digitsOnly)) return true;

      // Sequential digits (e.g., 1234567, 9876543)
      if ('1234567890123456789'.includes(digitsOnly)) return true;
      if ('9876543210987654321'.includes(digitsOnly)) return true;

      // Repeating patterns (e.g., 123123123, 12121212)
      for (let len = 2; len <= 4; len++) {
        const pattern = digitsOnly.substring(0, len);
        let isRepeating = true;
        for (let i = 0; i < digitsOnly.length; i += len) {
          const chunk = digitsOnly.substring(i, i + len);
          if (chunk.length === len && chunk !== pattern) {
            isRepeating = false;
            break;
          }
        }
        if (isRepeating && digitsOnly.length >= len * 2) return true;
      }

      // Very common fake patterns
      const suspiciousPatterns = ['123456', '654321', '123123', '000000'];
      if (suspiciousPatterns.some((pat) => digitsOnly.includes(pat))) return true;

      return false;
    };

    const riskFactors: string[] = [];
    let riskScore = 0;

    // 1. Phone Number Intelligence
    if (isSuspiciousPhone(phone)) {
      riskFactors.push('Identity: Phone number matches known suspicious patterns or is fake');
      riskScore += 45;
    }

    // 2. Local Reliability History
    if (stats.noShow > 0) {
      const noShowRate = Math.round((stats.noShow / stats.total) * 100);
      riskFactors.push(`Local: ${stats.noShow} no-show(s) at your salon (${noShowRate}% rate)`);
      riskScore += stats.noShow * 35;
    }

    // 3. Network-wide Intelligence
    const otherNoShows = globalStats.noShow - stats.noShow;
    if (otherNoShows > 0) {
      riskFactors.push(`Network: Marked as risky in ${otherNoShows} other salon(s) in the system`);
      riskScore += otherNoShows * 25;
    }

    // 4. Recency & Pattern Analysis
    const pastReservations = allReservations
      .filter((r) => String(r._id) !== currentReservationId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    if (pastReservations.length > 0) {
      const lastRes = pastReservations[0];
      if (lastRes.status === 'no-show') {
        riskFactors.push("Urgent: The customer's last attempted reservation was a NO-SHOW");
        riskScore += 30;
      }
    }

    // 5. Cancellation Patterns
    if (stats.cancelled > 2) {
      riskFactors.push(
        `Reliability: Unusual cancellation frequency at your salon (${stats.cancelled})`,
      );
      riskScore += 15;
    }

    // 6. Verification & Trust
    if (!user) {
      riskFactors.push('Trust: Unregistered guest user (identity not verified)');
      riskScore += 10;
    } else if (!user.emailVerified) {
      riskFactors.push('Trust: Registered account but email is not verified');
      riskScore += 5;
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    return {
      stats,
      globalStats,
      verification: {
        isRegistered: !!user,
        isEmailVerified: user?.emailVerified ?? false,
        hasPhone: !!phone,
      },
      riskScore,
      riskFactors,
    };
  }

  async list(params: {
    tenantId: string;
    userId: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const tenantId = new Types.ObjectId(params.tenantId);
    const userId = new Types.ObjectId(params.userId);

    let queryStart: Date;
    let queryEnd: Date;

    if (params.startDate && params.endDate) {
      queryStart = startOfDay(new Date(params.startDate));
      queryEnd = endOfDay(new Date(params.endDate));
    } else if (params.date) {
      const date = new Date(params.date);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date');
      }
      queryStart = startOfDay(date);
      queryEnd = endOfDay(date);
    } else {
      throw new BadRequestException('Either date or startDate and endDate must be provided');
    }

    const reservations = await this.reservationModel
      .find({
        tenantId,
        staffId: userId,
        startTime: { $lt: queryEnd },
        endTime: { $gt: queryStart },
      })
      .sort({ startTime: 1 })
      .lean();

    const result = await Promise.all(
      reservations.map(async (reservation) => {
        const insights = await this.calculateFullRisk(
          params.tenantId,
          reservation.customerPhone,
          String(reservation._id),
        );
        return {
          id: String(reservation._id),
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          durationMin: reservation.durationMin,
          priceEUR: reservation.priceEUR,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          customerEmail: reservation.customerEmail,
          notes: reservation.notes,
          serviceId: String(reservation.serviceId),
          staffServiceAssignmentId: String(reservation.staffServiceAssignmentId),
          serviceName: reservation.serviceName,
          status: reservation.status,
          riskScore: insights.riskScore,
        };
      }),
    );

    return result;
  }

  async listBookableServicesForStaff(params: { tenantId: string; userId: string }) {
    const tenantId = new Types.ObjectId(params.tenantId);
    const userId = new Types.ObjectId(params.userId);

    const assignments = await this.staffServiceAssignmentModel
      .find({
        tenantId,
        userId,
        isOffered: true,
      })
      .lean();

    if (!assignments.length) {
      return [];
    }

    const serviceIds = assignments.map((assignment) => assignment.serviceId);

    const services = await this.serviceModel
      .find({
        _id: { $in: serviceIds },
        tenantId,
        isActive: true,
      })
      .lean();

    const servicesMap = new Map(services.map((service) => [String(service._id), service]));

    return assignments
      .map((assignment) => {
        const service = servicesMap.get(String(assignment.serviceId));
        if (!service) return null;

        return {
          id: String(assignment._id), // IMPORTANT: bookable id = assignment id
          serviceId: String(service._id),
          name: service.name,
          durationMin: assignment.customDurationMinutes ?? service.durationMin,
          priceEUR: assignment.customPrice ?? service.priceEUR,
          description: service.description ?? '',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async createForStaff(params: {
    tenantId: string;
    userId: string;
    dto: CreateStaffAppointmentDto;
  }) {
    if (!Types.ObjectId.isValid(params.tenantId)) {
      throw new BadRequestException('Invalid tenantId');
    }

    if (!Types.ObjectId.isValid(params.userId)) {
      throw new BadRequestException('Invalid userId');
    }

    if (!Types.ObjectId.isValid(params.dto.staffServiceAssignmentId)) {
      throw new BadRequestException('Invalid staffServiceAssignmentId');
    }

    const tenantId = new Types.ObjectId(params.tenantId);
    const userId = new Types.ObjectId(params.userId);
    const assignmentId = new Types.ObjectId(params.dto.staffServiceAssignmentId);
    const startTime = new Date(params.dto.startTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    const [staffProfile, assignment] = await Promise.all([
      this.staffProfileModel
        .findOne({
          tenantId,
          userId,
          isBookable: true,
          isActive: true,
        })
        .lean(),
      this.staffServiceAssignmentModel
        .findOne({
          _id: assignmentId,
          tenantId,
          userId,
          isOffered: true,
        })
        .lean(),
    ]);

    if (!staffProfile) {
      throw new NotFoundException('Staff member not found');
    }

    if (!assignment) {
      throw new NotFoundException('Bookable service not found');
    }

    const service = await this.serviceModel
      .findOne({
        _id: assignment.serviceId,
        tenantId,
        isActive: true,
      })
      .lean();

    if (!service) {
      throw new NotFoundException('Base service not found');
    }

    const settings = await this.getEffectiveSettings(tenantId, String(userId));
    const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;
    const priceEUR = assignment.customPrice ?? service.priceEUR;
    const endTime = addMinutes(startTime, durationMinutes);

    await this.ensureSlotStillValid({
      tenantId,
      staffId: userId,
      startTime,
      endTime,
      durationMinutes,
      settings,
    });

    const created = await this.reservationModel.create({
      tenantId,
      staffId: userId,
      staffName: staffProfile.displayName,
      staffAvatarUrl: staffProfile.avatarUrl || '',
      staffServiceAssignmentId: assignment._id,
      serviceId: service._id,
      serviceName: service.name,
      durationMin: durationMinutes,
      priceEUR,
      startTime,
      endTime,
      customerName: params.dto.customerName.trim(),
      customerPhone: params.dto.customerPhone.trim(),
      customerEmail: params.dto.customerEmail?.trim().toLowerCase(),
      notes: params.dto.notes?.trim() ?? '',
      status: 'confirmed',
      source: 'staff-dashboard',
    });

    return {
      id: String(created._id),
      startTime: created.startTime,
      endTime: created.endTime,
      status: created.status,
    };
  }

  async updateForStaff(params: {
    tenantId: string;
    userId: string;
    reservationId: string;
    dto: UpdateStaffAppointmentDto;
  }) {
    const tenantId = new Types.ObjectId(params.tenantId);
    const userId = new Types.ObjectId(params.userId);

    const reservation = await this.reservationModel.findOne({
      _id: params.reservationId,
      tenantId,
      staffId: userId,
    });

    if (!reservation) {
      throw new NotFoundException('Appointment not found');
    }

    if (params.dto.staffServiceAssignmentId || params.dto.startTime) {
      const assignmentId = new Types.ObjectId(
        params.dto.staffServiceAssignmentId ?? String(reservation.staffServiceAssignmentId),
      );

      const assignment = await this.staffServiceAssignmentModel
        .findOne({
          _id: assignmentId,
          tenantId,
          userId,
          isOffered: true,
        })
        .lean();

      if (!assignment) {
        throw new NotFoundException('Bookable service not found');
      }

      const service = await this.serviceModel
        .findOne({
          _id: assignment.serviceId,
          tenantId,
          isActive: true,
        })
        .lean();

      if (!service) {
        throw new NotFoundException('Base service not found');
      }

      const startTime = params.dto.startTime
        ? new Date(params.dto.startTime)
        : new Date(reservation.startTime);

      if (Number.isNaN(startTime.getTime())) {
        throw new BadRequestException('Invalid startTime');
      }

      const settings = await this.getEffectiveSettings(tenantId, String(userId));
      const durationMinutes = assignment.customDurationMinutes ?? service.durationMin;
      const priceEUR = assignment.customPrice ?? service.priceEUR;
      const endTime = addMinutes(startTime, durationMinutes);

      await this.ensureSlotStillValid({
        tenantId,
        staffId: userId,
        startTime,
        endTime,
        durationMinutes,
        settings,
        ignoreReservationId: String(reservation._id),
      });

      reservation.staffServiceAssignmentId = assignment._id;
      reservation.serviceId = service._id;
      reservation.serviceName = service.name;
      reservation.durationMin = durationMinutes;
      reservation.priceEUR = priceEUR;
      reservation.startTime = startTime;
      reservation.endTime = endTime;
    }

    if (params.dto.customerName !== undefined) {
      reservation.customerName = params.dto.customerName.trim();
    }
    if (params.dto.customerPhone !== undefined) {
      reservation.customerPhone = params.dto.customerPhone.trim();
    }
    if (params.dto.customerEmail !== undefined) {
      reservation.customerEmail = params.dto.customerEmail?.trim().toLowerCase();
    }
    if (params.dto.notes !== undefined) {
      reservation.notes = params.dto.notes?.trim() ?? '';
    }

    await reservation.save();

    return { success: true };
  }

  async updateStatusForStaff(params: {
    tenantId: string;
    userId: string;
    reservationId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  }) {
    const result = await this.reservationModel.updateOne(
      {
        _id: params.reservationId,
        tenantId: new Types.ObjectId(params.tenantId),
        staffId: new Types.ObjectId(params.userId),
      },
      {
        $set: { status: params.status },
      },
    );

    if (!result.matchedCount) {
      throw new NotFoundException('Appointment not found');
    }

    return { success: true };
  }

  async cancelForStaff(params: { tenantId: string; userId: string; reservationId: string }) {
    const result = await this.reservationModel.updateOne(
      {
        _id: params.reservationId,
        tenantId: new Types.ObjectId(params.tenantId),
        staffId: new Types.ObjectId(params.userId),
      },
      {
        $set: { status: 'cancelled' },
      },
    );

    if (!result.matchedCount) {
      throw new NotFoundException('Appointment not found');
    }

    return { success: true };
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
      minimumNoticeMinutes: 0,
      maximumDaysInAdvance: tenantSettings?.maximumDaysInAdvance ?? 30,
      autoConfirmReservations: true,
      allowBookingToEndAfterWorkingHours:
        tenantSettings?.allowBookingToEndAfterWorkingHours ?? false,
      allowCustomerChooseSpecificStaff: true,
      bufferBeforeMinutes: tenantSettings?.bufferBefore?.enabled
        ? tenantSettings.bufferBefore.minutes
        : 0,
      bufferAfterMinutes: tenantSettings?.bufferAfter?.enabled
        ? tenantSettings.bufferAfter.minutes
        : 0,
      slotIntervalMinutes: 15,
      lockDurationMinutes: 5,
    };

    if (!staffSettings || staffSettings.useGlobalSettings) {
      return base;
    }

    return {
      ...base,
      bufferBeforeMinutes:
        staffSettings.overrides.bufferBefore?.enabled === false
          ? 0
          : (staffSettings.overrides.bufferBefore?.minutes ?? base.bufferBeforeMinutes),
      bufferAfterMinutes:
        staffSettings.overrides.bufferAfter?.enabled === false
          ? 0
          : (staffSettings.overrides.bufferAfter?.minutes ?? base.bufferAfterMinutes),
      allowBookingToEndAfterWorkingHours:
        staffSettings.overrides.allowBookingToEndAfterWorkingHours ??
        base.allowBookingToEndAfterWorkingHours,
    };
  }

  private extractTenantOpeningWindowsForDate(
    date: Date,
    openingHours?: WeeklyOpeningHours,
  ): TimeRange[] {
    if (!openingHours) return [];

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

  private async ensureSlotStillValid(params: {
    tenantId: Types.ObjectId;
    staffId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    settings: EffectiveBookingSettings;
    ignoreReservationId?: string;
  }) {
    const { tenantId, staffId, startTime, endTime, settings, ignoreReservationId } = params;

    const requestedDate = new Date(startTime);
    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);
    const weekday = requestedDate.getDay();
    const dateStr = requestedDate.toISOString().split('T')[0];

    const [tenantDetails, availability, timeOffEntries, blockedSlots, reservations] =
      await Promise.all([
        this.tenantDetailsModel.findOne({ tenantId: String(tenantId), isPublished: true }).lean(),
        this.staffAvailabilityModel.findOne({ tenantId, userId: staffId }).lean(),
        this.staffTimeOffModel
          .find({
            tenantId,
            userId: staffId,
            status: 'approved',
            startDate: { $lt: dayEnd },
            endDate: { $gt: dayStart },
          })
          .lean(),
        this.staffBlockedSlotModel
          .find({
            tenantId,
            userId: staffId,
            isActive: true,
            date: dateStr,
          })
          .lean(),
        this.reservationModel
          .find({
            tenantId,
            staffId,
            _id: ignoreReservationId
              ? { $ne: new Types.ObjectId(ignoreReservationId) }
              : { $exists: true },
            status: { $in: ['pending', 'confirmed'] },
            startTime: { $lt: dayEnd },
            endTime: { $gt: dayStart },
          })
          .lean(),
      ]);

    const staffDayEntries =
      availability?.weeklyAvailability?.filter(
        (entry) => entry.dayOfWeek === weekday && entry.isAvailable,
      ) ?? [];

    if (!staffDayEntries.length) {
      throw new BadRequestException('Staff is not available on this day');
    }

    const salonWindows = this.extractTenantOpeningWindowsForDate(
      requestedDate,
      tenantDetails?.openingHours,
    );

    if (!salonWindows.length) {
      throw new BadRequestException('Salon is closed on this day');
    }

    const staffWindows = staffDayEntries.flatMap((entry) => {
      const windows: TimeRange[] = [];
      const start = buildDateTimeOnDay(requestedDate, entry.startTime);
      const end = buildDateTimeOnDay(requestedDate, entry.endTime);

      if (entry.breakStartTime && entry.breakEndTime) {
        const breakStart = buildDateTimeOnDay(requestedDate, entry.breakStartTime);
        const breakEnd = buildDateTimeOnDay(requestedDate, entry.breakEndTime);

        if (start < breakStart) windows.push({ start, end: breakStart });
        if (breakEnd < end) windows.push({ start: breakEnd, end });
      } else {
        windows.push({ start, end });
      }

      return windows;
    });

    const workingWindows = this.intersectMany(staffWindows, salonWindows);

    const blockers: TimeRange[] = [
      ...timeOffEntries.map((entry) => ({
        start: new Date(entry.startDate),
        end: new Date(entry.endDate),
      })),
      ...blockedSlots.map((slot) => ({
        start: buildDateTimeOnDay(requestedDate, slot.startTime),
        end: buildDateTimeOnDay(requestedDate, slot.endTime),
      })),
      ...reservations.map((reservation) => ({
        start: addMinutes(new Date(reservation.startTime), -settings.bufferBeforeMinutes),
        end: addMinutes(new Date(reservation.endTime), settings.bufferAfterMinutes),
      })),
    ];

    const freeWindows = workingWindows.flatMap((window) => subtractRanges(window, blockers));

    const valid = freeWindows.some((window) => startTime >= window.start && endTime <= window.end);

    if (!valid) {
      throw new BadRequestException('Selected time is not available');
    }
  }
}
