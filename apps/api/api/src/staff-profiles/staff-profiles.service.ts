import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';
import { StaffProfile, type StaffProfileDocument } from './staff-profile.schema';

@Injectable()
export class StaffProfilesService {
  constructor(
    @InjectModel(StaffProfile.name)
    private readonly staffProfileModel: Model<StaffProfileDocument>,
  ) {}

  async upsert(userId: string, dto: UpdateStaffProfileDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.staffProfileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: { ...dto, userId: new Types.ObjectId(userId) } },
        { upsert: true, returnDocument: 'after' },
      )
      .lean();
  }

  create(dto: CreateStaffProfileDto) {
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.staffProfileModel.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    });
  }

  findByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    return this.staffProfileModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .lean();
  }

  // Backwards compatibility for findAnyByUserId
  findAnyByUserId(userId: string) {
    return this.findByUserId(userId);
  }

  findOne(id: string) {
    return this.staffProfileModel.findById(id).lean();
  }

  async update(id: string, dto: UpdateStaffProfileDto) {
    const updated = await this.staffProfileModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean();

    if (!updated) throw new NotFoundException('Staff profile not found');
    return updated;
  }

  async updateByUserId(userId: string, dto: UpdateStaffProfileDto) {
    const updated = await this.staffProfileModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          isActive: true,
        },
        { $set: dto },
        { returnDocument: 'after' },
      )
      .lean();

    if (!updated) throw new NotFoundException('Staff profile not found');

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.staffProfileModel
      .findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' })
      .lean();

    if (!deleted) throw new NotFoundException('Staff profile not found');
    return deleted;
  }
}
