import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';
import {
  DayAvailability,
  StaffAvailability,
  type StaffAvailabilityDocument,
} from './staff-availability.schema';

@Injectable()
export class StaffAvailabilityService {
  constructor(
    @InjectModel(StaffAvailability.name)
    private readonly availabilityModel: Model<StaffAvailabilityDocument>,
  ) {}

  create(dto: CreateStaffAvailabilityDto) {
    return this.availabilityModel.create({
      userId: new Types.ObjectId(dto.userId),
      weeklyAvailability: dto.weeklyAvailability.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => ({
          ...slot,
          tenantId: new Types.ObjectId(slot.tenantId),
          isAvailable: slot.isAvailable ?? true,
        })),
        isAvailable: day.isAvailable ?? true,
      })),
    });
  }

  findByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    return this.availabilityModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .lean();
  }

  findByStaff(_tenantId: string, userId: string) {
    // Current implementation ignores tenantId because availability is stored per-user
    // but the slots inside contain tenantId. This method is used by tests and some services.
    return this.findByUser(userId);
  }

  async upsertByUser(userId: string, weeklyAvailability: DayAvailability[]) {
    return this.availabilityModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
        },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            weeklyAvailability,
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .lean();
  }

  async update(id: string, dto: UpdateStaffAvailabilityDto) {
    const updated = await this.availabilityModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
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
