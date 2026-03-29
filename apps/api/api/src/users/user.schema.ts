import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true })
  password!: string; // must be hashed

  @Prop({
    required: true,
    enum: ['internal', 'customer'],
    default: 'internal',
  })
  accountType!: 'internal' | 'customer';

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
