import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffAppointmentsController } from './staff-appointments.controller';
import { StaffAppointmentsService } from './staff-appointments.service';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import { StaffProfile, StaffProfileSchema } from '../staff-profiles/staff-profile.schema';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentSchema,
} from '../staff-service-assignments/staff-service-assignment.schema';
import {
  StaffAvailability,
  StaffAvailabilitySchema,
} from '../staff-availability/staff-availability.schema';
import { StaffTimeOff, StaffTimeOffSchema } from '../staff-time-off/staff-time-off.schema';
import { TenantDetails, TenantDetailsSchema } from '../tenant-details/tenant-details.schema';
import {
  TenantBookingSettings,
  TenantBookingSettingsSchema,
} from '../booking-settings/tenant-booking-settings.schema';
import {
  StaffBookingSettings,
  StaffBookingSettingsSchema,
} from '../staff-booking-settings/staff-booking-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: StaffServiceAssignment.name, schema: StaffServiceAssignmentSchema },
      { name: StaffAvailability.name, schema: StaffAvailabilitySchema },
      { name: StaffTimeOff.name, schema: StaffTimeOffSchema },
      { name: TenantDetails.name, schema: TenantDetailsSchema },
      { name: TenantBookingSettings.name, schema: TenantBookingSettingsSchema },
      { name: StaffBookingSettings.name, schema: StaffBookingSettingsSchema },
    ]),
  ],
  controllers: [StaffAppointmentsController],
  providers: [StaffAppointmentsService],
})
export class StaffAppointmentsModule {}