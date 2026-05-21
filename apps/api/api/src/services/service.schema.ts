import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: Number, required: true, min: 1 })
  durationMin!: number;

  @Prop({ type: Number, required: true, min: 0 })
  priceEUR!: number;

  @Prop({ type: String, trim: true, default: '' })
  description?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive!: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ tenantId: 1, name: 1 }, { unique: true });
