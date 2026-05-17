import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema()
export class Counter {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true, default: 0 })
  count!: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
