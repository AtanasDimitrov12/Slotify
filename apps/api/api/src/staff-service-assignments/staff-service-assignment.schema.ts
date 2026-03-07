import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';
import { Service } from '../services/service.schema';

export type StaffServiceAssignmentDocument = HydratedDocument<StaffServiceAssignment>;

@Schema({ timestamps: true })
export class StaffServiceAssignment {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Service.name, required: true, index: true })
  serviceId!: Types.ObjectId;

  @Prop({ min: 1 })
  customDurationMinutes?: number;

  @Prop({ min: 0 })
  customPrice?: number;

  @Prop({ default: true, index: true })
  isOffered!: boolean;
}

export const StaffServiceAssignmentSchema =
  SchemaFactory.createForClass(StaffServiceAssignment);

StaffServiceAssignmentSchema.index(
  { tenantId: 1, userId: 1, serviceId: 1 },
  { unique: true },
);