import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';
import { User } from '../users/user.schema';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true, sparse: true })
  code!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  userStories?: string;

  @Prop({ trim: true, maxlength: 5000, default: '' })
  description?: string;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  acceptanceCriteria?: string;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  nonTechnicalAcceptanceCriteria?: string;

  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority!: string;

  @Prop({
    required: true,
    enum: ['bugfix', 'feature', 'request', 'question'],
    default: 'feature',
  })
  type!: string;

  @Prop({
    required: true,
    default: 'internal',
    index: true,
  })
  stage!: string;

  @Prop({
    type: [String],
    enum: ['info_needed', 'blocked', 'requested_changes', 'hold', 'has_pr', 'awaiting_feedback'],
    default: [],
  })
  badges!: string[];

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  requestedBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.index({ tenantId: 1, stage: 1 });
