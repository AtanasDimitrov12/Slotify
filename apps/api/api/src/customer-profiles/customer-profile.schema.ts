import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type CustomerProfileDocument = HydratedDocument<CustomerProfile>;

@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop()
  bio?: string;

  @Prop()
  avatarUrl?: string;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);
