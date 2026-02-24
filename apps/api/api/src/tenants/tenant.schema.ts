import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

export type TenantStatus = 'active' | 'inactive' | 'suspended';

@Schema({ timestamps: true })
export class Tenant {
  // Display name for UI
  @Prop({ required: true, trim: true })
  name!: string;

  // Used for URLs: /salons/:slug
  @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
  slug!: string;

  // Operational state
  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'], index: true })
  status!: TenantStatus;

  // Visible in marketplace/search
  @Prop({ default: true, index: true })
  isPublished!: boolean;

  // Super important for time slots
  @Prop({ default: 'Europe/Amsterdam' })
  timezone!: string;

  // Optional: just for contacting the tenant owner/admin
  @Prop({ trim: true, lowercase: true })
  ownerEmail?: string;

  // Optional future-proofing
  @Prop({ default: 'free', trim: true })
  plan?: string;

  // Soft delete (optional)
  @Prop()
  deletedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);