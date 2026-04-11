import { type CustomerInsights, landingColors } from '@barber/shared';
import {
  CheckCircleRounded as CheckCircleIcon,
  ErrorRounded as ErrorIcon,
  HistoryRounded as HistoryIcon,
  PersonSearchRounded as IdentityIcon,
  DomainRounded as NetworkIcon,
  PublicRounded as PublicIcon,
  AssessmentRounded as ReliabilityIcon,
  ShieldRounded as ShieldIcon,
  HandshakeRounded as TrustIcon,
  ReportProblemRounded as UrgentIcon,
  WarningRounded as WarningIcon,
} from '@mui/icons-material';
import { alpha, Box, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type React from 'react';

interface CustomerInsightsCardProps {
  insights: CustomerInsights;
}

export default function CustomerInsightsCard({ insights }: CustomerInsightsCardProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return '#10B981'; // Green
    if (score < 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const riskColor = getRiskColor(insights.riskScore);

  const getFactorIcon = (factor: string) => {
    if (factor.startsWith('Identity:'))
      return <IdentityIcon sx={{ color: '#6366F1', fontSize: 16 }} />;
    if (factor.startsWith('Local:'))
      return <ReliabilityIcon sx={{ color: '#10B981', fontSize: 16 }} />;
    if (factor.startsWith('Network:'))
      return <NetworkIcon sx={{ color: '#8B5CF6', fontSize: 16 }} />;
    if (factor.startsWith('Urgent:')) return <UrgentIcon sx={{ color: '#EF4444', fontSize: 16 }} />;
    if (factor.startsWith('Reliability:'))
      return <AssessmentRoundedIcon sx={{ color: '#F59E0B', fontSize: 16 }} />;
    if (factor.startsWith('Trust:')) return <TrustIcon sx={{ color: '#64748B', fontSize: 16 }} />;
    return <WarningIcon sx={{ color: '#F59E0B', fontSize: 16 }} />;
  };

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: 3,
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        boxShadow: '0 12px 24px -4px rgba(15,23,42,0.06)',
      }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: alpha(riskColor, 0.03),
          borderBottom: '1px solid rgba(15,23,42,0.05)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: alpha(riskColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: riskColor,
              }}
            >
              <ShieldIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#0F172A', lineHeight: 1.2 }}>
                DNA Intelligence
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#64748B' }}>
                Integrity & Risk Analysis
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha(riskColor, 0.08),
              border: `1px solid ${alpha(riskColor, 0.15)}`,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: riskColor,
                boxShadow: `0 0 8px ${alpha(riskColor, 0.4)}`,
              }}
            />
            <Typography
              sx={{
                color: riskColor,
                fontWeight: 800,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {insights.riskScore < 30
                ? 'Low Risk'
                : insights.riskScore < 60
                  ? 'Medium Risk'
                  : 'High Risk'}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ px: 0.5 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>
              Risk Assessment Score
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 1000, color: riskColor }}>
              {insights.riskScore}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={insights.riskScore}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(riskColor, 0.08),
              '& .MuiLinearProgress-bar': {
                bgcolor: riskColor,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Verification Status */}
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 900,
              color: '#94A3B8',
              textTransform: 'uppercase',
              mb: 2,
              letterSpacing: 1,
              textAlign: 'center',
            }}
          >
            Trust Verification
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            <VerificationChip
              label={insights.verification.isRegistered ? 'Verified Account' : 'Guest Identity'}
              verified={insights.verification.isRegistered}
            />
            <VerificationChip
              label={insights.verification.isEmailVerified ? 'Email Confirmed' : 'Email Pending'}
              verified={insights.verification.isEmailVerified}
            />
            <VerificationChip
              label={insights.verification.hasPhone ? 'Phone Bound' : 'No Phone'}
              verified={insights.verification.hasPhone}
            />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'rgba(15,23,42,0.06)' }} />

        {/* History Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatBox
              icon={<HistoryIcon sx={{ fontSize: 18 }} />}
              label="Local Reputation"
              total={insights.stats.total}
              completed={insights.stats.completed}
              noShow={insights.stats.noShow}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatBox
              icon={<PublicIcon sx={{ fontSize: 18 }} />}
              label="Network Insights"
              total={insights.globalStats.total}
              completed={insights.globalStats.completed}
              noShow={insights.globalStats.noShow}
            />
          </Grid>
        </Grid>

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2.5,
              bgcolor: '#F8FAFC',
              border: '1px solid rgba(15,23,42,0.04)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 900,
                color: '#64748B',
                textTransform: 'uppercase',
                mb: 2,
                letterSpacing: 1,
              }}
            >
              Key Indicators
            </Typography>
            <Stack spacing={2}>
              {insights.riskFactors.map((factor, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ mt: 0.3, display: 'flex' }}>{getFactorIcon(factor)}</Box>
                  <Typography
                    sx={{ fontSize: 13, color: '#334155', fontWeight: 600, lineHeight: 1.5 }}
                  >
                    {factor.includes(':') ? (
                      <>
                        <Box component="span" sx={{ color: '#0F172A', fontWeight: 800 }}>
                          {factor.split(':')[0]}:
                        </Box>
                        {factor.split(':').slice(1).join(':')}
                      </>
                    ) : (
                      factor
                    )}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function VerificationChip({ label, verified }: { label: string; verified: boolean }) {
  const color = verified ? '#10B981' : '#94A3B8';
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 2,
        bgcolor: alpha(color, 0.05),
        border: `1px solid ${alpha(color, 0.1)}`,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />
      <Typography
        sx={{
          color: verified ? '#059669' : '#64748B',
          fontWeight: 800,
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function StatBox({
  icon,
  label,
  total,
  completed,
  noShow,
}: {
  icon: React.ReactNode;
  label: string;
  total: number;
  completed: number;
  noShow: number;
}) {
  const reliability = total > 0 ? Math.round((completed / total) * 100) : 100;

  return (
    <Box
      sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid rgba(15,23,42,0.04)' }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
        <Box sx={{ color: landingColors.purple, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#64748B' }}>{label}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Total</Typography>
          <Typography sx={{ fontSize: 11, color: '#0F172A', fontWeight: 800 }}>{total}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
            Reliability
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              color: reliability > 70 ? '#10B981' : reliability > 40 ? '#F59E0B' : '#EF4444',
              fontWeight: 800,
            }}
          >
            {reliability}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>No-shows</Typography>
          <Typography sx={{ fontSize: 11, color: '#EF4444', fontWeight: 800 }}>{noShow}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

const AssessmentRoundedIcon = ReliabilityIcon; // Alias for consistency if needed or just use ReliabilityIcon
