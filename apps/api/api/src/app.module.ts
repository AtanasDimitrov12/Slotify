import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsModule } from './tenants/tenants.module';
import { TenantDetailsModule } from './tenant-details/tenant-details.module';
import { AuthModule } from './auth/auth.module';
import { MembershipsModule } from './memberships/memberships.module';
import { StaffProfilesModule } from './staff-profiles/staff-profiles.module';
import { StaffAvailabilityModule } from './staff-availability/staff-availability.module';
import { StaffTimeOffModule } from './staff-time-off/staff-time-off.module';
import { ServicesModule } from './services/services.module';
import { StaffServiceAssignmentsModule } from './staff-service-assignments/staff-service-assignments.module';
import { StaffModule } from './staff/staff.module';

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
    TenantDetailsModule,
    MembershipsModule,
    StaffModule,
    StaffProfilesModule,
    StaffAvailabilityModule,
    StaffTimeOffModule,
    ServicesModule,
    StaffServiceAssignmentsModule,
  ],
})
export class AppModule { }