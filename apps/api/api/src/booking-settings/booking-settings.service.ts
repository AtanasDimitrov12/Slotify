import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { UpsertTenantBookingSettingsDto } from './dto/upsert-tenant-booking-settings.dto';
import {
  TenantBookingSettings,
  type TenantBookingSettingsDocument,
} from './tenant-booking-settings.schema';

@Injectable()
export class BookingSettingsService {
  constructor(
    @InjectModel(TenantBookingSettings.name)
    private readonly tenantBookingSettingsModel: Model<TenantBookingSettingsDocument>,
  ) {}

  async upsertByTenantId(tenantId: string, dto: UpsertTenantBookingSettingsDto) {
    const updated = await this.tenantBookingSettingsModel
      .findOneAndUpdate(
        { tenantId: new Types.ObjectId(tenantId) },
        { $set: dto },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean();

    return updated;
  }

  async getOrCreateByTenantId(tenantId: string) {
    return this.tenantBookingSettingsModel
      .findOneAndUpdate(
        { tenantId: new Types.ObjectId(tenantId) },
        {
          $setOnInsert: {
            tenantId: new Types.ObjectId(tenantId),
            bufferBefore: { enabled: false, minutes: 0 },
            bufferAfter: { enabled: true, minutes: 5 },
            minimumNoticeMinutes: 60,
            maximumDaysInAdvance: 30,
            autoConfirmReservations: true,
            allowBookingToEndAfterWorkingHours: false,
            allowCustomerChooseSpecificStaff: true,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean();
  }
}
