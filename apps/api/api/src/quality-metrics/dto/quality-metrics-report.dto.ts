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
  deploymentFrequency: number; // deployments per day
  leadTimeMinutes: number; // average minutes from commit to successful CI
  changeFailureRate: number; // percentage of failed runs
  recoveryTimeMinutes: number | null; // average minutes to fix a failed build
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
