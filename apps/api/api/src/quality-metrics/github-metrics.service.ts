import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GithubWorkflowRun {
  id: number;
  status: string;
  conclusion: string;
  created_at: string;
  updated_at: string;
  run_duration_ms?: number;
  head_sha: string;
  html_url: string;
  display_title: string;
  run_number: number;
  head_branch: string;
}

export interface GithubJob {
  id: number;
  name: string;
  status: string;
  conclusion: string;
  started_at: string;
  completed_at: string;
  steps: {
    name: string;
    status: string;
    conclusion: string;
    number: number;
  }[];
}

@Injectable()
export class GithubMetricsService {
  private readonly logger = new Logger(GithubMetricsService.name);
  private readonly token: string | undefined;
  private readonly owner: string | undefined;
  private readonly repo: string | undefined;
  private readonly workflowFile: string;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('GITHUB_TOKEN');
    this.owner = this.configService.get<string>('GITHUB_OWNER');
    this.repo = this.configService.get<string>('GITHUB_REPO');
    this.workflowFile = this.configService.get<string>('GITHUB_WORKFLOW_ID') || 'ci.yml';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.token && this.owner && this.repo);
  }

  async getWorkflowRuns(days = 30): Promise<GithubWorkflowRun[]> {
    if (!(await this.isConfigured())) {
      this.logger.warn('GitHub metrics not configured');
      return [];
    }

    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceIso = since.toISOString();

      // We might need multiple pages if there are many runs, 
      // but for 30-90 days, 100 runs per page might be enough for many projects.
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/actions/workflows/${this.workflowFile}/runs?per_page=100&created=>${sinceIso}`;
      
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.workflow_runs || [];
    } catch (error) {
      this.logger.error(`Failed to fetch workflow runs: ${error.message}`);
      return [];
    }
  }

  async getRunJobs(runId: number): Promise<GithubJob[]> {
    if (!(await this.isConfigured())) return [];

    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/actions/runs/${runId}/jobs`;
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      this.logger.error(`Failed to fetch run jobs for ${runId}: ${error.message}`);
      return [];
    }
  }
}
