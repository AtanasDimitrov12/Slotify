import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { MembershipsService } from '../memberships/memberships.service';
import { StaffAvailabilityService } from '../staff-availability/staff-availability.service';
import { UpdateStaffAvailabilityDto } from '../staff-availability/dto/update-staff-availability.dto';
import { StaffProfilesService } from '../staff-profiles/staff-profiles.service';
import { UpdateStaffProfileDto } from '../staff-profiles/dto/update-staff-profile.dto';
import { StaffTimeOffService } from '../staff-time-off/staff-time-off.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UsersService } from '../users/users.service';

type AuthUser = {
  sub?: string;
  userId?: string;
  _id?: string;
  id?: string;
  tenantId?: string;
  role?: string;
  email?: string;
};

type StaffTimeOffResponseItem = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'requested' | 'approved' | 'denied';
};

type CreateMyTimeOffDto = {
  startDate: string;
  endDate: string;
  reason?: string;
};

@Injectable()
export class StaffService {
  constructor(
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
    private readonly staffProfilesService: StaffProfilesService,
    private readonly staffAvailabilityService: StaffAvailabilityService,
    private readonly staffTimeOffService: StaffTimeOffService,
  ) {}

  private getTenantIdOrThrow(currentUser: AuthUser): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  private getUserIdOrThrow(currentUser: AuthUser): string {
    const userId =
      currentUser?.sub ??
      currentUser?.userId ??
      currentUser?._id ??
      currentUser?.id;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user context');
    }

    return userId;
  }

  private toIsoDateOnly(value: Date | string): string {
    return new Date(value).toISOString().slice(0, 10);
  }

  private toIsoDateTime(value: Date | string): string {
    return new Date(value).toISOString();
  }

  async getMyProfile(currentUser: AuthUser) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const user = await this.usersService.findById(userId);
    const profile = await this.staffProfilesService.findByTenantAndUser(
      tenantId,
      userId,
    );

    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    return {
      id: profile._id.toString(),
      tenantId: profile.tenantId.toString(),
      userId: profile.userId.toString(),
      name: profile.displayName || user?.name || '',
      email: user?.email || '',
      photoUrl: profile.avatarUrl || '',
      bio: profile.bio || '',
      experienceYears: profile.experienceYears || 0,
      expertiseTags: profile.expertise || [],
      isBookable: profile.isBookable,
      isActive: profile.isActive,
    };
  }

  async updateMyProfile(currentUser: AuthUser, dto: UpdateStaffProfileDto) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const updated = await this.staffProfilesService.updateByTenantAndUser(
      tenantId,
      userId,
      dto,
    );

    const user = await this.usersService.findById(userId);

    return {
      id: updated._id.toString(),
      tenantId: updated.tenantId.toString(),
      userId: updated.userId.toString(),
      name: updated.displayName || user?.name || '',
      email: user?.email || '',
      photoUrl: updated.avatarUrl || '',
      bio: updated.bio || '',
      experienceYears: updated.experienceYears || 0,
      expertiseTags: updated.expertise || [],
      isBookable: updated.isBookable,
      isActive: updated.isActive,
    };
  }

  async onboard(currentUser: AuthUser, dto: CreateStaffAccountDto) {
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!['owner', 'manager'].includes(currentUser?.role ?? '')) {
      throw new UnauthorizedException(
        'You are not allowed to create staff members',
      );
    }

    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password: passwordHash,
    });

    const userId = user._id.toString();

    const membership = await this.membershipsService.create({
      tenantId,
      userId,
      role: 'staff',
    });

    const staffProfile = await this.staffProfilesService.create({
      tenantId,
      userId,
      displayName: dto.name.trim(),
      bio: '',
      experienceYears: 0,
      expertise: [],
      isBookable: true,
      isActive: true,
    });

    const defaultAvailability = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
      {
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
      {
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
      {
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
    ];

    await this.staffAvailabilityService.create({
      tenantId,
      userId,
      weeklyAvailability: defaultAvailability.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        breakStartTime: item.breakStartTime,
        breakEndTime: item.breakEndTime,
        isAvailable: true,
      })),
    });

    return {
      message: 'Staff member created successfully',
      account: {
        userId,
        membershipId: membership._id.toString(),
        staffProfileId: staffProfile._id.toString(),
        tenantId,
        role: membership.role,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getMyAvailability(currentUser: AuthUser) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const availability = await this.staffAvailabilityService.findByStaff(
      tenantId,
      userId,
    );

    if (!availability) {
      throw new NotFoundException('Staff availability not found');
    }

    return {
      id: availability._id.toString(),
      tenantId: availability.tenantId.toString(),
      userId: availability.userId.toString(),
      weeklyAvailability: availability.weeklyAvailability ?? [],
    };
  }

  async updateMyAvailability(
    currentUser: AuthUser,
    dto: UpdateStaffAvailabilityDto,
  ) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const updated = await this.staffAvailabilityService.upsertByStaff(
      tenantId,
      userId,
      dto,
    );

    return {
      id: updated._id.toString(),
      tenantId: updated.tenantId.toString(),
      userId: updated.userId.toString(),
      weeklyAvailability: updated.weeklyAvailability ?? [],
    };
  }

  async getMyTimeOff(currentUser: AuthUser): Promise<StaffTimeOffResponseItem[]> {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const items = await this.staffTimeOffService.findAllByStaff(tenantId, userId);

    return items.map((item) => {

      return {
        id: item._id.toString(),
        startDate: this.toIsoDateOnly(item.startDate),
        endDate: this.toIsoDateOnly(item.endDate),
        reason: item.reason || '',
        status: item.status,
      };
    });
  }

  async createMyTimeOff(
    currentUser: AuthUser,
    dto: CreateMyTimeOffDto,
  ): Promise<StaffTimeOffResponseItem> {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    if (dto.startDate > dto.endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const created = await this.staffTimeOffService.create({
      tenantId,
      userId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason?.trim() || '',
    });

    return {
      id: created._id.toString(),
      startDate: this.toIsoDateOnly(created.startDate),
      endDate: this.toIsoDateOnly(created.endDate),
      reason: created.reason || '',
      status: created.status,
    };
  }

  async removeMyTimeOff(currentUser: AuthUser, id: string) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    const userId = this.getUserIdOrThrow(currentUser);

    const items = await this.staffTimeOffService.findAllByStaff(tenantId, userId);
    const existing = items.find((item) => item._id.toString() === id);

    if (!existing) {
      throw new NotFoundException('Staff time off not found');
    }

    await this.staffTimeOffService.remove(id);

    return { message: 'Time off request removed successfully' };
  }
}