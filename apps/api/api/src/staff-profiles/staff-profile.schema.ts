import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type StaffProfileDocument = HydratedDocument<StaffProfile>;

@Schema({ timestamps: true })
export class StaffProfile {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
    unique: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: String, trim: true, default: '' })
  displayName!: string;

  @Prop({ type: String, trim: true, default: '' })
  bio!: string;

  @Prop({ type: Number, min: 0, default: 0 })
  experienceYears!: number;

  @Prop({ type: [String], default: [] })
  expertise!: string[];

  @Prop({ type: String, trim: true, default: '' })
  avatarUrl?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isBookable!: boolean;

  @Prop({ type: Boolean, default: true, index: true })
  isActive!: boolean;
}

export const StaffProfileSchema = SchemaFactory.createForClass(StaffProfile);
