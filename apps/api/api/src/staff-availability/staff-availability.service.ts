import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import type { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import type { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';
import { StaffAvailability, type StaffAvailabilityDocument } from './staff-availability.schema';

@Injectable()
export class StaffAvailabilityService {
  constructor(
    @InjectModel(StaffAvailability.name)
    private readonly availabilityModel: Model<StaffAvailabilityDocument>,
  ) {}

  create(dto: CreateStaffAvailabilityDto) {
    return this.availabilityModel.create({
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
      weeklyAvailability: dto.weeklyAvailability,
    });
  }

  findByStaff(tenantId: string, userId: string) {
    return this.availabilityModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .lean();
  }

  async upsertByStaff(tenantId: string, userId: string, dto: UpdateStaffAvailabilityDto) {
    return this.availabilityModel
      .findOneAndUpdate(
        {
          tenantId: new Types.ObjectId(tenantId),
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            tenantId: new Types.ObjectId(tenantId),
            userId: new Types.ObjectId(userId),
            weeklyAvailability: dto.weeklyAvailability,
          },
        },
        { new: true, upsert: true },
      )
      .lean();
  }

  async update(id: string, dto: UpdateStaffAvailabilityDto) {
    const updated = await this.availabilityModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('Staff availability not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.availabilityModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Staff availability not found');
    return deleted;
  }
}
