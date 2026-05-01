import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { QualityMetricsService } from './quality-metrics.service';
import { QualityMetricsReport } from './dto/quality-metrics-report.dto';

@Controller('quality-metrics')
@UseGuards(JwtAuthGuard)
export class QualityMetricsController {
  constructor(private readonly qualityMetricsService: QualityMetricsService) {}

  @Get()
  async getReport(
    @CurrentUser() user: JwtPayload,
    @Query('days') days?: string,
  ): Promise<QualityMetricsReport> {
    // Only allow admin and owner roles
    if (user.role !== 'admin' && user.role !== 'owner') {
      throw new ForbiddenException('Only admins and owners can access quality metrics');
    }

    const periodDays = days ? parseInt(days, 10) : 30;
    return this.qualityMetricsService.getReport(periodDays);
  }
}
