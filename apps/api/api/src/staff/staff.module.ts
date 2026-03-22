import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { StaffProfilesModule } from '../staff-profiles/staff-profiles.module';
import { StaffAvailabilityModule } from '../staff-availability/staff-availability.module';
import { StaffTimeOffModule } from '../staff-time-off/staff-time-off.module';
import { StaffServiceAssignmentsModule } from '../staff-service-assignments/staff-service-assignments.module';
import { ServicesModule } from '../services/services.module';
import { StaffBookingSettingsModule } from '../staff-booking-settings/staff-booking-settings.module';

@Module({
  imports: [
    UsersModule,
    MembershipsModule,
    StaffProfilesModule,
    StaffAvailabilityModule,
    StaffTimeOffModule,
    StaffServiceAssignmentsModule,
    ServicesModule,
    StaffBookingSettingsModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}