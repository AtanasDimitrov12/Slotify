import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type StaffAvailabilityDocument = HydratedDocument<StaffAvailability>;

@Schema({ _id: false })
export class AvailabilitySlot {
  @Prop({ type: String, required: true })
  startTime!: string; // HH:mm

  @Prop({ type: String, required: true })
  endTime!: string; // HH:mm

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isAvailable!: boolean;
}

export const AvailabilitySlotSchema = SchemaFactory.createForClass(AvailabilitySlot);

@Schema({ _id: false })
export class DayAvailability {
  @Prop({ type: Number, required: true, min: 0, max: 6 })
  dayOfWeek!: number;

  @Prop({ type: [AvailabilitySlotSchema], default: [] })
  slots!: AvailabilitySlot[];

  @Prop({ type: Boolean, default: true })
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
