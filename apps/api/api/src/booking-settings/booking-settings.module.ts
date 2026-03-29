import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSettingsController } from './booking-settings.controller';
import { BookingSettingsService } from './booking-settings.service';
import {
  TenantBookingSettings,
  TenantBookingSettingsSchema,
} from './tenant-booking-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantBookingSettings.name, schema: TenantBookingSettingsSchema },
    ]),
  ],
  providers: [BookingSettingsService],
  controllers: [BookingSettingsController],
  exports: [BookingSettingsService],
})
export class BookingSettingsModule {}
