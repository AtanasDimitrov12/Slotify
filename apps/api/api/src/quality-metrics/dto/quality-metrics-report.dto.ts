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
  // Ticket-based metrics
  ticketLeadTimeMinutes: number;
  cycleTimeMinutes: number;
  velocity: number;
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
}
