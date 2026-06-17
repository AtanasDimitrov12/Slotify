import { landingColors, premium, TicketRequestDialog } from '@barber/shared';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import { alpha, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import * as React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const kpis = [
  { label: 'Bookings (7d)', value: '128', color: landingColors.purple },
  { label: 'Revenue (7d)', value: '€2,840', color: landingColors.success },
  { label: 'No-shows', value: '6', color: '#F43F5E' },
  { label: 'Avg. occupancy', value: '74%', color: landingColors.blue },
];

const data = [
  { day: 'Mon', bookings: 14 },
  { day: 'Tue', bookings: 18 },
  { day: 'Wed', bookings: 22 },
  { day: 'Thu', bookings: 16 },
  { day: 'Fri', bookings: 28 },
  { day: 'Sat', bookings: 24 },
  { day: 'Sun', bookings: 6 },
];

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card
      sx={{
        borderRadius: `${premium.rLg * 4}px`,
        height: '100%',
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'translateY(-4px)', borderColor: alpha(color, 0.2) },
      }}
    >
      <CardContent sx={{ p: 3.5, textAlign: { xs: 'center', sm: 'left' } }}>
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
        <Typography
          sx={{
            fontWeight: 1000,
            fontSize: { xs: 32, sm: 36 },
            letterSpacing: -1,
            color: '#0F172A',
            mt: 1,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function OwnerOverviewPage() {
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'center', sm: 'center' }}
        spacing={3}
        sx={{ textAlign: { xs: 'center', sm: 'left' } }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: { xs: 32, sm: 36 },
              letterSpacing: -1.5,
              color: '#0F172A',
            }}
          >
            Overview
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}>
            Real-time performance of your salon.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<RequestQuoteRoundedIcon />}
          onClick={() => setRequestDialogOpen(true)}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1.5,
            width: { xs: '100%', sm: 'auto' },
            fontWeight: 600,
            fontSize: 14,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#1E293B',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Request Feature
        </Button>
      </Stack>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <StatCard {...k} />
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          borderRadius: `${premium.rLg * 4}px`,
          border: '1px solid',
          borderColor: 'rgba(15,23,42,0.06)',
          bgcolor: '#FFFFFF',
          boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Stack spacing={3}>
            <Typography sx={{ fontWeight: 1000, fontSize: 22, color: '#0F172A' }}>
              Booking Trends
            </Typography>
            <Box sx={{ height: 320, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={landingColors.purple} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={landingColors.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(15,23,42,0.04)"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontWeight: 700, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontWeight: 700, fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontWeight: 800,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke={landingColors.purple}
                    strokeWidth={4}
                    dot={{ r: 6, fill: landingColors.purple, strokeWidth: 3, stroke: '#FFF' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <TicketRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        requestType="owner"
      />
    </Stack>
  );
}
