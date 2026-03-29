import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffTimeOffDocument = HydratedDocument<StaffTimeOff>;
export type StaffTimeOffStatus = 'requested' | 'approved' | 'denied';

@Schema({ timestamps: true })
export class StaffTimeOff {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ trim: true, default: '' })
  reason?: string;

  @Prop({
    required: true,
    enum: ['requested', 'approved', 'denied'],
    default: 'requested',
    index: true,
  })
  status!: StaffTimeOffStatus;
}

export const StaffTimeOffSchema = SchemaFactory.createForClass(StaffTimeOff);

StaffTimeOffSchema.index({ tenantId: 1, userId: 1, startDate: 1, endDate: 1 });
