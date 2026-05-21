import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as os from 'os';
import { SystemMetric } from './system-metric.schema';

@Injectable()
export class SystemHealthService implements OnModuleInit, OnModuleDestroy {
  private intervalId?: NodeJS.Timeout;

  constructor(
    @InjectModel(SystemMetric.name)
    private systemMetricModel: Model<SystemMetric>,
  ) {}

  onModuleInit() {
    // Collect health metrics every minute
    this.intervalId = setInterval(() => this.collectMetrics(), 60000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async collectMetrics() {
    const cpuUsage = os.loadavg()[0]; // 1 minute load average
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    const uptimeSeconds = os.uptime();

    try {
      await this.systemMetricModel.create({
        type: 'system_health',
        cpuUsage,
        memoryUsage,
        uptimeSeconds,
      });
    } catch (err) {
      console.error('Failed to save system health metrics:', err);
    }
  }

  async getLatestHealth() {
    return this.systemMetricModel
      .findOne({ type: 'system_health' })
      .sort({ createdAt: -1 })
      .exec();
  }
}
