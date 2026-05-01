import { Test, TestingModule } from '@nestjs/testing';
import { QualityMetricsService } from './quality-metrics.service';
import { GithubMetricsService, GithubWorkflowRun } from './github-metrics.service';

describe('QualityMetricsService', () => {
  let service: QualityMetricsService;
  let githubService: jest.Mocked<GithubMetricsService>;

  beforeEach(async () => {
    const mockGithubService = {
      isConfigured: jest.fn().mockResolvedValue(true),
      getWorkflowRuns: jest.fn(),
      getRunJobs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualityMetricsService,
        { provide: GithubMetricsService, useValue: mockGithubService },
      ],
    }).compile();

    service = module.get<QualityMetricsService>(QualityMetricsService);
    githubService = module.get(GithubMetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDoraMetrics', () => {
    const mockRuns: GithubWorkflowRun[] = [
      {
        id: 1,
        status: 'completed',
        conclusion: 'success',
        created_at: '2023-01-02T10:00:00Z',
        updated_at: '2023-01-02T10:10:00Z',
        run_duration_ms: 600000,
        head_sha: 'sha1',
        html_url: 'url1',
        display_title: 'Title 1',
        run_number: 1,
        head_branch: 'main',
      },
      {
        id: 2,
        status: 'completed',
        conclusion: 'failure',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:05:00Z',
        run_duration_ms: 300000,
        head_sha: 'sha2',
        html_url: 'url2',
        display_title: 'Title 2',
        run_number: 2,
        head_branch: 'main',
      },
    ];

    it('should calculate deployment frequency correctly', async () => {
      githubService.getWorkflowRuns.mockResolvedValue(mockRuns);
      githubService.getRunJobs.mockResolvedValue([]);

      const report = await service.getReport(30);
      
      // 1 success in 30 days = 1/30 = 0.0333...
      expect(report.doraMetrics.deploymentFrequency).toBeCloseTo(1/30, 5);
    });

    it('should calculate change failure rate correctly', async () => {
      githubService.getWorkflowRuns.mockResolvedValue(mockRuns);
      githubService.getRunJobs.mockResolvedValue([]);

      const report = await service.getReport(30);
      
      // 1 fail out of 2 = 50%
      expect(report.doraMetrics.changeFailureRate).toBe(50);
    });

    it('should calculate lead time correctly', async () => {
      githubService.getWorkflowRuns.mockResolvedValue(mockRuns);
      githubService.getRunJobs.mockResolvedValue([]);

      const report = await service.getReport(30);
      
      // Success run took 10 mins
      expect(report.doraMetrics.leadTimeMinutes).toBe(10);
    });

    it('should calculate recovery time correctly', async () => {
      // Newest first: success at 12:00, failure at 10:00
      const recoveryRuns: GithubWorkflowRun[] = [
        {
          id: 1,
          status: 'completed',
          conclusion: 'success',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:10:00Z',
          head_branch: 'main',
          run_duration_ms: 600000,
          head_sha: 's1', html_url: 'u1', display_title: 't1', run_number: 1,
        },
        {
          id: 2,
          status: 'completed',
          conclusion: 'failure',
          created_at: '2023-01-01T10:00:00Z',
          updated_at: '2023-01-01T10:05:00Z',
          head_branch: 'main',
          run_duration_ms: 300000,
          head_sha: 's2', html_url: 'u2', display_title: 't2', run_number: 2,
        },
      ];

      githubService.getWorkflowRuns.mockResolvedValue(recoveryRuns);
      githubService.getRunJobs.mockResolvedValue([]);

      const report = await service.getReport(30);
      
      // Failure finished at 10:05, Success finished at 12:10
      // 12:10 - 10:05 = 2 hours 5 mins = 125 mins
      expect(report.doraMetrics.recoveryTimeMinutes).toBe(125);
    });
  });

  describe('unconfigured state', () => {
    it('should return empty report when not configured', async () => {
      githubService.isConfigured.mockResolvedValue(false);

      const report = await service.getReport(30);
      
      expect(report.isConfigured).toBe(false);
      expect(report.ciMetrics.totalRuns).toBe(0);
    });
  });
});
