import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantBookingSettings,
  TenantBookingSettingsSchema,
} from '../booking-settings/tenant-booking-settings.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../customer-profiles/customer-profile.schema';
import { MembershipsModule } from '../memberships/memberships.module';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import {
  StaffAvailability,
  StaffAvailabilitySchema,
} from '../staff-availability/staff-availability.schema';
import {
  StaffBlockedSlot,
  StaffBlockedSlotSchema,
} from '../staff-blocked-slots/staff-blocked-slot.schema';
import {
  StaffBookingSettings,
  StaffBookingSettingsSchema,
} from '../staff-booking-settings/staff-booking-settings.schema';
import { StaffProfile, StaffProfileSchema } from '../staff-profiles/staff-profile.schema';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentSchema,
} from '../staff-service-assignments/staff-service-assignment.schema';
import { StaffTimeOff, StaffTimeOffSchema } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails, TenantDetailsSchema } from '../tenant-details/tenant-details.schema';
import { User, UserSchema } from '../users/user.schema';
import { StaffAppointmentsController } from './staff-appointments.controller';
import { StaffAppointmentsService } from './staff-appointments.service';

@Module({
  imports: [
    MembershipsModule,
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      {
        name: StaffServiceAssignment.name,
        schema: StaffServiceAssignmentSchema,
      },
      { name: StaffAvailability.name, schema: StaffAvailabilitySchema },
      { name: StaffTimeOff.name, schema: StaffTimeOffSchema },
      { name: StaffBlockedSlot.name, schema: StaffBlockedSlotSchema },
      { name: TenantDetails.name, schema: TenantDetailsSchema },
      { name: TenantBookingSettings.name, schema: TenantBookingSettingsSchema },
      { name: StaffBookingSettings.name, schema: StaffBookingSettingsSchema },
      { name: User.name, schema: UserSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [StaffAppointmentsController],
  providers: [StaffAppointmentsService],
})
export class StaffAppointmentsModule {}
