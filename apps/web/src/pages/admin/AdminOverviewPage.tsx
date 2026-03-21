import * as React from 'react';
import { alpha, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { landingColors, premium } from '../../components/landing/constants';

type OverviewStats = {
  tenantsTotal: number;
  tenantsActive: number;
  tenantsPending: number;
  usersTotal: number;
  ownersTotal: number;
  employeesTotal: number;
  last24hLogins: number;
};

function StatCard({ label, value, hint, accent = landingColors.purple }: { label: string; value: string | number; hint?: string; accent?: string }) {
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
          <Typography sx={{ color: '#64748B', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {label}
          </Typography>
          <Typography sx={{ fontWeight: 1000, fontSize: 44, letterSpacing: -1.5, color: '#0F172A', lineHeight: 1 }}>
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

export default function AdminOverviewPage() {
  const stats: OverviewStats = React.useMemo(
    () => ({
      tenantsTotal: 12,
      tenantsActive: 10,
      tenantsPending: 2,
      usersTotal: 146,
      ownersTotal: 18,
      employeesTotal: 128,
      last24hLogins: 34,
    }),
    [],
  );

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
          System Overview
        </Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
          Platform-level analytics and tenant operations.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Tenants registered" value={stats.tenantsTotal} hint="All salons created in the system" accent={landingColors.purple} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Active tenants" value={stats.tenantsActive} hint="Operational & public" accent={landingColors.success} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Pending tenants" value={stats.tenantsPending} hint="Awaiting activation" accent={landingColors.blue} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Logins (24h)" value={stats.last24hLogins} hint="Across all tenant accounts" accent={landingColors.purple} />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Total users" value={stats.usersTotal} hint="Owners + Employees" />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Owners" value={stats.ownersTotal} hint="Tenant administrators" />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Employees" value={stats.employeesTotal} hint="Barbers and staff" />
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: `${premium.rLg * 4}px`,
              border: '1px solid',
              borderColor: alpha(landingColors.purple, 0.12),
              bgcolor: alpha(landingColors.purple, 0.04),
              p: 1,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha(landingColors.purple, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                    color: landingColors.purple,
                  }}
                >
                  <Typography sx={{ fontWeight: 1000 }}>🚀</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>
                    What's next?
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                    We'll soon add revenue tracking, busiest salons analysis, and detailed audit logs.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}