import { getQualityMetrics, landingColors, premium, type QualityMetricsReport } from '@barber/shared';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import { alpha, Box, Card, CardContent, Grid, MenuItem, Select, Stack, Typography, Tooltip, Divider, Link, Chip, Skeleton, Alert } from '@mui/material';
import * as React from 'react';

function StatCard({
  label,
  value,
  hint,
  accent = landingColors.purple,
  tooltip,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  tooltip?: string;
}) {
  return (
    <Card
      sx={{
        borderRadius: `${premium.rLg * 4}px`,
        height: '100%',
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
          borderColor: alpha(accent, 0.2),
        },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              sx={{
                color: '#64748B',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip} arrow>
                <InfoRoundedIcon sx={{ fontSize: 16, color: '#94A3B8', cursor: 'help' }} />
              </Tooltip>
            )}
          </Stack>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: 40,
              letterSpacing: -1.5,
              color: '#0F172A',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          {hint ? (
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              {hint}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepBadge({ name, status }: { name: string; status: string }) {
  const config = {
    passed: { color: landingColors.success, icon: <CheckCircleRoundedIcon fontSize="small" /> },
    failed: { color: landingColors.error, icon: <ErrorRoundedIcon fontSize="small" /> },
    pending: { color: landingColors.blue, icon: <PendingRoundedIcon fontSize="small" /> },
    skipped: { color: '#94A3B8', icon: <PendingRoundedIcon fontSize="small" /> },
    unknown: { color: '#94A3B8', icon: <InfoRoundedIcon fontSize="small" /> },
  }[status as keyof typeof config] || { color: '#94A3B8', icon: <InfoRoundedIcon fontSize="small" /> };

  return (
    <Chip
      icon={config.icon}
      label={name}
      sx={{
        bgcolor: alpha(config.color, 0.08),
        color: config.color,
        fontWeight: 800,
        borderRadius: 2,
        border: `1px solid ${alpha(config.color, 0.2)}`,
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
      setError('Failed to load quality metrics. Please ensure GitHub configuration is correct.');
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
      <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || (report && !report.isConfigured)) {
    return (
      <Box>
        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A', mb: 3 }}>
          System Quality Metrics
        </Typography>
        <Alert 
          severity="warning" 
          sx={{ borderRadius: 4, border: '1px solid', borderColor: 'warning.main', bgcolor: alpha(landingColors.warning, 0.05) }}
        >
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Metrics Not Configured</Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {error || 'GitHub API access is not configured. Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in the backend environment.'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!report) return null;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 5 }} spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
            System Quality Metrics
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Real-time CI/CD and DORA-style delivery performance.
          </Typography>
        </Box>

        <Select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          size="small"
          sx={{
            minWidth: 160,
            borderRadius: 3,
            fontWeight: 800,
            bgcolor: '#FFFFFF',
            '& .MuiSelect-select': { py: 1.2 },
          }}
        >
          <MenuItem value={7}>Last 7 days</MenuItem>
          <MenuItem value={30}>Last 30 days</MenuItem>
          <MenuItem value={90}>Last 90 days</MenuItem>
        </Select>
      </Stack>

      <Grid container spacing={3}>
        {/* DORA Metrics */}
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 900, color: '#64748B', fontSize: 14, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
            DORA Metrics (Approximations)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Deployment Freq"
            value={`${report.doraMetrics.deploymentFrequency.toFixed(2)}/d`}
            hint="Successful CI runs on main/dev"
            accent={landingColors.success}
            tooltip="How often code is successfully integrated into main branches."
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Lead Time"
            value={`${Math.round(report.doraMetrics.leadTimeMinutes)}m`}
            hint="Commit to successful build"
            accent={landingColors.blue}
            tooltip="Average time from first commit in a PR to successful CI completion."
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Change Failure Rate"
            value={`${report.doraMetrics.changeFailureRate.toFixed(1)}%`}
            hint="Failed vs Total CI runs"
            accent={landingColors.error}
            tooltip="Percentage of CI runs that resulted in a failure."
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Recovery Time"
            value={report.doraMetrics.recoveryTimeMinutes ? `${Math.round(report.doraMetrics.recoveryTimeMinutes)}m` : 'N/A'}
            hint="Time to fix a broken build"
            accent={landingColors.purple}
            tooltip="Average time between a failed build and the subsequent success on the same branch."
          />
        </Grid>

        {/* CI Status */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 900, color: '#64748B', fontSize: 14, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
            CI Health & Reliability
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 6, border: '1px solid rgba(15,23,42,0.06)', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>Last CI Status</Typography>
                  {report.lastRun && (
                    <Chip 
                      label={report.lastRun.conclusion?.toUpperCase() || report.lastRun.status}
                      sx={{ 
                        bgcolor: report.lastRun.conclusion === 'success' ? alpha(landingColors.success, 0.1) : alpha(landingColors.error, 0.1),
                        color: report.lastRun.conclusion === 'success' ? landingColors.success : landingColors.error,
                        fontWeight: 900,
                        borderRadius: 2
                      }}
                    />
                  )}
                </Stack>

                {report.lastRun && (
                  <Box>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: 16 }}>{report.lastRun.title}</Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14, mb: 2 }}>
                      Run #{report.lastRun.runNumber} on {report.lastRun.branch} • {new Date(report.lastRun.createdAt).toLocaleString()}
                    </Typography>
                    <Link href={report.lastRun.url} target="_blank" sx={{ fontWeight: 800, color: landingColors.purple, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      View on GitHub →
                    </Link>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: 13, color: '#94A3B8', mb: 2, textTransform: 'uppercase' }}>
                    Verification Steps (Latest Run)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {report.stepStatus?.map((step) => (
                      <StepBadge key={step.name} name={step.name} status={step.status} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 6, border: '1px solid rgba(15,23,42,0.06)', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography sx={{ fontWeight: 1000, fontSize: 20, mb: 3 }}>Efficiency Metrics</Typography>
              
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: '#64748B', fontWeight: 700 }}>Total Runs ({period}d)</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{report.ciMetrics.totalRuns}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: '#64748B', fontWeight: 700 }}>Successful Runs</Typography>
                  <Typography sx={{ fontWeight: 900, color: landingColors.success }}>{report.ciMetrics.successfulRuns}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: '#64748B', fontWeight: 700 }}>Success Rate</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{report.ciMetrics.successRate.toFixed(1)}%</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: '#64748B', fontWeight: 700 }}>Avg Run Duration</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{report.ciMetrics.averageDurationMinutes.toFixed(1)} min</Typography>
                </Stack>

                <Alert severity="info" sx={{ borderRadius: 3, bgcolor: alpha(landingColors.blue, 0.05), border: '1px solid', borderColor: alpha(landingColors.blue, 0.2) }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Evidence of system stability and delivery speed. DORA-style metrics are approximations based on CI workflow execution data.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 900, color: '#64748B', fontSize: 14, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
            Recent CI Runs
          </Typography>
          <Card sx={{ borderRadius: 6, border: '1px solid rgba(15,23,42,0.06)', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <Stack divider={<Divider />}>
              {report.recentRuns.map((run) => (
                <Box key={run.id} sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#F8FAFC' } }}>
                  {run.conclusion === 'success' ? (
                    <CheckCircleRoundedIcon sx={{ color: landingColors.success }} />
                  ) : (
                    <ErrorRoundedIcon sx={{ color: landingColors.error }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 800, color: '#0F172A' }}>{run.title}</Typography>
                    <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                      #{run.runNumber} on {run.branch} • {new Date(run.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#64748B' }}>
                    {(run.durationMs / 1000 / 60).toFixed(1)}m
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
