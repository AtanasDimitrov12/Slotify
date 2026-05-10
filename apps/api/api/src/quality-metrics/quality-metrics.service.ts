import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from '../tickets/ticket.schema';
import {
  QualityMetricsReport,
  CiRunSummary,
  DoraMetrics,
  CiStepStatus,
  TicketMetricSummary,
} from './dto/quality-metrics-report.dto';
import { GithubMetricsService, GithubWorkflowRun } from './github-metrics.service';

@Injectable()
export class QualityMetricsService {
  private readonly logger = new Logger(QualityMetricsService.name);
  private cache: Map<string, { data: QualityMetricsReport; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private githubService: GithubMetricsService,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async getReport(days = 30, tenantId?: string): Promise<QualityMetricsReport> {
    const isGithubConfigured = await this.githubService.isConfigured();

    const cacheKey = `report-${days}-${tenantId || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    let runs: GithubWorkflowRun[] = [];
    if (isGithubConfigured) {
      runs = await this.githubService.getWorkflowRuns(days);
    }

    const tickets = await this.getTicketsForPeriod(days, tenantId);
    const report = await this.buildReport(runs, tickets, days, isGithubConfigured);

    this.cache.set(cacheKey, { data: report, timestamp: Date.now() });
    return report;
  }

  private async getTicketsForPeriod(days: number, tenantId?: string): Promise<TicketDocument[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: any = {
      $or: [{ createdAt: { $gte: startDate } }, { updatedAt: { $gte: startDate } }],
    };

    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }

    return this.ticketModel.find(query).exec();
  }

  private async buildReport(
    runs: GithubWorkflowRun[],
    tickets: TicketDocument[],
    days: number,
    isGithubConfigured: boolean,
  ): Promise<QualityMetricsReport> {
    const completedRuns = runs.filter((r) => r.status === 'completed');
    const successfulRuns = completedRuns.filter((r) => r.conclusion === 'success');
    const failedRuns = completedRuns.filter((r) => r.conclusion === 'failure');

    const lastRun = runs.length > 0 ? this.mapRun(runs[0]) : null;
    const recentRuns = runs.slice(0, 10).map((r) => this.mapRun(r));

    // CI Efficiency
    const totalRunsCount = completedRuns.length;
    const successRate = totalRunsCount > 0 ? (successfulRuns.length / totalRunsCount) * 100 : 0;
    const totalDurationMs = completedRuns.reduce((acc, r) => acc + (r.run_duration_ms || 0), 0);
    const avgDurationMinutes =
      totalRunsCount > 0 ? totalDurationMs / totalRunsCount / 1000 / 60 : 0;

    // Ticket Metrics
    const ticketMetrics = this.calculateTicketMetrics(tickets);

    // DORA Metrics
    const doraMetrics = this.calculateDoraMetrics(runs, tickets, days);

    // Step Status from last run if available
    let stepStatus: CiStepStatus[] | undefined;
    if (runs.length > 0) {
      stepStatus = await this.getStepStatus(runs[0].id);
    }

    return {
      isConfigured: isGithubConfigured,
      periodDays: days,
      lastRun,
      ciMetrics: {
        totalRuns: totalRunsCount,
        successfulRuns: successfulRuns.length,
        failedRuns: failedRuns.length,
        successRate,
        averageDurationMinutes: avgDurationMinutes,
      },
      ticketMetrics,
      doraMetrics,
      recentRuns,
      stepStatus,
    };
  }

  private calculateTicketMetrics(tickets: TicketDocument[]): TicketMetricSummary {
    const completed = tickets.filter((t) => t.stage === 'done' && t.completedAt);

    const leadTimes = completed
      .filter((t) => t.startedAt)
      .map((t) => (t.completedAt!.getTime() - t.startedAt!.getTime()) / 1000 / 60);

    const cycleTimes = completed.map(
      (t) => (t.completedAt!.getTime() - t.createdAt.getTime()) / 1000 / 60,
    );

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    tickets.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    return {
      totalRequested: tickets.length,
      totalCompleted: completed.length,
      avgLeadTimeMinutes:
        leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0,
      avgCycleTimeMinutes:
        cycleTimes.length > 0 ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0,
      byType,
      byPriority,
    };
  }

  private calculateDoraMetrics(
    runs: GithubWorkflowRun[],
    tickets: TicketDocument[],
    days: number,
  ): DoraMetrics {
    const completedRuns = runs.filter((r) => r.status === 'completed');
    const successfulRuns = completedRuns.filter((r) => r.conclusion === 'success');

    // 1. Deployment Frequency
    const deployments = successfulRuns.filter(
      (r) => r.head_branch === 'main' || r.head_branch === 'dev',
    ).length;
    const deploymentFrequency = deployments / (days || 1);

    // 2. CI Lead Time (Approximation)
    const ciLeadTimes = successfulRuns.map((r) => {
      const start = new Date(r.created_at).getTime();
      const end = new Date(r.updated_at).getTime();
      return (end - start) / 1000 / 60;
    });
    const avgCiLeadTime =
      ciLeadTimes.length > 0 ? ciLeadTimes.reduce((a, b) => a + b, 0) / ciLeadTimes.length : 0;

    // 3. Change Failure Rate
    const failedRuns = completedRuns.filter((r) => r.conclusion === 'failure').length;
    const changeFailureRate =
      completedRuns.length > 0 ? (failedRuns / completedRuns.length) * 100 : 0;

    // 4. Recovery Time
    const recoveryTimes: number[] = [];
    const runsByBranch = this.groupRunsByBranch(completedRuns);

    for (const [_branch, branchRuns] of Object.entries(runsByBranch)) {
      for (let i = 0; i < branchRuns.length - 1; i++) {
        if (branchRuns[i].conclusion === 'success' && branchRuns[i + 1].conclusion === 'failure') {
          const failureTime = new Date(branchRuns[i + 1].updated_at).getTime();
          const successTime = new Date(branchRuns[i].updated_at).getTime();
          recoveryTimes.push((successTime - failureTime) / 1000 / 60);
        }
      }
    }
    const avgRecoveryTime =
      recoveryTimes.length > 0
        ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length
        : null;

    // 5. Ticket-based Metrics
    const completedTickets = tickets.filter((t) => t.stage === 'done' && t.completedAt);
    const ticketLeadTimes = completedTickets
      .filter((t) => t.startedAt)
      .map((t) => (t.completedAt!.getTime() - t.startedAt!.getTime()) / 1000 / 60);

    const cycleTimes = completedTickets.map(
      (t) => (t.completedAt!.getTime() - t.createdAt.getTime()) / 1000 / 60,
    );

    return {
      deploymentFrequency,
      leadTimeMinutes: avgCiLeadTime,
      changeFailureRate,
      recoveryTimeMinutes: avgRecoveryTime,
      ticketLeadTimeMinutes:
        ticketLeadTimes.length > 0
          ? ticketLeadTimes.reduce((a, b) => a + b, 0) / ticketLeadTimes.length
          : 0,
      cycleTimeMinutes:
        cycleTimes.length > 0 ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0,
      velocity: completedTickets.length,
    };
  }

  private mapRun(run: GithubWorkflowRun): CiRunSummary {
    const start = new Date(run.created_at).getTime();
    const end = new Date(run.updated_at).getTime();
    const durationMs = run.run_duration_ms || end - start;

    return {
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      durationMs,
      url: run.html_url,
      title: run.display_title,
      runNumber: run.run_number,
      branch: run.head_branch,
    };
  }

  private groupRunsByBranch(runs: GithubWorkflowRun[]): Record<string, GithubWorkflowRun[]> {
    return runs.reduce(
      (acc, run) => {
        if (!acc[run.head_branch]) acc[run.head_branch] = [];
        acc[run.head_branch].push(run);
        return acc;
      },
      {} as Record<string, GithubWorkflowRun[]>,
    );
  }

  private async getStepStatus(runId: number): Promise<CiStepStatus[]> {
    try {
      const jobs = await this.githubService.getRunJobs(runId);
      if (jobs.length === 0) return [];
      const mainJob = jobs.find((j) => j.name === 'validate') || jobs[0];
      return mainJob.steps.map((s) => ({
        name: s.name,
        status: this.mapGithubConclusion(s.conclusion, s.status),
      }));
    } catch (e) {
      this.logger.error(`Failed to get step status for run ${runId}: ${e.message}`);
      return [];
    }
  }

  private mapGithubConclusion(
    conclusion: string,
    status: string,
  ): 'passed' | 'failed' | 'pending' | 'skipped' | 'unknown' {
    if (status !== 'completed') return 'pending';
    if (conclusion === 'success') return 'passed';
    if (conclusion === 'failure') return 'failed';
    if (conclusion === 'skipped') return 'skipped';
    return 'unknown';
  }
}
