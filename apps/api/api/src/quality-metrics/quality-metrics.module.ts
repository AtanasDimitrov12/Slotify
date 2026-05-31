import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsModule } from '../tickets/tickets.module';
import { GithubMetricsService } from './github-metrics.service';
import { PerformanceInterceptor } from './performance.interceptor';
import { QualityMetricsController } from './quality-metrics.controller';
import { QualityMetricsService } from './quality-metrics.service';
import { SystemHealthService } from './system-health.service';
import { SystemMetric, SystemMetricSchema } from './system-metric.schema';

@Module({
  imports: [
    ConfigModule,
    TicketsModule,
    MongooseModule.forFeature([{ name: SystemMetric.name, schema: SystemMetricSchema }]),
  ],
  controllers: [QualityMetricsController],
  providers: [
    QualityMetricsService,
    GithubMetricsService,
    SystemHealthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [QualityMetricsService, SystemHealthService],
})
export class QualityMetricsModule {}
