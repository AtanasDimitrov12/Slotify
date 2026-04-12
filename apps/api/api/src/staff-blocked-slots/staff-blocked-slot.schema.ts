import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffBlockedSlotDocument = HydratedDocument<StaffBlockedSlot>;

@Schema({ timestamps: true })
export class StaffBlockedSlot {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  date!: string; // YYYY-MM-DD

  @Prop({ required: true })
  startTime!: string; // HH:mm

  @Prop({ required: true })
  endTime!: string; // HH:mm

  @Prop({ trim: true, default: '' })
  reason?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const StaffBlockedSlotSchema = SchemaFactory.createForClass(StaffBlockedSlot);

StaffBlockedSlotSchema.index({ tenantId: 1, userId: 1, date: 1, isActive: 1 });
