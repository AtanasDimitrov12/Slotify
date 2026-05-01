import { Injectable, Logger } from '@nestjs/common';
import { GithubMetricsService, GithubWorkflowRun } from './github-metrics.service';
import { QualityMetricsReport, CiRunSummary, DoraMetrics, CiStepStatus } from './dto/quality-metrics-report.dto';

@Injectable()
export class QualityMetricsService {
  private readonly logger = new Logger(QualityMetricsService.name);
  private cache: Map<string, { data: QualityMetricsReport; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private githubService: GithubMetricsService) {}

  async getReport(days = 30): Promise<QualityMetricsReport> {
    const isConfigured = await this.githubService.isConfigured();
    if (!isConfigured) {
      return {
        isConfigured: false,
        periodDays: days,
        lastRun: null,
        ciMetrics: {
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          successRate: 0,
          averageDurationMinutes: 0,
        },
        doraMetrics: {
          deploymentFrequency: 0,
          leadTimeMinutes: 0,
          changeFailureRate: 0,
          recoveryTimeMinutes: null,
        },
        recentRuns: [],
      };
    }

    const cacheKey = `report-${days}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const runs = await this.githubService.getWorkflowRuns(days);
    const report = await this.buildReport(runs, days);

    this.cache.set(cacheKey, { data: report, timestamp: Date.now() });
    return report;
  }

  private async buildReport(runs: GithubWorkflowRun[], days: number): Promise<QualityMetricsReport> {
    const completedRuns = runs.filter((r) => r.status === 'completed');
    const successfulRuns = completedRuns.filter((r) => r.conclusion === 'success');
    const failedRuns = completedRuns.filter((r) => r.conclusion === 'failure');

    const lastRun = runs.length > 0 ? this.mapRun(runs[0]) : null;
    
    // Recent runs (last 10)
    const recentRuns = runs.slice(0, 10).map(r => this.mapRun(r));

    // CI Metrics
    const totalRunsCount = completedRuns.length;
    const successRate = totalRunsCount > 0 ? (successfulRuns.length / totalRunsCount) * 100 : 0;
    
    const totalDurationMs = completedRuns.reduce((acc, r) => acc + (r.run_duration_ms || 0), 0);
    const avgDurationMinutes = totalRunsCount > 0 ? (totalDurationMs / totalRunsCount) / 1000 / 60 : 0;

    // DORA Metrics
    const doraMetrics = this.calculateDoraMetrics(runs, days);

    // Step Status from last run if available
    let stepStatus: CiStepStatus[] | undefined;
    if (runs.length > 0) {
      stepStatus = await this.getStepStatus(runs[0].id);
    }

    return {
      isConfigured: true,
      periodDays: days,
      lastRun,
      ciMetrics: {
        totalRuns: totalRunsCount,
        successfulRuns: successfulRuns.length,
        failedRuns: failedRuns.length,
        successRate,
        averageDurationMinutes: avgDurationMinutes,
      },
      doraMetrics,
      recentRuns,
      stepStatus,
    };
  }

  private mapRun(run: GithubWorkflowRun): CiRunSummary {
    const start = new Date(run.created_at).getTime();
    const end = new Date(run.updated_at).getTime();
    const durationMs = run.run_duration_ms || (end - start);

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

  private calculateDoraMetrics(runs: GithubWorkflowRun[], days: number): DoraMetrics {
    const completedRuns = runs.filter((r) => r.status === 'completed');
    const successfulRuns = completedRuns.filter((r) => r.conclusion === 'success');
    
    // 1. Deployment Frequency (Successful runs on main/dev)
    const deployments = successfulRuns.filter(r => r.head_branch === 'main' || r.head_branch === 'dev').length;
    const deploymentFrequency = deployments / (days || 1);

    // 2. Lead Time (Approximation: time from creation to completion of successful runs)
    const leadTimes = successfulRuns.map(r => {
      const start = new Date(r.created_at).getTime();
      const end = new Date(r.updated_at).getTime();
      return (end - start) / 1000 / 60; // minutes
    });
    const avgLeadTime = leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0;

    // 3. Change Failure Rate
    const failedRuns = completedRuns.filter(r => r.conclusion === 'failure').length;
    const changeFailureRate = completedRuns.length > 0 ? (failedRuns / completedRuns.length) * 100 : 0;

    // 4. Recovery Time (Time between failure and next success on same branch)
    const recoveryTimes: number[] = [];
    const runsByBranch = this.groupRunsByBranch(completedRuns);

    for (const [_branch, branchRuns] of Object.entries(runsByBranch)) {
      // Runs are usually returned newest first
      for (let i = 0; i < branchRuns.length - 1; i++) {
        if (branchRuns[i].conclusion === 'success' && branchRuns[i+1].conclusion === 'failure') {
          const failureTime = new Date(branchRuns[i+1].updated_at).getTime();
          const successTime = new Date(branchRuns[i].updated_at).getTime();
          recoveryTimes.push((successTime - failureTime) / 1000 / 60);
        }
      }
    }
    const avgRecoveryTime = recoveryTimes.length > 0 ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length : null;

    return {
      deploymentFrequency,
      leadTimeMinutes: avgLeadTime,
      changeFailureRate,
      recoveryTimeMinutes: avgRecoveryTime,
    };
  }

  private groupRunsByBranch(runs: GithubWorkflowRun[]): Record<string, GithubWorkflowRun[]> {
    return runs.reduce((acc, run) => {
      if (!acc[run.head_branch]) acc[run.head_branch] = [];
      acc[run.head_branch].push(run);
      return acc;
    }, {} as Record<string, GithubWorkflowRun[]>);
  }

  private async getStepStatus(runId: number): Promise<CiStepStatus[]> {
    const jobs = await this.githubService.getRunJobs(runId);
    if (jobs.length === 0) return [];

    // Assuming we care about the main job (validate)
    const mainJob = jobs.find(j => j.name === 'validate') || jobs[0];
    
    return mainJob.steps.map(s => ({
      name: s.name,
      status: this.mapGithubConclusion(s.conclusion, s.status),
    }));
  }

  private mapGithubConclusion(conclusion: string, status: string): 'passed' | 'failed' | 'pending' | 'skipped' | 'unknown' {
    if (status !== 'completed') return 'pending';
    if (conclusion === 'success') return 'passed';
    if (conclusion === 'failure') return 'failed';
    if (conclusion === 'skipped') return 'skipped';
    return 'unknown';
  }
}
