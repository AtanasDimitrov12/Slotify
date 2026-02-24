import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDetailsDocument = TenantDetails & Document;

export type OpeningTimeRange = {
  start: string; // "09:00"
  end: string;   // "18:00"
};

export type WeeklyOpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', OpeningTimeRange[]>
>;

export type Address = {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

export type GeoLocation = {
  lat?: number;
  lng?: number;
};

@Schema({ timestamps: true })
export class TenantDetails {
  @Prop({ required: true, index: true, unique: true })
  tenantId: string; // store as string uuid/objectId depending on your Tenant id

  @Prop({ type: Object, default: {} })
  address: Address;

  @Prop({ type: Object, default: {} })
  openingHours: WeeklyOpeningHours;

  @Prop({ default: '' })
  contactPersonName: string;

  @Prop({ default: '' })
  contactEmail: string;

  @Prop({ default: '' })
  contactPhone: string;

  @Prop({ default: 'Europe/Amsterdam' })
  timezone: string;

  @Prop({ default: 'en-NL' })
  locale: string;

  @Prop()
  websiteUrl?: string;

  @Prop({ type: Object, default: {} })
  socialLinks?: SocialLinks;

  @Prop()
  logoUrl?: string;

  @Prop()
  coverImageUrl?: string;

  @Prop({ type: Object, default: {} })
  geo?: GeoLocation;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: '' })
  notes?: string;
}

export const TenantDetailsSchema = SchemaFactory.createForClass(TenantDetails);
TenantDetailsSchema.index({ tenantId: 1 }, { unique: true });