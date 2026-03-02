import * as React from 'react';
import { alpha, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

type OverviewStats = {
  tenantsTotal: number;
  tenantsActive: number;
  tenantsPending: number;
  usersTotal: number;
  ownersTotal: number;
  employeesTotal: number;
  last24hLogins: number;
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        height: '100%',
        border: '1px solid',
        borderColor: alpha('#000', 0.08),
        bgcolor: alpha('#FFFFFF', 0.85),
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(16, 24, 40, 0.06)',
        transition: 'transform .15s ease, box-shadow .15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(16, 24, 40, 0.10)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={0.6}>
          <Typography color="text.secondary" fontWeight={800}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={1000} letterSpacing={-1}>
            {value}
          </Typography>
          {hint ? (
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {hint}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  // TODO: replace with API call: GET /admin/overview
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
      <Stack spacing={0.8} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={1000} letterSpacing={-0.6}>
          System overview
        </Typography>
        <Typography color="text.secondary" fontWeight={650}>
          Platform-level stats for Slotify (multi-tenant).
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Tenants registered" value={stats.tenantsTotal} hint="All salons created in the system." />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Active tenants" value={stats.tenantsActive} hint="Enabled & operational." />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Pending tenants" value={stats.tenantsPending} hint="Awaiting activation / setup." />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Logins (24h)" value={stats.last24hLogins} hint="Across all tenant accounts." />
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Total users" value={stats.usersTotal} hint="All accounts (owners + employees)." />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Owners" value={stats.ownersTotal} hint="Tenant owners/admins." />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard label="Employees" value={stats.employeesTotal} hint="Barbers / staff accounts." />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
          backdropFilter: 'blur(8px)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography fontWeight={1000} sx={{ mb: 0.8 }}>
            What we can add next
          </Typography>
          <Typography color="text.secondary" fontWeight={650}>
            Revenue/billing (if applicable), failed logins, booking volume, busiest tenants, churn, audit logs,
            and “impersonate tenant” for support.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}