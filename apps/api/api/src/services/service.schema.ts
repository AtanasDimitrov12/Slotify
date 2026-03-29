import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { Tenant } from '../tenants/tenant.schema';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 1 })
  durationMin!: number;

  @Prop({ required: true, min: 0 })
  priceEUR!: number;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ tenantId: 1, name: 1 }, { unique: true });
