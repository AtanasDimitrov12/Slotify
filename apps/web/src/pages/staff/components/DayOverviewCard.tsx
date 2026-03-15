import * as React from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { StaffAppointment } from '../../../api/staffAppointments';

const PRODUCTIVE_STATUSES: StaffAppointment['status'][] = [
  'pending',
  'confirmed',
  'completed',
];

export default function DayOverviewCard({
  appointments,
}: {
  appointments: StaffAppointment[];
}) {
  const productiveAppointments = appointments.filter((item) =>
    PRODUCTIVE_STATUSES.includes(item.status),
  );

  const totalBookedMinutes = productiveAppointments.reduce(
    (sum, item) => sum + item.durationMin,
    0,
  );

  const estimatedRevenue = productiveAppointments.reduce(
    (sum, item) => sum + item.priceEUR,
    0,
  );

  const noShows = appointments.filter((item) => item.status === 'no-show').length;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography fontWeight={900} sx={{ mb: 1.5 }}>
          Day overview
        </Typography>

        <Stack spacing={1}>
          <Typography>
            Appointments: <b>{productiveAppointments.length}</b>
          </Typography>
          <Typography>
            Booked time: <b>{totalBookedMinutes} min</b>
          </Typography>
          <Typography>
            Estimated revenue: <b>€{estimatedRevenue}</b>
          </Typography>
          <Typography>
            No-shows: <b>{noShows}</b>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}