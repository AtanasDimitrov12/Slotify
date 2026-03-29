import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Service } from '../services/service.schema';
import { StaffServiceAssignment } from '../staff-service-assignments/staff-service-assignment.schema';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type ReservationDocument = HydratedDocument<Reservation>;
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  staffId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StaffServiceAssignment.name,
    required: true,
    index: true,
  })
  staffServiceAssignmentId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Service.name,
    required: true,
    index: true,
  })
  serviceId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  serviceName!: string;

  @Prop({ required: true, min: 1 })
  durationMin!: number;

  @Prop({ required: true, min: 0 })
  priceEUR!: number;

  @Prop({ required: true, index: true })
  startTime!: Date;

  @Prop({ required: true, index: true })
  endTime!: Date;

  @Prop({ required: true, trim: true, maxlength: 120 })
  customerName!: string;

  @Prop({ required: true, trim: true, maxlength: 40 })
  customerPhone!: string;

  @Prop({ trim: true, lowercase: true, maxlength: 200 })
  customerEmail?: string;

  @Prop({ trim: true, maxlength: 1000, default: '' })
  notes?: string;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
    index: true,
  })
  status!: ReservationStatus;

  @Prop({ trim: true, maxlength: 64, default: 'public-booking' })
  source!: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

ReservationSchema.index({ tenantId: 1, staffId: 1, startTime: 1, endTime: 1 });
ReservationSchema.index({ tenantId: 1, startTime: 1, status: 1 });
ReservationSchema.index({ tenantId: 1, staffId: 1, status: 1, startTime: 1 });
ReservationSchema.index({
  tenantId: 1,
  staffServiceAssignmentId: 1,
  startTime: 1,
});
