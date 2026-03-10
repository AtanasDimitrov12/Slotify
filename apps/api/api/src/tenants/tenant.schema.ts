import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

export type TenantStatus = 'active' | 'inactive' | 'suspended';

@Schema({ timestamps: true })
export class Tenant {

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
  slug!: string;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'], index: true })
  status!: TenantStatus;

  @Prop({ default: true, index: true })
  isPublished!: boolean;

  @Prop({ default: 'Europe/Amsterdam' })
  timezone!: string;

  @Prop({ trim: true, lowercase: true })
  ownerEmail?: string;

  @Prop({ default: 'free', trim: true })
  plan?: string;

  @Prop()
  deletedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);