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
        borderRadius: 4,
        border: '1px solid rgba(15,23,42,0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(15,23,42,0.03)',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          bgcolor: alpha(riskColor, 0.04),
          borderBottom: '1px solid rgba(15,23,42,0.05)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ShieldIcon sx={{ color: riskColor, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
              Customer DNA Intelligence
            </Typography>
          </Stack>
          <Chip
            label={
              insights.riskScore < 30
                ? 'Low Risk'
                : insights.riskScore < 60
                  ? 'Medium Risk'
                  : 'High Risk'
            }
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: 11,
              bgcolor: alpha(riskColor, 0.1),
              color: riskColor,
              border: `1px solid ${alpha(riskColor, 0.2)}`,
            }}
          />
        </Stack>

        <Box sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
              Risk Assessment Score
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: riskColor }}>
              {insights.riskScore}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={insights.riskScore}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(riskColor, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: riskColor,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        {/* Verification Status */}
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: '#94A3B8',
              textTransform: 'uppercase',
              mb: 1.5,
              letterSpacing: 0.5,
            }}
          >
            Identity & Trust Verification
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <VerificationChip
              label={insights.verification.isRegistered ? 'Registered User' : 'Guest Booking'}
              verified={insights.verification.isRegistered}
            />
            <VerificationChip
              label={insights.verification.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
              verified={insights.verification.isEmailVerified}
            />
            <VerificationChip
              label={insights.verification.hasPhone ? 'Phone Confirmed' : 'Phone Missing'}
              verified={insights.verification.hasPhone}
            />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'rgba(15,23,42,0.05)' }} />

        {/* History Stats */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <StatBox
              icon={<HistoryIcon sx={{ fontSize: 16 }} />}
              label="Local Reputation"
              total={insights.stats.total}
              completed={insights.stats.completed}
              noShow={insights.stats.noShow}
            />
          </Grid>
          <Grid item xs={6}>
            <StatBox
              icon={<PublicIcon sx={{ fontSize: 16 }} />}
              label="Network Insights"
              total={insights.globalStats.total}
              completed={insights.globalStats.completed}
              noShow={insights.globalStats.noShow}
            />
          </Grid>
        </Grid>

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
                mb: 1.5,
                letterSpacing: 0.5,
              }}
            >
              Identified Risk Indicators
            </Typography>
            <Stack spacing={1.5}>
              {insights.riskFactors.map((factor, index) => (
                <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ mt: 0.2, display: 'flex' }}>{getFactorIcon(factor)}</Box>
                  <Typography
                    sx={{ fontSize: 13, color: '#475569', fontWeight: 600, lineHeight: 1.4 }}
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
  return (
    <Chip
      icon={
        verified ? (
          <CheckCircleIcon style={{ fontSize: 14, color: '#10B981' }} />
        ) : (
          <ErrorIcon style={{ fontSize: 14, color: '#94A3B8' }} />
        )
      }
      label={label}
      size="small"
      sx={{
        height: 24,
        fontSize: 11,
        fontWeight: 800,
        bgcolor: verified ? alpha('#10B981', 0.05) : alpha('#94A3B8', 0.05),
        color: verified ? '#059669' : '#64748B',
        border: `1px solid ${verified ? alpha('#10B981', 0.1) : alpha('#94A3B8', 0.1)}`,
        '& .MuiChip-icon': { ml: 0.5 },
      }}
    />
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
