import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffAvailabilityDocument = HydratedDocument<StaffAvailability>;

@Schema({ _id: false })
export class AvailabilitySlot {
  @Prop({ required: true })
  startTime!: string; // HH:mm

  @Prop({ required: true })
  endTime!: string; // HH:mm

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const AvailabilitySlotSchema = SchemaFactory.createForClass(AvailabilitySlot);

@Schema({ _id: false })
export class DayAvailability {
  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek!: number;

  @Prop({ type: [AvailabilitySlotSchema], default: [] })
  slots!: AvailabilitySlot[];

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const DayAvailabilitySchema = SchemaFactory.createForClass(DayAvailability);

@Schema({ timestamps: true })
export class StaffAvailability {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: [DayAvailabilitySchema], default: [] })
  weeklyAvailability!: DayAvailability[];
}

export const StaffAvailabilitySchema = SchemaFactory.createForClass(StaffAvailability);
