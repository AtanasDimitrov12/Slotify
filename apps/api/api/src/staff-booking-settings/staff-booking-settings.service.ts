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
  ) { }

  async getOrCreateByStaff(tenantId: string, userId: string) {
    return this.staffBookingSettingsModel
      .findOneAndUpdate(
        {
          tenantId: new Types.ObjectId(tenantId),
          userId: new Types.ObjectId(userId),
        },
        {
          $setOnInsert: {
            tenantId: new Types.ObjectId(tenantId),
            userId: new Types.ObjectId(userId),
            useGlobalSettings: true,
            overrides: {},
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      )
      .lean();
  }

  async updateByStaff(
    tenantId: string,
    userId: string,
    dto: UpdateStaffBookingSettingsDto,
  ) {
    const setPayload: Record<string, unknown> = {};

    if (dto.useGlobalSettings !== undefined) {
      setPayload.useGlobalSettings = dto.useGlobalSettings;
    }

    if (dto.overrides !== undefined) {
      const hasOverrides = Object.keys(dto.overrides).length > 0;

      if (hasOverrides) {
        setPayload.overrides = dto.overrides;
      }
    }

    return this.staffBookingSettingsModel
      .findOneAndUpdate(
        {
          tenantId: new Types.ObjectId(tenantId),
          userId: new Types.ObjectId(userId),
        },
        {
          $set: setPayload,
          $setOnInsert: {
            tenantId: new Types.ObjectId(tenantId),
            userId: new Types.ObjectId(userId),
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      )
      .lean();
  }

  //TODO: When useGlobalSettings is true, overrides remain stored
  //TODO: so staff can later switch back to custom settings without losing them.

  private mergeWithGlobalSettings(globalSettings: any, overrides: any) {
    if (!overrides) return globalSettings;

    return {
      ...globalSettings,
      ...overrides,

      bufferBefore: {
        ...globalSettings.bufferBefore,
        ...(overrides.bufferBefore ?? {}),
      },

      bufferAfter: {
        ...globalSettings.bufferAfter,
        ...(overrides.bufferAfter ?? {}),
      },
    };
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
      effectiveSettings: this.mergeWithGlobalSettings(
        globalSettings,
        staffSettings.overrides,
      ),
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