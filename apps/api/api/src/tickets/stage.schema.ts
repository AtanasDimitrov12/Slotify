import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';

export type StageDocument = HydratedDocument<Stage>;

@Schema({ timestamps: true })
export class Stage {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string; // internal id, e.g. "user_requested"

  @Prop({ type: String, required: true, trim: true })
  label!: string; // display name, e.g. "User Requested"

  @Prop({ type: String, required: true, default: '#F8FAFC' })
  color!: string;

  @Prop({ type: Boolean, required: true, default: false })
  isCollapsed!: boolean;

  @Prop({ type: Number, required: true, default: 0 })
  order!: number;
}

export const StageSchema = SchemaFactory.createForClass(Stage);

StageSchema.index({ tenantId: 1, name: 1 }, { unique: true });
