import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { StaffProfilesModule } from '../staff-profiles/staff-profiles.module';
import { StaffAvailabilityModule } from '../staff-availability/staff-availability.module';

@Module({
  imports: [
    UsersModule,
    MembershipsModule,
    StaffProfilesModule,
    StaffAvailabilityModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}