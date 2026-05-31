import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email!: string;

  @Prop({ type: String, required: true })
  password!: string; // must be hashed

  @Prop({
    type: String,
    required: true,
    enum: ['internal', 'customer'],
    default: 'internal',
  })
  accountType!: 'internal' | 'customer';

  @Prop({ type: Boolean, default: false })
  emailVerified!: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
