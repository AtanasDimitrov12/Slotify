import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { StaffProfilesModule } from '../staff-profiles/staff-profiles.module';
import { StaffAvailabilityModule } from '../staff-availability/staff-availability.module';
import { StaffTimeOffModule } from 'src/staff-time-off/staff-time-off.module';

@Module({
  imports: [
    UsersModule,
    MembershipsModule,
    StaffProfilesModule,
    StaffAvailabilityModule,
    StaffTimeOffModule
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}