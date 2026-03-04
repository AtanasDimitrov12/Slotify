import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
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
  { label: 'Bookings (7d)', value: '128' },
  { label: 'Revenue (7d)', value: '€2,840' },
  { label: 'No-shows', value: '6' },
  { label: 'Avg. occupancy', value: '74%' },
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

export default function OwnerOverviewPage() {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Overview
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Your salon performance at a glance.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {k.label}
                </Typography>
                <Typography variant="h5" fontWeight={900}>
                  {k.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={800}>
              Bookings trend (last 7 days)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Later cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                Upcoming appointments
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Placeholder: list next 5 bookings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                Staff performance
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Placeholder: bookings per staff member.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}