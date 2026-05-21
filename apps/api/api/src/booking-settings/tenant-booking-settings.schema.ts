import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type TenantBookingSettingsDocument = HydratedDocument<TenantBookingSettings>;

@Schema({ _id: false })
export class BookingBufferConfig {
  @Prop({ type: Boolean, default: false })
  enabled!: boolean;

  @Prop({ type: Number, default: 0, min: 0 })
  minutes!: number;
}

const BookingBufferConfigSchema = SchemaFactory.createForClass(BookingBufferConfig);

@Schema({ timestamps: true })
export class TenantBookingSettings {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    type: BookingBufferConfigSchema,
    default: () => ({ enabled: false, minutes: 0 }),
  })
  bufferBefore!: BookingBufferConfig;

  @Prop({
    type: BookingBufferConfigSchema,
    default: () => ({ enabled: true, minutes: 5 }),
  })
  bufferAfter!: BookingBufferConfig;

  @Prop({ type: Number, default: 60, min: 0 })
  minimumNoticeMinutes!: number;

  @Prop({ type: Number, default: 30, min: 1 })
  maximumDaysInAdvance!: number;

  @Prop({ type: Boolean, default: true })
  autoConfirmReservations!: boolean;

  @Prop({ type: Boolean, default: false })
  allowBookingToEndAfterWorkingHours!: boolean;

  @Prop({ type: Boolean, default: true })
  allowCustomerChooseSpecificStaff!: boolean;
}

export const TenantBookingSettingsSchema = SchemaFactory.createForClass(TenantBookingSettings);
