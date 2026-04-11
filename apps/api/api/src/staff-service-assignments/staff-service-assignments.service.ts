import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { CreateStaffServiceAssignmentDto } from './dto/create-staff-service-assignment.dto';
import { UpdateStaffServiceAssignmentDto } from './dto/update-staff-service-assignment.dto';
import {
  StaffServiceAssignment,
  type StaffServiceAssignmentDocument,
} from './staff-service-assignment.schema';

@Injectable()
export class StaffServiceAssignmentsService {
  constructor(
    @InjectModel(StaffServiceAssignment.name)
    private readonly assignmentModel: Model<StaffServiceAssignmentDocument>,
  ) {}

  create(dto: CreateStaffServiceAssignmentDto) {
    return this.assignmentModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      userId: new Types.ObjectId(dto.userId),
      serviceId: new Types.ObjectId(dto.serviceId),
    });
  }

  findAllByStaff(tenantId: string, userId: string) {
    return this.assignmentModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        isOffered: true,
      })
      .populate('serviceId')
      .lean();
  }

  async update(id: string, dto: UpdateStaffServiceAssignmentDto) {
    const updated = await this.assignmentModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .populate('serviceId')
      .lean();

    if (!updated) {
      throw new NotFoundException('Staff service assignment not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.assignmentModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new NotFoundException('Staff service assignment not found');
    }

    return deleted;
  }
}
