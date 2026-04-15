import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { CreateStaffBlockedSlotDto, UpdateStaffBlockedSlotDto } from './dto/staff-blocked-slot.dto';
import { StaffBlockedSlot, type StaffBlockedSlotDocument } from './staff-blocked-slot.schema';

@Injectable()
export class StaffBlockedSlotService {
  constructor(
    @InjectModel(StaffBlockedSlot.name)
    private readonly blockedSlotModel: Model<StaffBlockedSlotDocument>,
  ) {}

  private mapSlot(doc: any) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return {
      id: _id.toString(),
      ...rest,
    };
  }

  private validateFuture(date: string, startTime: string) {
    const slotStart = new Date(`${date}T${startTime}:00`);
    if (slotStart < new Date()) {
      throw new BadRequestException('Cannot set or modify blocked slots in the past');
    }
  }

  async create(dto: CreateStaffBlockedSlotDto) {
    this.validateFuture(dto.date, dto.startTime);

    const created = await this.blockedSlotModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
      isActive: true,
    });
    return this.mapSlot(created.toObject());
  }

  async findAllByStaff(userId: string, includeInactive = false) {
    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    if (!includeInactive) {
      query.isActive = true;
    }

    const items = await this.blockedSlotModel.find(query).sort({ date: -1, startTime: -1 }).lean();
    return items.map((item) => this.mapSlot(item));
  }

  async findActiveByStaffAndDateRange(userId: string, start: Date, end: Date) {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const items = await this.blockedSlotModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        date: { $gte: startStr, $lte: endStr },
      })
      .lean();
    return items.map((item) => this.mapSlot(item));
  }

  async update(id: string, dto: UpdateStaffBlockedSlotDto) {
    const existing = await this.blockedSlotModel.findById(id).lean();
    if (!existing) throw new NotFoundException('Blocked slot not found');

    // Prevent editing if the slot is already in the past
    this.validateFuture(existing.date, existing.startTime);

    // If updating to a new time, ensure the new time is also in the future
    if (dto.date || dto.startTime) {
      this.validateFuture(dto.date ?? existing.date, dto.startTime ?? existing.startTime);
    }

    const updated = await this.blockedSlotModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean();

    if (!updated) throw new NotFoundException('Blocked slot not found');
    return this.mapSlot(updated);
  }

  async remove(id: string) {
    const existing = await this.blockedSlotModel.findById(id).lean();
    if (!existing) throw new NotFoundException('Blocked slot not found');

    // Prevent deactivating if the slot is already in the past
    this.validateFuture(existing.date, existing.startTime);

    // Instead of deleting, set isActive to false
    const updated = await this.blockedSlotModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { returnDocument: 'after' })
      .lean();

    if (!updated) throw new NotFoundException('Blocked slot not found');
    return this.mapSlot(updated);
  }
}
