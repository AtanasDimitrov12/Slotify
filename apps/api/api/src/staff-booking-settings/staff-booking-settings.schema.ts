import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type StaffBookingSettingsDocument = HydratedDocument<StaffBookingSettings>;

@Schema({ _id: false })
export class BookingBufferOverride {
  @Prop()
  enabled?: boolean;

  @Prop({ min: 0 })
  minutes?: number;
}

const BookingBufferOverrideSchema = SchemaFactory.createForClass(BookingBufferOverride);

@Schema({ _id: false })
export class StaffBookingSettingsOverrides {
  @Prop({ type: BookingBufferOverrideSchema })
  bufferBefore?: BookingBufferOverride;

  @Prop({ type: BookingBufferOverrideSchema })
  bufferAfter?: BookingBufferOverride;

  @Prop({ min: 0 })
  minimumNoticeMinutes?: number;

  @Prop({ min: 1 })
  maximumDaysInAdvance?: number;

  @Prop()
  autoConfirmReservations?: boolean;

  @Prop()
  allowBookingToEndAfterWorkingHours?: boolean;

  @Prop()
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

  @Prop({ default: true })
  useGlobalSettings!: boolean;

  @Prop({ type: StaffBookingSettingsOverridesSchema, default: () => ({}) })
  overrides!: StaffBookingSettingsOverrides;
}

export const StaffBookingSettingsSchema = SchemaFactory.createForClass(StaffBookingSettings);

StaffBookingSettingsSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
