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
  leadTimeMinutes: number;
  changeFailureRate: number;
  recoveryTimeMinutes: number | null;
}

export interface CiStepStatus {
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped' | 'unknown';
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
  doraMetrics: DoraMetrics;
  recentRuns: CiRunSummary[];
  stepStatus?: CiStepStatus[];
}

export const getQualityMetrics = (days = 30): Promise<QualityMetricsReport> => {
  return apiFetch<QualityMetricsReport>(`/quality-metrics?days=${days}`);
};
