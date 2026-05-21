import { getQualityMetrics, type QualityMetricsReport } from '@barber/shared';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import NetworkCheckRoundedIcon from '@mui/icons-material/NetworkCheckRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Link,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';

const COLORS = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  slate: '#1E293B',
  slateSoft: '#64748B',
  bg: '#F8FAFC',
  border: '#E2E8F0',
};

function MetricSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 6 }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 18, color: COLORS.slate }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontWeight: 500, fontSize: 14, color: COLORS.slateSoft }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {children}
    </Box>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  color = COLORS.info,
  tooltip,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  color?: string;
  tooltip?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: COLORS.border,
        bgcolor: '#FFFFFF',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Typography
            sx={{
              color: COLORS.slateSoft,
              fontWeight: 700,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {label}
            {tooltip && (
              <Tooltip title={tooltip} arrow>
                <InfoRoundedIcon sx={{ fontSize: 14, cursor: 'help' }} />
              </Tooltip>
            )}
          </Typography>
          {Icon && (
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(color, 0.08), color: color }}>
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
        </Stack>
        <Typography sx={{ fontWeight: 800, fontSize: 32, color: COLORS.slate, mb: 0.5 }}>
          {value}
        </Typography>
        {hint && (
          <Typography sx={{ color: COLORS.slateSoft, fontWeight: 600, fontSize: 13 }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function StepBadge({ name, status }: { name: string; status: string }) {
  const configs = {
    passed: { color: COLORS.success, icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> },
    failed: { color: COLORS.error, icon: <ErrorRoundedIcon sx={{ fontSize: 14 }} /> },
    pending: { color: COLORS.info, icon: <PendingRoundedIcon sx={{ fontSize: 14 }} /> },
    skipped: { color: COLORS.slateSoft, icon: <PendingRoundedIcon sx={{ fontSize: 14 }} /> },
    unknown: { color: COLORS.slateSoft, icon: <InfoRoundedIcon sx={{ fontSize: 14 }} /> },
  };

  const config = configs[status as keyof typeof configs] || {
    color: COLORS.slateSoft,
    icon: <InfoRoundedIcon sx={{ fontSize: 14 }} />,
  };

  return (
    <Chip
      icon={config.icon}
      label={name}
      sx={{
        bgcolor: alpha(config.color, 0.08),
        color: config.color,
        fontWeight: 700,
        fontSize: 11,
        borderRadius: 1,
        height: 24,
        border: `1px solid ${alpha(config.color, 0.15)}`,
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
}

export default function QualityMetricsPage() {
  const [report, setReport] = React.useState<QualityMetricsReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState(30);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMetrics = React.useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQualityMetrics(days);
      setReport(data);
    } catch (err) {
      setError('Failed to load quality metrics. Please ensure backend services are running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics(period);
  }, [period, fetchMetrics]);

  if (loading && !report) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width={400} height={60} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || (report && !report.isConfigured && !report.systemHealth)) {
    return (
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 32, color: COLORS.slate, mb: 3 }}>
          System Quality Metrics
        </Typography>
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ borderRadius: 2, bgcolor: alpha(COLORS.warning, 0.02) }}
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Service Partially Configured</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
            {error || 'Some CI/CD metrics might be missing. Ensure GitHub integration is configured.'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!report) return null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: 32, letterSpacing: -0.5, color: COLORS.slate }}
          >
            Quality & Performance
          </Typography>
          <Typography sx={{ color: COLORS.slateSoft, fontWeight: 500, fontSize: 16 }}>
            Real-time DORA metrics, system health, and engineering efficiency.
          </Typography>
        </Box>

        <Select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          size="small"
          sx={{
            minWidth: 160,
            borderRadius: 1.5,
            fontWeight: 600,
            bgcolor: '#FFFFFF',
            '& .MuiSelect-select': { py: 1 },
          }}
        >
          <MenuItem value={7}>Last 7 days</MenuItem>
          <MenuItem value={30}>Last 30 days</MenuItem>
          <MenuItem value={90}>Last 90 days</MenuItem>
        </Select>
      </Stack>

      <Grid container spacing={4}>
        {/* System & API Health */}
        <Grid item xs={12}>
          <MetricSection
            title="Live System Performance"
            subtitle="Real-time infrastructure health and API responsiveness."
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="CPU Usage"
                  value={report.systemHealth ? `${report.systemHealth.cpuUsage.toFixed(1)}%` : '---'}
                  hint="OS Load Average"
                  icon={SpeedRoundedIcon}
                  color={(report.systemHealth?.cpuUsage ?? 0) > 80 ? COLORS.error : COLORS.success}
                  tooltip="Average CPU load reported by the operating system."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="Memory Usage"
                  value={report.systemHealth ? `${report.systemHealth.memoryUsage.toFixed(1)}%` : '---'}
                  hint="Active Memory"
                  icon={MemoryRoundedIcon}
                  color={(report.systemHealth?.memoryUsage ?? 0) > 90 ? COLORS.error : COLORS.info}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="API p95 Latency"
                  value={report.apiPerformance ? `${Math.round(report.apiPerformance.p95ms)}ms` : '---'}
                  hint="Tail Latency"
                  icon={NetworkCheckRoundedIcon}
                  color={(report.apiPerformance?.p95ms ?? 0) > 500 ? COLORS.warning : COLORS.purple}
                  tooltip="The response time that 95% of API requests are faster than."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="API Error Rate"
                  value={report.apiPerformance ? `${report.apiPerformance.errorRate.toFixed(2)}%` : '---'}
                  hint="Failed Requests"
                  icon={ErrorRoundedIcon}
                  color={(report.apiPerformance?.errorRate ?? 0) > 1 ? COLORS.error : COLORS.success}
                />
              </Grid>
            </Grid>
          </MetricSection>
        </Grid>

        {/* User Experience Metrics (RUM) */}
        <Grid item xs={12}>
          <MetricSection
            title="User Experience (Web Vitals)"
            subtitle="Real User Monitoring (RUM) metrics from frontend clients."
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="LCP (Largest Paint)"
                  value={report.webVitals ? `${(report.webVitals.lcp / 1000).toFixed(2)}s` : '---'}
                  hint={(report.webVitals?.lcp ?? 0) < 2500 ? 'Good' : 'Needs Improvement'}
                  icon={DevicesRoundedIcon}
                  color={(report.webVitals?.lcp ?? 0) < 2500 ? COLORS.success : COLORS.warning}
                  tooltip="Largest Contentful Paint measures loading performance."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="FCP (First Paint)"
                  value={report.webVitals ? `${(report.webVitals.fcp / 1000).toFixed(2)}s` : '---'}
                  hint="Visual feedback speed"
                  icon={TimerRoundedIcon}
                  color={COLORS.info}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="INP (Interaction)"
                  value={report.webVitals ? `${Math.round(report.webVitals.inp)}ms` : '---'}
                  hint={(report.webVitals?.inp ?? 0) < 200 ? 'Good' : 'Needs Improvement'}
                  icon={RocketLaunchRoundedIcon}
                  color={(report.webVitals?.inp ?? 0) < 200 ? COLORS.success : COLORS.warning}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="CLS (Stability)"
                  value={report.webVitals ? report.webVitals.cls.toFixed(3) : '---'}
                  hint="Layout shift score"
                  icon={BugReportRoundedIcon}
                  color={(report.webVitals?.cls ?? 0) < 0.1 ? COLORS.success : COLORS.error}
                />
              </Grid>
            </Grid>
          </MetricSection>
        </Grid>

        {/* Executive DORA Metrics */}
        <Grid item xs={12}>
          <MetricSection
            title="DORA Performance"
            subtitle="The four key metrics of high-performing software organizations."
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="Deployment Freq"
                  value={`${report.doraMetrics.deploymentFrequency.toFixed(2)}/d`}
                  hint="Productive code integration"
                  icon={RocketLaunchRoundedIcon}
                  color={COLORS.purple}
                  tooltip="Average number of successful deployments to production/main per day."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="Lead Time (Dev)"
                  value={
                    report.doraMetrics.ticketLeadTimeMinutes > 0
                      ? `${Math.round(report.doraMetrics.ticketLeadTimeMinutes)}m`
                      : '---'
                  }
                  hint="Ticket Start → Finish"
                  icon={TimerRoundedIcon}
                  color={COLORS.info}
                  tooltip="Average time from when a developer starts working on a ticket to when it is marked as done."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="Failure Rate"
                  value={`${report.doraMetrics.changeFailureRate.toFixed(1)}%`}
                  hint="CI build stability"
                  icon={BugReportRoundedIcon}
                  color={COLORS.error}
                  tooltip="Percentage of changes that result in CI failures or require immediate remediation."
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  label="Recovery Time"
                  value={
                    report.doraMetrics.recoveryTimeMinutes
                      ? `${Math.round(report.doraMetrics.recoveryTimeMinutes)}m`
                      : 'N/A'
                  }
                  hint="Time to restore service"
                  icon={EngineeringRoundedIcon}
                  color={COLORS.warning}
                  tooltip="Average time between a failed build and the subsequent successful fix."
                />
              </Grid>
            </Grid>
          </MetricSection>
        </Grid>

        {/* Product Delivery Details */}
        <Grid item xs={12} md={7}>
          <MetricSection title="Delivery Efficiency" subtitle="Cycle time and throughput trends.">
            <Card
              elevation={0}
              sx={{ borderRadius: 2, border: '1px solid', borderColor: COLORS.border }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={4}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: COLORS.slateSoft,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          mb: 1,
                        }}
                      >
                        Throughput (Velocity)
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 24, color: COLORS.slate }}>
                        {report.ticketMetrics.totalCompleted}{' '}
                        <Typography
                          component="span"
                          sx={{ fontSize: 14, color: COLORS.slateSoft, fontWeight: 600 }}
                        >
                          tickets completed
                        </Typography>
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: COLORS.slateSoft,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          mb: 1,
                        }}
                      >
                        Avg. Cycle Time
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 24, color: COLORS.slate }}>
                        {Math.round(report.ticketMetrics.avgCycleTimeMinutes / 60)}{' '}
                        <Typography
                          component="span"
                          sx={{ fontSize: 14, color: COLORS.slateSoft, fontWeight: 600 }}
                        >
                          hours from request
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Typography
                      sx={{
                        color: COLORS.slateSoft,
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        mb: 2,
                      }}
                    >
                      Work Distribution by Type
                    </Typography>
                    <Stack spacing={1.5}>
                      {Object.entries(report.ticketMetrics.byType).map(([type, count]) => (
                        <Box key={type}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: COLORS.slate,
                                textTransform: 'capitalize',
                              }}
                            >
                              {type}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 13, fontWeight: 700, color: COLORS.slateSoft }}
                            >
                              {count}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(count / (report.ticketMetrics.totalRequested || 1)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(COLORS.slate, 0.05),
                              '& .MuiLinearProgress-bar': {
                                bgcolor:
                                  type === 'bugfix'
                                    ? COLORS.error
                                    : type === 'feature'
                                      ? COLORS.purple
                                      : COLORS.info,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </MetricSection>
        </Grid>

        {/* CI/CD Pipeline Status */}
        <Grid item xs={12} md={5}>
          <MetricSection title="CI/CD Integrity" subtitle="Health of the automated pipeline.">
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: COLORS.border,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 700, color: COLORS.slate }}>
                      Last Build Status
                    </Typography>
                    {report.lastRun && (
                      <Chip
                        label={report.lastRun.conclusion?.toUpperCase() || report.lastRun.status}
                        size="small"
                        sx={{
                          bgcolor:
                            report.lastRun.conclusion === 'success'
                              ? alpha(COLORS.success, 0.1)
                              : alpha(COLORS.error, 0.1),
                          color:
                            report.lastRun.conclusion === 'success' ? COLORS.success : COLORS.error,
                          fontWeight: 800,
                          fontSize: 10,
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Stack>

                  {report.lastRun && (
                    <Box
                      sx={{
                        bgcolor: COLORS.bg,
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: COLORS.border,
                      }}
                    >
                      <Typography
                        sx={{ color: COLORS.slate, fontWeight: 700, fontSize: 14, mb: 0.5 }}
                      >
                        {report.lastRun.title}
                      </Typography>
                      <Typography
                        sx={{ color: COLORS.slateSoft, fontWeight: 500, fontSize: 12, mb: 1.5 }}
                      >
                        Run #{report.lastRun.runNumber} on {report.lastRun.branch}
                      </Typography>
                      <Link
                        href={report.lastRun.url}
                        target="_blank"
                        sx={{
                          fontWeight: 700,
                          color: COLORS.info,
                          fontSize: 13,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        View on GitHub →
                      </Link>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      sx={{
                        color: COLORS.slateSoft,
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        mb: 2,
                      }}
                    >
                      Build Steps
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {report.stepStatus?.map((step) => (
                        <StepBadge key={step.name} name={step.name} status={step.status} />
                      ))}
                    </Stack>
                  </Box>

                  <Divider />

                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: COLORS.slateSoft, fontSize: 13, fontWeight: 600 }}>
                        Pipeline Success Rate
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                        {report.ciMetrics.successRate.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: COLORS.slateSoft, fontSize: 13, fontWeight: 600 }}>
                        Avg. Build Duration
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                        {report.ciMetrics.averageDurationMinutes.toFixed(1)}m
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </MetricSection>
        </Grid>

        {/* Audit Log */}
        <Grid item xs={12}>
          <MetricSection
            title="Deployment History"
            subtitle="Detailed log of recent CI workflow executions."
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: COLORS.border,
                overflow: 'hidden',
              }}
            >
              <Stack divider={<Divider />}>
                {report.recentRuns.map((run) => (
                  <Box
                    key={run.id}
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      '&:hover': { bgcolor: COLORS.bg },
                    }}
                  >
                    {run.conclusion === 'success' ? (
                      <CheckCircleRoundedIcon sx={{ color: COLORS.success, fontSize: 20 }} />
                    ) : (
                      <ErrorRoundedIcon sx={{ color: COLORS.error, fontSize: 20 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{ fontWeight: 700, color: COLORS.slate, fontSize: 14 }}
                      >
                        {run.title}
                      </Typography>
                      <Typography sx={{ color: COLORS.slateSoft, fontSize: 12, fontWeight: 500 }}>
                        Run #{run.runNumber} • {run.branch} •{' '}
                        {new Date(run.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: COLORS.slateSoft }}>
                      {(run.durationMs / 1000 / 60).toFixed(1)}m
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </MetricSection>
        </Grid>
      </Grid>
    </Box>
  );
}
