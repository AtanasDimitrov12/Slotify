import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import type { CreateStaffTimeOffDto } from './dto/create-staff-time-off.dto';
import type { UpdateStaffTimeOffDto } from './dto/update-staff-time-off.dto';
import { StaffTimeOff, type StaffTimeOffDocument } from './staff-time-off.schema';

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
      status: 'requested',
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
      .findByIdAndUpdate(id, { $set: payload }, { returnDocument: 'after' })
      .lean();

    if (!updated) throw new NotFoundException('Staff time off not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.timeOffModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Staff time off not found');
    return deleted;
  }

  async findAllForOwnerByStaff(tenantId: string, userId: string) {
    return this.timeOffModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ status: 1, startDate: -1, createdAt: -1 })
      .lean();
  }

  async getPendingCountsByTenant(tenantId: string) {
    const results = await this.timeOffModel.aggregate([
      {
        $match: {
          tenantId: new Types.ObjectId(tenantId),
          status: 'requested',
        },
      },
      {
        $group: {
          _id: '$userId',
          pendingCount: { $sum: 1 },
        },
      },
    ]);

    return results.map((item) => ({
      userId: item._id.toString(),
      pendingCount: item.pendingCount,
    }));
  }

  async reviewRequest(tenantId: string, requestId: string, status: 'approved' | 'denied') {
    if (!['approved', 'denied'].includes(status)) {
      throw new BadRequestException('Invalid review status');
    }

    const updated = await this.timeOffModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(requestId),
          tenantId: new Types.ObjectId(tenantId),
        },
        {
          $set: { status },
        },
        {
          returnDocument: 'after',
        },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException('Staff time off request not found');
    }

    return updated;
  }
}
