import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

export type TenantDetailsDocument = TenantDetails & Document;

export type OpeningTimeRange = {
  start: string; // "09:00"
  end: string; // "18:00"
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
  @Prop({ type: String, required: true, unique: true })
  tenantId: string; // store as string uuid/objectId depending on your Tenant id

  @Prop({ type: Object, default: {} })
  address: Address;

  @Prop({ type: Object, default: {} })
  openingHours: WeeklyOpeningHours;

  @Prop({ type: String, default: '' })
  contactPersonName: string;

  @Prop({ type: String, default: '' })
  contactEmail: string;

  @Prop({ type: String, default: '' })
  contactPhone: string;

  @Prop({ type: String, default: 'Europe/Amsterdam' })
  timezone: string;

  @Prop({ type: String, default: 'en-NL' })
  locale: string;

  @Prop({ type: String })
  websiteUrl?: string;

  @Prop({ type: Object, default: {} })
  socialLinks?: SocialLinks;

  @Prop({ type: String })
  logoUrl?: string;

  @Prop({ type: String })
  coverImageUrl?: string;

  @Prop({ type: Object, default: {} })
  geo?: GeoLocation;

  @Prop({ type: Boolean, default: true })
  isPublished: boolean;

  @Prop({ type: String, default: '' })
  notes?: string;
}

export const TenantDetailsSchema = SchemaFactory.createForClass(TenantDetails);
