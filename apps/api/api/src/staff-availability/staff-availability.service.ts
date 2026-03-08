import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffAvailability, StaffAvailabilityDocument } from './staff-availability.schema';
import { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';

@Injectable()
export class StaffAvailabilityService {
  constructor(
    @InjectModel(StaffAvailability.name)
    private readonly availabilityModel: Model<StaffAvailabilityDocument>,
  ) { }

  create(dto: CreateStaffAvailabilityDto) {
    return this.availabilityModel.create({
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
      weeklyAvailability: dto.weeklyAvailability,
    });
  }

  findByStaff(tenantId: string, userId: string) {
    return this.availabilityModel
      .findOne({ tenantId, userId })
      .lean();
  }

  findAllByStaff(tenantId: string, userId: string) {
    return this.availabilityModel
      .find({ tenantId, userId })
      .sort({ dayOfWeek: 1 })
      .lean();
  }

  async updateDay(userId: string, dayOfWeek: number, data: any) {

  return this.availabilityModel.updateOne(
    { userId, "weeklyAvailability.dayOfWeek": dayOfWeek },
    {
      $set: {
        "weeklyAvailability.$": data
      }
    }
  );
}

  async update(id: string, dto: UpdateStaffAvailabilityDto) {
    const updated = await this.availabilityModel
      .findByIdAndUpdate(id, dto, { new: true })
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