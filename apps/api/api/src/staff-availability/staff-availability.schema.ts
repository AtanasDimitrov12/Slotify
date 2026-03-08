import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffAvailabilityDocument = HydratedDocument<StaffAvailability>;

@Schema({ _id: false })
export class DayAvailability {
  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek!: number;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop()
  breakStartTime?: string;

  @Prop()
  breakEndTime?: string;

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const DayAvailabilitySchema = SchemaFactory.createForClass(DayAvailability);

@Schema({ timestamps: true })
export class StaffAvailability {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: [DayAvailabilitySchema], default: [] })
  weeklyAvailability!: DayAvailability[];
}

export const StaffAvailabilitySchema = SchemaFactory.createForClass(StaffAvailability);

StaffAvailabilitySchema.index({ tenantId: 1, userId: 1 }, { unique: true });