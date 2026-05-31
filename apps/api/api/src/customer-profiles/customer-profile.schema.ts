import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type CustomerProfileDocument = HydratedDocument<CustomerProfile>;

@Schema({ _id: false })
export class CustomerLocation {
  @Prop({ type: String, trim: true })
  country?: string;

  @Prop({ type: String, trim: true })
  city?: string;
}

const CustomerLocationSchema = SchemaFactory.createForClass(CustomerLocation);

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ type: Boolean, default: true })
  remindersEnabled!: boolean;

  @Prop({ type: Boolean, default: false })
  promotionsEnabled!: boolean;

  @Prop({ type: Boolean, default: false })
  lastMinuteDealsEnabled!: boolean;
}

const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);

@Schema({ _id: false })
export class PreferredBookingSlot {
  @Prop({ type: Number, required: true })
  dayOfWeek!: number;

  @Prop({ type: String, required: true })
  timeSlot!: string;
}

const PreferredBookingSlotSchema = SchemaFactory.createForClass(PreferredBookingSlot);

@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  phone!: string;

  @Prop({ type: String, trim: true })
  avatarUrl?: string;

  @Prop({ type: CustomerLocationSchema, default: () => ({}) })
  location?: CustomerLocation;

  @Prop({
    type: String,
    enum: ['morning', 'afternoon', 'evening', null],
    default: null,
  })
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | null;

  @Prop({ type: [Number], default: [] })
  preferredDaysOfWeek?: number[];

  @Prop({ type: [PreferredBookingSlotSchema], default: [] })
  preferredBookingSlots?: PreferredBookingSlot[];

  @Prop({ type: [Types.ObjectId], ref: 'Service', default: [] })
  preferredServiceIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Tenant', default: [] })
  favoriteSalonIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  preferredStaffIds?: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  birthday?: Date | null;

  @Prop({
    type: NotificationPreferencesSchema,
    default: () => ({
      remindersEnabled: true,
      promotionsEnabled: false,
      lastMinuteDealsEnabled: false,
    }),
  })
  notificationPreferences!: NotificationPreferences;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);
