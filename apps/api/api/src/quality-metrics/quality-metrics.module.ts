import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from '../tickets/tickets.module';
import { GithubMetricsService } from './github-metrics.service';
import { QualityMetricsController } from './quality-metrics.controller';
import { QualityMetricsService } from './quality-metrics.service';

@Module({
  imports: [ConfigModule, TicketsModule],
  controllers: [QualityMetricsController],
  providers: [QualityMetricsService, GithubMetricsService],
  exports: [QualityMetricsService],
})
export class QualityMetricsModule {}
