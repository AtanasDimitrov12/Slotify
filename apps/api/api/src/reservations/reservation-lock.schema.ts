import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';
import { Service } from '../services/service.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';

export type ReservationLockDocument = HydratedDocument<ReservationLock>;

@Schema({ timestamps: true })
export class ReservationLock {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  staffId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StaffServiceAssignment.name,
    required: true,
    index: true,
  })
  staffServiceAssignmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Service.name, required: true, index: true })
  serviceId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  startTime!: Date;

  @Prop({ required: true, index: true })
  endTime!: Date;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ trim: true, maxlength: 120 })
  customerName?: string;

  @Prop({ trim: true, lowercase: true, maxlength: 200 })
  customerEmail?: string;

  @Prop({ trim: true, maxlength: 64, default: 'public-booking' })
  source!: string;
}

export const ReservationLockSchema = SchemaFactory.createForClass(ReservationLock);

ReservationLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ReservationLockSchema.index({ tenantId: 1, staffId: 1, startTime: 1, endTime: 1 });
ReservationLockSchema.index({
  tenantId: 1,
  staffId: 1,
  staffServiceAssignmentId: 1,
  startTime: 1,
  endTime: 1,
});