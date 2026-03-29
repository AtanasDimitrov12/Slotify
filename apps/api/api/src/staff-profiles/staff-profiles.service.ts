import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import type { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import type { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';
import { StaffProfile, type StaffProfileDocument } from './staff-profile.schema';

@Injectable()
export class StaffProfilesService {
  constructor(
    @InjectModel(StaffProfile.name)
    private readonly staffProfileModel: Model<StaffProfileDocument>,
  ) {}

  create(dto: CreateStaffProfileDto) {
    if (!Types.ObjectId.isValid(dto.tenantId)) {
      throw new BadRequestException('Invalid tenantId');
    }

    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.staffProfileModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
    });
  }

  findAllByTenant(tenantId: string) {
    return this.staffProfileModel.find({ tenantId, isActive: true }).lean();
  }

  findOne(id: string) {
    return this.staffProfileModel.findById(id).lean();
  }

  findByTenantAndUser(tenantId: string, userId: string) {
    if (!Types.ObjectId.isValid(tenantId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid tenantId or userId');
    }

    return this.staffProfileModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .lean();
  }

  async update(id: string, dto: UpdateStaffProfileDto) {
    const updated = await this.staffProfileModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('Staff profile not found');
    return updated;
  }

  async updateByTenantAndUser(tenantId: string, userId: string, dto: UpdateStaffProfileDto) {
    const updated = await this.staffProfileModel
      .findOneAndUpdate(
        {
          tenantId: new Types.ObjectId(tenantId),
          userId: new Types.ObjectId(userId),
          isActive: true,
        },
        { $set: dto },
        { new: true },
      )
      .lean();

    if (!updated) throw new NotFoundException('Staff profile not found');

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.staffProfileModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();

    if (!deleted) throw new NotFoundException('Staff profile not found');
    return deleted;
  }
}
