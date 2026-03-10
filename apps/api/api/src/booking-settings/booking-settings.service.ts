import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TenantBookingSettings,
  TenantBookingSettingsDocument,
} from './tenant-booking-settings.schema';
import { UpsertTenantBookingSettingsDto } from './dto/upsert-tenant-booking-settings.dto';

@Injectable()
export class BookingSettingsService {
  constructor(
    @InjectModel(TenantBookingSettings.name)
    private readonly tenantBookingSettingsModel: Model<TenantBookingSettingsDocument>,
  ) {}

  async createDefaultsForTenant(tenantId: string) {
    const existing = await this.tenantBookingSettingsModel.findOne({ tenantId }).lean();
    if (existing) return existing;

    const created = await this.tenantBookingSettingsModel.create({
      tenantId: new Types.ObjectId(tenantId),
      bufferBefore: { enabled: false, minutes: 0 },
      bufferAfter: { enabled: true, minutes: 5 },
      minimumNoticeMinutes: 60,
      maximumDaysInAdvance: 30,
      autoConfirmReservations: true,
      allowBookingToEndAfterWorkingHours: false,
      allowCustomerChooseSpecificStaff: true,
    });

    return created.toObject();
  }

  async findByTenantId(tenantId: string) {
    const settings = await this.tenantBookingSettingsModel.findOne({ tenantId }).lean();

    if (!settings) {
      throw new NotFoundException('Tenant booking settings not found');
    }

    return settings;
  }

  async upsertByTenantId(tenantId: string, dto: UpsertTenantBookingSettingsDto) {
    const updated = await this.tenantBookingSettingsModel
      .findOneAndUpdate(
        { tenantId: new Types.ObjectId(tenantId) },
        { $set: dto },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean();

    return updated;
  }

  async getOrCreateByTenantId(tenantId: string) {
    const existing = await this.tenantBookingSettingsModel.findOne({ tenantId }).lean();
    if (existing) return existing;
    return this.createDefaultsForTenant(tenantId);
  }
}