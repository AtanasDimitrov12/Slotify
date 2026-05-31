import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type StaffBookingSettingsDocument = HydratedDocument<StaffBookingSettings>;

@Schema({ _id: false })
export class BookingBufferOverride {
  @Prop({ type: Boolean })
  enabled?: boolean;

  @Prop({ type: Number, min: 0 })
  minutes?: number;
}

const BookingBufferOverrideSchema = SchemaFactory.createForClass(BookingBufferOverride);

@Schema({ _id: false })
export class StaffBookingSettingsOverrides {
  @Prop({ type: BookingBufferOverrideSchema })
  bufferBefore?: BookingBufferOverride;

  @Prop({ type: BookingBufferOverrideSchema })
  bufferAfter?: BookingBufferOverride;

  @Prop({ type: Number, min: 0 })
  minimumNoticeMinutes?: number;

  @Prop({ type: Number, min: 1 })
  maximumDaysInAdvance?: number;

  @Prop({ type: Boolean })
  autoConfirmReservations?: boolean;

  @Prop({ type: Boolean })
  allowBookingToEndAfterWorkingHours?: boolean;

  @Prop({ type: Boolean })
  allowCustomerChooseSpecificStaff?: boolean;
}

const StaffBookingSettingsOverridesSchema = SchemaFactory.createForClass(
  StaffBookingSettingsOverrides,
);

@Schema({ timestamps: true })
export class StaffBookingSettings {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  useGlobalSettings!: boolean;

  @Prop({ type: StaffBookingSettingsOverridesSchema, default: () => ({}) })
  overrides!: StaffBookingSettingsOverrides;
}

export const StaffBookingSettingsSchema = SchemaFactory.createForClass(StaffBookingSettings);

StaffBookingSettingsSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
