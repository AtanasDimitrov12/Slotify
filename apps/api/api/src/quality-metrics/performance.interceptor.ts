import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemMetric } from './system-metric.schema';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(SystemMetric.name)
    private systemMetricModel: Model<SystemMetric>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
          .catch((err) => {
            // Silently fail if DB is closing/closed to not affect logs during shutdown
            if (
              err.name === 'MongoClientClosedError' ||
              err.name === 'MongoNotConnectedError' ||
              err.message?.includes('client was closed')
            ) {
              return;
            }
            console.error('Failed to save performance metric:', err);
          });
      }),
    );
  }
}
