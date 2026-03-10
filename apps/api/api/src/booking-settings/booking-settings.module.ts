import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantBookingSettings,
  TenantBookingSettingsSchema,
} from './tenant-booking-settings.schema';
import { BookingSettingsService } from './booking-settings.service';
import { BookingSettingsController } from './booking-settings.controller';

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