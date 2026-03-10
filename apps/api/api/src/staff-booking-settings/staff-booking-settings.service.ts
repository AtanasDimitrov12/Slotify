import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StaffBookingSettings,
  StaffBookingSettingsDocument,
} from './staff-booking-settings.schema';
import { UpdateStaffBookingSettingsDto } from './dto/update-staff-booking-settings.dto';
import { BookingSettingsService } from '../booking-settings/booking-settings.service';

@Injectable()
export class StaffBookingSettingsService {
  constructor(
    @InjectModel(StaffBookingSettings.name)
    private readonly staffBookingSettingsModel: Model<StaffBookingSettingsDocument>,
    private readonly bookingSettingsService: BookingSettingsService,
  ) {}

  async createDefaultForStaff(tenantId: string, userId: string) {
    const existing = await this.staffBookingSettingsModel
      .findOne({ tenantId, userId })
      .lean();

    if (existing) return existing;

    const created = await this.staffBookingSettingsModel.create({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      useGlobalSettings: true,
      overrides: {},
    });

    return created.toObject();
  }

  async getOrCreateByStaff(tenantId: string, userId: string) {
    const existing = await this.staffBookingSettingsModel
      .findOne({ tenantId, userId })
      .lean();

    if (existing) return existing;

    return this.createDefaultForStaff(tenantId, userId);
  }

  async updateByStaff(
    tenantId: string,
    userId: string,
    dto: UpdateStaffBookingSettingsDto,
  ) {
    return this.staffBookingSettingsModel
      .findOneAndUpdate(
        {
          tenantId: new Types.ObjectId(tenantId),
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            ...(dto.useGlobalSettings !== undefined
              ? { useGlobalSettings: dto.useGlobalSettings }
              : {}),
            ...(dto.overrides ? { overrides: dto.overrides } : {}),
          },
          $setOnInsert: {
            tenantId: new Types.ObjectId(tenantId),
            userId: new Types.ObjectId(userId),
          },
        },
        { new: true, upsert: true },
      )
      .lean();
  }

  async getEffectiveSettings(tenantId: string, userId: string) {
    const globalSettings =
      await this.bookingSettingsService.getOrCreateByTenantId(tenantId);

    const staffSettings = await this.getOrCreateByStaff(tenantId, userId);

    if (staffSettings.useGlobalSettings) {
      return {
        source: 'global',
        globalSettings,
        staffSettings,
        effectiveSettings: globalSettings,
      };
    }

    return {
      source: 'custom',
      globalSettings,
      staffSettings,
      effectiveSettings: {
        ...globalSettings,
        ...(staffSettings.overrides ?? {}),
      },
    };
  }

  async findByStaff(tenantId: string, userId: string) {
    const doc = await this.staffBookingSettingsModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .lean();

    if (!doc) {
      throw new NotFoundException('Staff booking settings not found');
    }

    return doc;
  }
}