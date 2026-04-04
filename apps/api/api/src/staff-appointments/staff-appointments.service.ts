import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { TenantBookingSettings } from '../booking-settings/tenant-booking-settings.schema';
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
import { StaffBookingSettings } from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile } from '../staff-profiles/staff-profile.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails, type WeeklyOpeningHours } from '../tenant-details/tenant-details.schema';
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
    @InjectModel(TenantDetails.name)
    private readonly tenantDetailsModel: Model<TenantDetails>,
    @InjectModel(TenantBookingSettings.name)
    private readonly tenantBookingSettingsModel: Model<TenantBookingSettings>,
    @InjectModel(StaffBookingSettings.name)
    private readonly staffBookingSettingsModel: Model<StaffBookingSettings>,
  ) {}

  async listForDay(params: { tenantId: string; userId: string; date: string }) {
    const tenantId = new Types.ObjectId(params.tenantId);
    const userId = new Types.ObjectId(params.userId);
    const date = new Date(params.date);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const reservations = await this.reservationModel
      .find({
        tenantId,
        staffId: userId,
        startTime: { $lt: dayEnd },
        endTime: { $gt: dayStart },
      })
      .sort({ startTime: 1 })
      .lean();

    return reservations.map((reservation) => ({
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
    }));
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

    const [tenantDetails, availability, timeOffEntries, reservations] = await Promise.all([
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
