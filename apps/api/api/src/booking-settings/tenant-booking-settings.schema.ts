import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TenantBookingSettingsDocument = HydratedDocument<TenantBookingSettings>;

@Schema({ _id: false })
export class BookingBufferConfig {
  @Prop({ default: false })
  enabled!: boolean;

  @Prop({ default: 0, min: 0 })
  minutes!: number;
}

const BookingBufferConfigSchema = SchemaFactory.createForClass(BookingBufferConfig);

@Schema({ timestamps: true })
export class TenantBookingSettings {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, unique: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: BookingBufferConfigSchema, default: () => ({ enabled: false, minutes: 0 }) })
  bufferBefore!: BookingBufferConfig;

  @Prop({ type: BookingBufferConfigSchema, default: () => ({ enabled: true, minutes: 5 }) })
  bufferAfter!: BookingBufferConfig;

  @Prop({ default: 60, min: 0 })
  minimumNoticeMinutes!: number;

  @Prop({ default: 30, min: 1 })
  maximumDaysInAdvance!: number;

  @Prop({ default: true })
  autoConfirmReservations!: boolean;

  @Prop({ default: false })
  allowBookingToEndAfterWorkingHours!: boolean;

  @Prop({ default: true })
  allowCustomerChooseSpecificStaff!: boolean;
}

export const TenantBookingSettingsSchema =
  SchemaFactory.createForClass(TenantBookingSettings);