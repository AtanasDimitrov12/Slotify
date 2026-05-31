import { apiFetch } from './http';

export interface CiRunSummary {
  id: number;
  status: string;
  conclusion: string;
  createdAt: string;
  durationMs: number;
  url: string;
  title: string;
  runNumber: number;
  branch: string;
}

export interface DoraMetrics {
  deploymentFrequency: number;
  leadTimeMinutes: number; // CI Lead Time
  changeFailureRate: number;
  recoveryTimeMinutes: number | null;
  // Ticket-based metrics
  ticketLeadTimeMinutes: number; // Development time: Start to Finish
  cycleTimeMinutes: number; // Total time: Request to Finish
  velocity: number; // Completed tickets per period
}

export interface TicketMetricSummary {
  totalRequested: number;
  totalCompleted: number;
  avgLeadTimeMinutes: number;
  avgCycleTimeMinutes: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface CiStepStatus {
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped' | 'unknown';
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ApiPerformance {
  p50ms: number;
  p95ms: number;
  p99ms: number;
  errorRate: number;
  requestsPerSecond: number;
}

export interface WebVitals {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  inp: number;
  ttfb: number;
}

export interface QualityMetricsReport {
  isConfigured: boolean;
  periodDays: number;
  lastRun: CiRunSummary | null;
  ciMetrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
    averageDurationMinutes: number;
  };
  ticketMetrics: TicketMetricSummary;
  doraMetrics: DoraMetrics;
  recentRuns: CiRunSummary[];
  stepStatus?: CiStepStatus[];
  systemHealth?: SystemHealth;
  apiPerformance?: ApiPerformance;
  webVitals?: WebVitals;
}

export const getQualityMetrics = (days = 30): Promise<QualityMetricsReport> => {
  return apiFetch<QualityMetricsReport>(`/quality-metrics?days=${days}`);
};

export const reportWebVitals = (vitals: WebVitals): Promise<void> => {
  return apiFetch<void>('/quality-metrics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(vitals),
  });
};
