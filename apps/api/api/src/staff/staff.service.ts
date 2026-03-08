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
import { StaffProfilesService } from '../staff-profiles/staff-profiles.service';
import { UsersService } from '../users/users.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';
import { UpdateStaffProfileDto } from '../staff-profiles/dto/update-staff-profile.dto';
import { UpdateStaffAvailabilityDto } from '../staff-availability/dto/update-staff-availability.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
    private readonly staffProfilesService: StaffProfilesService,
    private readonly staffAvailabilityService: StaffAvailabilityService,
  ) { }

  async getMyProfile(currentUser: any) {
    const tenantId = currentUser?.tenantId;
    const userId = currentUser?.sub || currentUser?.userId || currentUser?._id;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user context');
    }

    const user = await this.usersService.findById(userId);
    const profile = await this.staffProfilesService.findByTenantAndUser(tenantId, userId);

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

  async updateMyProfile(currentUser: any, dto: UpdateStaffProfileDto) {
    const tenantId = currentUser?.tenantId;
    const userId = currentUser?.sub || currentUser?.userId || currentUser?._id;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user context');
    }

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

  async onboard(currentUser: any, dto: CreateStaffAccountDto) {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!['owner', 'manager'].includes(currentUser?.role)) {
      throw new UnauthorizedException('You are not allowed to create staff members');
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
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
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

  async getMyAvailability(currentUser: any) {
    const tenantId = currentUser?.tenantId;
    const userId = currentUser?.sub || currentUser?.userId || currentUser?._id || currentUser?.id;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user context');
    }

    const availability = await this.staffAvailabilityService.findByStaff(tenantId, userId);

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

  async updateMyAvailability(currentUser: any, dto: UpdateStaffAvailabilityDto) {
    const tenantId = currentUser?.tenantId;
    const userId = currentUser?.sub || currentUser?.userId || currentUser?._id || currentUser?.id;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user context');
    }

    const updated = await this.staffAvailabilityService.upsertByStaff(tenantId, userId, dto);

    return {
      id: updated!._id.toString(),
      tenantId: updated!.tenantId.toString(),
      userId: updated!.userId.toString(),
      weeklyAvailability: updated!.weeklyAvailability ?? [],
    };
  }
}