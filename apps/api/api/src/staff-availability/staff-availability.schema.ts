import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffAvailabilityDocument = HydratedDocument<StaffAvailability>;

@Schema({ timestamps: true })
export class StaffAvailability {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6, index: true })
  dayOfWeek!: number; // 0 = Sunday, 6 = Saturday

  @Prop({ required: true })
  startTime!: string; // "09:00"

  @Prop({ required: true })
  endTime!: string; // "18:00"

  @Prop()
  breakStartTime?: string;

  @Prop()
  breakEndTime?: string;

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const StaffAvailabilitySchema = SchemaFactory.createForClass(StaffAvailability);

StaffAvailabilitySchema.index({ tenantId: 1, userId: 1, dayOfWeek: 1 }, { unique: true });