import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantBookingSettings,
  TenantBookingSettingsSchema,
} from '../booking-settings/tenant-booking-settings.schema';
import { Reservation, ReservationSchema } from '../reservations/reservation.schema';
import { ReservationLock, ReservationLockSchema } from '../reservations/reservation-lock.schema';
import { Service, ServiceSchema } from '../services/service.schema';
import {
  StaffAvailability,
  StaffAvailabilitySchema,
} from '../staff-availability/staff-availability.schema';
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
import { Tenant, TenantSchema } from '../tenants/tenant.schema';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantDetails.name, schema: TenantDetailsSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: StaffAvailability.name, schema: StaffAvailabilitySchema },
      { name: StaffTimeOff.name, schema: StaffTimeOffSchema },
      {
        name: StaffServiceAssignment.name,
        schema: StaffServiceAssignmentSchema,
      },
      { name: TenantBookingSettings.name, schema: TenantBookingSettingsSchema },
      { name: StaffBookingSettings.name, schema: StaffBookingSettingsSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: ReservationLock.name, schema: ReservationLockSchema },
    ]),
  ],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
  exports: [PublicBookingService],
})
export class PublicBookingModule {}
