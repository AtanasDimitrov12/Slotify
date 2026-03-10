import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StaffBookingSettings,
  StaffBookingSettingsSchema,
} from './staff-booking-settings.schema';
import { StaffBookingSettingsService } from './staff-booking-settings.service';
import { StaffBookingSettingsController } from './staff-booking-settings.controller';
import { BookingSettingsModule } from '../booking-settings/booking-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffBookingSettings.name, schema: StaffBookingSettingsSchema },
    ]),
    BookingSettingsModule,
  ],
  providers: [StaffBookingSettingsService],
  controllers: [StaffBookingSettingsController],
  exports: [StaffBookingSettingsService],
})
export class StaffBookingSettingsModule {}