import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type StaffProfileDocument = HydratedDocument<StaffProfile>;

@Schema({ timestamps: true })
export class StaffProfile {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  displayName!: string;

  @Prop({ trim: true, default: '' })
  bio!: string;

  @Prop({ min: 0, default: 0 })
  experienceYears!: number;

  @Prop({ type: [String], default: [] })
  expertise!: string[];

  @Prop({ trim: true, default: '' })
  avatarUrl?: string;

  @Prop({ default: true, index: true })
  isBookable!: boolean;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const StaffProfileSchema = SchemaFactory.createForClass(StaffProfile);

StaffProfileSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
