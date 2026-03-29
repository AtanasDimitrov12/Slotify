import { landingColors, premium } from '@barber/shared';
import { alpha, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
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
      <CardContent sx={{ p: 3.5 }}>
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
          sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1, color: '#0F172A', mt: 1 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function OwnerOverviewPage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
          Overview
        </Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
          Real-time performance of your salon.
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography sx={{ fontWeight: 1000, fontSize: 22, color: '#0F172A' }}>
              Booking Trends
            </Typography>
            <Box sx={{ height: 320, width: '100%', ml: -2 }}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: `${premium.rLg * 4}px`,
              border: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography sx={{ fontWeight: 1000, fontSize: 20, mb: 2 }}>
                Upcoming Appointments
              </Typography>
              <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                Feature coming soon: Live view of your next 5 bookings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: `${premium.rLg * 4}px`,
              border: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography sx={{ fontWeight: 1000, fontSize: 20, mb: 2 }}>
                Staff Performance
              </Typography>
              <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                Feature coming soon: Booking distribution across your team.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
