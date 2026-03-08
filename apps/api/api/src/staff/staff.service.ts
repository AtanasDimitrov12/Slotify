import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { MembershipsService } from '../memberships/memberships.service';
import { StaffAvailabilityService } from '../staff-availability/staff-availability.service';
import { StaffProfilesService } from '../staff-profiles/staff-profiles.service';
import { UsersService } from '../users/users.service';
import { CreateStaffAccountDto } from './dto/create-staff-account.dto';

@Injectable()
export class StaffService {
  constructor(
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
    private readonly staffProfilesService: StaffProfilesService,
    private readonly staffAvailabilityService: StaffAvailabilityService,
  ) { }

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
      displayName: '',
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

  async findAllForTenant(currentUser: any) {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!['owner'].includes(currentUser?.role)) {
      throw new UnauthorizedException('You are not allowed to view staff members');
    }

    const memberships = await this.membershipsService.findByTenantAndRole(tenantId, 'staff');

    const staff = await Promise.all(
      memberships.map(async (membership: any) => {
        const user = await this.usersService.findById(membership.userId);

        return {
          userId: membership.userId,
          membershipId: membership._id.toString(),
          tenantId: membership.tenantId,
          role: membership.role,
          name: user?.name ?? '',
          email: user?.email ?? '',
        };
      }),
    );

    return staff;
  }
}