import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QualityMetricsController } from './quality-metrics.controller';
import { QualityMetricsService } from './quality-metrics.service';
import { GithubMetricsService } from './github-metrics.service';

@Module({
  imports: [ConfigModule],
  controllers: [QualityMetricsController],
  providers: [QualityMetricsService, GithubMetricsService],
  exports: [QualityMetricsService],
})
export class QualityMetricsModule {}
