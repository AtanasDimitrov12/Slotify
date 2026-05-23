import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type SystemMetricDocument = HydratedDocument<SystemMetric>;

@Schema({ timestamps: true })
export class SystemMetric {
  @Prop({
    type: String,
    required: true,
    enum: ['api_request', 'system_health', 'web_vital'],
    index: true,
  })
  type!: string;

  // For api_request
  @Prop({ type: String })
  path?: string;

  @Prop({ type: String })
  method?: string;

  @Prop({ type: Number })
  durationMs?: number;

  @Prop({ type: Number })
  statusCode?: number;

  // For system_health
  @Prop({ type: Number })
  cpuUsage?: number;

  @Prop({ type: Number })
  memoryUsage?: number;

  @Prop({ type: Number })
  uptimeSeconds?: number;

  // For web_vital
  @Prop({ type: Number })
  fcp?: number;

  @Prop({ type: Number })
  lcp?: number;

  @Prop({ type: Number })
  cls?: number;

  @Prop({ type: Number })
  fid?: number;

  @Prop({ type: Number })
  inp?: number;

  @Prop({ type: Number })
  ttfb?: number;

  createdAt!: Date;
}

export const SystemMetricSchema = SchemaFactory.createForClass(SystemMetric);

SystemMetricSchema.index({ type: 1, createdAt: -1 });
