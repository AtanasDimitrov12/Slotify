import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StaffTimeOff, StaffTimeOffDocument } from './staff-time-off.schema';
import { CreateStaffTimeOffDto } from './dto/create-staff-time-off.dto';
import { UpdateStaffTimeOffDto } from './dto/update-staff-time-off.dto';

@Injectable()
export class StaffTimeOffService {
  constructor(
    @InjectModel(StaffTimeOff.name)
    private readonly timeOffModel: Model<StaffTimeOffDocument>,
  ) {}

  create(dto: CreateStaffTimeOffDto) {
    return this.timeOffModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  findAllByStaff(tenantId: string, userId: string) {
    return this.timeOffModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
  }

  async update(id: string, dto: UpdateStaffTimeOffDto) {
    const payload = {
      ...dto,
      ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
    };

    const updated = await this.timeOffModel
      .findByIdAndUpdate(id, { $set: payload }, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('Staff time off not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.timeOffModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Staff time off not found');
    return deleted;
  }
}