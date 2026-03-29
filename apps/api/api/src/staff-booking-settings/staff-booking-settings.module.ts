import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSettingsModule } from '../booking-settings/booking-settings.module';
import { StaffBookingSettingsController } from './staff-booking-settings.controller';
import { StaffBookingSettings, StaffBookingSettingsSchema } from './staff-booking-settings.schema';
import { StaffBookingSettingsService } from './staff-booking-settings.service';

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
