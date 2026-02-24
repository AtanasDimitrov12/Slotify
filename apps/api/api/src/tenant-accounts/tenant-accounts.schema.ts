import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';

export type TenantAccountDocument = HydratedDocument<TenantAccount>;

export type TenantAccountRole = 'owner' | 'manager' | 'staff';

@Schema({ timestamps: true })
export class TenantAccount {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true })
  password!: string; // must be hashed

  @Prop({ default: false })
  isMain!: boolean;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({
    default: 'owner',
    enum: ['owner', 'manager', 'staff'],
  })
  role!: TenantAccountRole;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: false })
  emailVerified!: boolean;
}

export const TenantAccountSchema =
  SchemaFactory.createForClass(TenantAccount);