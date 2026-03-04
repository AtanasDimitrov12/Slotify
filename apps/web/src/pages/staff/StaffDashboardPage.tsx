import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import type { Appointment } from './components/types';

const today: Appointment[] = [
  { id: 'a1', startTime: '10:00', customerName: 'Alex', serviceName: 'Haircut', durationMin: 30, status: 'upcoming' },
  { id: 'a2', startTime: '11:00', customerName: 'Mariya', serviceName: 'Beard', durationMin: 20, status: 'upcoming' },
  { id: 'a3', startTime: '14:30', customerName: 'Daniel', serviceName: 'Hair + Beard', durationMin: 50, status: 'upcoming' },
];

function StatusChip({ status }: { status: Appointment['status'] }) {
  const label = status === 'upcoming' ? 'Upcoming' : status === 'done' ? 'Done' : 'No-show';
  return <Chip label={label} size="small" />;
}

export default function StaffDashboardPage() {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Dashboard
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Today’s schedule and quick overview.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                Today’s appointments
              </Typography>

              <Stack spacing={1.25}>
                {today.map((a) => (
                  <Box
                    key={a.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography fontWeight={900} sx={{ width: 72 }}>
                      {a.startTime}
                    </Typography>

                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={800}>
                        {a.customerName} — {a.serviceName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        {a.durationMin} min
                      </Typography>
                    </Box>

                    <StatusChip status={a.status} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>This week</Typography>
                <Typography sx={{ opacity: 0.7 }}>Placeholder KPIs</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography>Bookings: <b>24</b></Typography>
                  <Typography>Revenue: <b>€540</b></Typography>
                  <Typography>No-shows: <b>1</b></Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>Quick tips</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Keep your availability accurate so customers can book only when you’re available.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}