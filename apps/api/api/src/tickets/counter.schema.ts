import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema()
export class Counter {
  @Prop({ type: String, required: true, unique: true })
  name!: string;

  @Prop({ type: Number, required: true, default: 0 })
  count!: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
