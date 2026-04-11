import type { StaffAppointment } from '@barber/shared';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

const PRODUCTIVE_STATUSES: StaffAppointment['status'][] = ['pending', 'confirmed', 'completed'];

export default function DayOverviewCard({ appointments }: { appointments: StaffAppointment[] }) {
  const productiveAppointments = appointments.filter((item) =>
    PRODUCTIVE_STATUSES.includes(item.status),
  );

  const totalBookedMinutes = productiveAppointments.reduce(
    (sum, item) => sum + item.durationMin,
    0,
  );

  const estimatedRevenue = productiveAppointments.reduce((sum, item) => sum + item.priceEUR, 0);

  const noShows = appointments.filter((item) => item.status === 'no-show').length;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        bgcolor: '#FFF',
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2.5, fontWeight: 700, color: '#0F172A', letterSpacing: -0.5 }}
        >
          Day Overview
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
              Appointments
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#7C6CFF' }}>
              {productiveAppointments.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
              Booked Time
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>
              {totalBookedMinutes} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
              Estimated Revenue
            </Typography>
            <Typography sx={{ fontWeight: 800, color: '#10B981' }}>€{estimatedRevenue}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
              No-shows
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#EF4444' }}>{noShows}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
