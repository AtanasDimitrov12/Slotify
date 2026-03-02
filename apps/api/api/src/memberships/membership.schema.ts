import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type MembershipDocument = HydratedDocument<Membership>;

export type MembershipRole = 'owner' | 'manager' | 'staff';

@Schema({ timestamps: true })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    default: 'staff',
    enum: ['owner', 'manager', 'staff'],
  })
  role!: MembershipRole;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

// One user can have only one role per tenant
MembershipSchema.index({ userId: 1, tenantId: 1 }, { unique: true });