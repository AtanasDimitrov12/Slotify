import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemMetric } from './system-metric.schema';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(SystemMetric.name)
    private systemMetricModel: Model<SystemMetric>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const startTime = Date.now();

    // Skip health checks and metrics endpoints to avoid noise
    if (path === '/health' || path.startsWith('/quality-metrics')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        this.systemMetricModel
          .create({
            type: 'api_request',
            path,
            method,
            durationMs,
            statusCode,
          })
          .catch((err: unknown) => {
            const error = err as Record<string, string>;
            // Silently fail if DB is closing/closed to not affect logs during shutdown
            if (
              error.name === 'MongoClientClosedError' ||
              error.name === 'MongoNotConnectedError' ||
              error.message?.includes('client was closed')
            ) {
              return;
            }
            console.error('Failed to save performance metric:', err);
          });
      }),
    );
  }
}
