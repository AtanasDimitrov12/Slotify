import { type StaffAppointment } from '@barber/shared';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import * as React from 'react';

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
        bgcolor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: '0 10px 30px rgba(15,23,42,0.04)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          fontWeight={1000}
          variant="h6"
          sx={{ mb: 2, letterSpacing: -0.8, color: '#111827' }}
        >
          Day overview
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#475569', fontWeight: 600 }}>Appointments</Typography>
            <Typography sx={{ fontWeight: 900, color: '#7C6CFF' }}>
              {productiveAppointments.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#475569', fontWeight: 600 }}>Booked time</Typography>
            <Typography sx={{ fontWeight: 900, color: '#111827' }}>
              {totalBookedMinutes} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#475569', fontWeight: 600 }}>Estimated revenue</Typography>
            <Typography sx={{ fontWeight: 1000, color: '#10B981' }}>€{estimatedRevenue}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#475569', fontWeight: 600 }}>No-shows</Typography>
            <Typography sx={{ fontWeight: 900, color: '#EF4444' }}>{noShows}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
