import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingSettingsModule } from './booking-settings/booking-settings.module';
import { MembershipsModule } from './memberships/memberships.module';
import { OwnerModule } from './owner/owner.module';
import { PublicBookingModule } from './public-booking/public-booking.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ServicesModule } from './services/services.module';
import { StaffModule } from './staff/staff.module';
import { StaffAppointmentsModule } from './staff-appointments/staff-appointments.module';
import { StaffAvailabilityModule } from './staff-availability/staff-availability.module';
import { StaffBookingSettingsModule } from './staff-booking-settings/staff-booking-settings.module';
import { StaffProfilesModule } from './staff-profiles/staff-profiles.module';
import { StaffServiceAssignmentsModule } from './staff-service-assignments/staff-service-assignments.module';
import { StaffTimeOffModule } from './staff-time-off/staff-time-off.module';
import { TenantDetailsModule } from './tenant-details/tenant-details.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    TenantsModule,
    OwnerModule,
    TenantDetailsModule,
    MembershipsModule,
    StaffModule,
    StaffProfilesModule,
    StaffAvailabilityModule,
    StaffTimeOffModule,
    ServicesModule,
    StaffServiceAssignmentsModule,
    BookingSettingsModule,
    StaffBookingSettingsModule,
    ReservationsModule,
    PublicBookingModule,
    StaffAppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
