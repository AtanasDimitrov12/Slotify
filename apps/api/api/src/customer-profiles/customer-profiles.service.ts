import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerProfile, type CustomerProfileDocument } from './customer-profile.schema';
import type { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import type { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomerProfilesService {
  constructor(
    @InjectModel(CustomerProfile.name)
    private readonly customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async create(dto: CreateCustomerProfileDto): Promise<CustomerProfileDocument> {
    const profile = new this.customerProfileModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      preferredServiceIds: dto.preferredServiceIds?.map((id) => new Types.ObjectId(id)),
      favoriteSalonIds: dto.favoriteSalonIds?.map((id) => new Types.ObjectId(id)),
      preferredStaffIds: dto.preferredStaffIds?.map((id) => new Types.ObjectId(id)),
      birthday: dto.birthday ? new Date(dto.birthday) : null,
    });
    return profile.save();
  }

  async findByUserId(userId: string): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
  }

  async updateByUserId(
    userId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDocument> {
    const updateData: any = { ...dto };

    if (dto.preferredServiceIds) {
      updateData.preferredServiceIds = dto.preferredServiceIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.favoriteSalonIds) {
      updateData.favoriteSalonIds = dto.favoriteSalonIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.preferredStaffIds) {
      updateData.preferredStaffIds = dto.preferredStaffIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.birthday) {
      updateData.birthday = new Date(dto.birthday);
    }

    const updated = await this.customerProfileModel
      .findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { $set: updateData }, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Customer profile not found');
    }

    return updated as CustomerProfileDocument;
  }

  async getOrCreateByUserId(userId: string, defaultPhone = ''): Promise<CustomerProfileDocument> {
    let profile = await this.findByUserId(userId);

    if (!profile) {
      profile = await this.create({
        userId,
        phone: defaultPhone,
      });
    }

    return profile as CustomerProfileDocument;
  }

  async getBookingPreferences(userId: string) {
    const profile = await this.findByUserId(userId);
    if (!profile) return null;

    return {
      preferredTimeOfDay: profile.preferredTimeOfDay,
      preferredDaysOfWeek: profile.preferredDaysOfWeek,
      preferredServiceIds: profile.preferredServiceIds,
      favoriteSalonIds: profile.favoriteSalonIds,
      preferredStaffIds: profile.preferredStaffIds,
    };
  }
}
