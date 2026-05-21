import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

export type TenantStatus = 'active' | 'inactive' | 'suspended';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  slug!: string;

  @Prop({
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'suspended'],
    index: true,
  })
  status!: TenantStatus;

  @Prop({ type: Boolean, default: true, index: true })
  isPublished!: boolean;

  @Prop({ type: String, default: 'Europe/Amsterdam' })
  timezone!: string;

  @Prop({ type: String, trim: true, lowercase: true })
  ownerEmail?: string;

  @Prop({ type: String, default: 'free', trim: true })
  plan?: string;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
