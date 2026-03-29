import { Chip } from '@mui/material';
import * as React from 'react';
import type { StaffAppointment } from '../../../api/staffAppointments';

export default function AppointmentStatusChip({ status }: { status: StaffAppointment['status'] }) {
  const config =
    status === 'confirmed' || status === 'pending'
      ? { label: status === 'pending' ? 'Pending' : 'Upcoming', color: 'primary' as const }
      : status === 'completed'
        ? { label: 'Done', color: 'success' as const }
        : status === 'no-show'
          ? { label: 'No-show', color: 'error' as const }
          : { label: 'Cancelled', color: 'default' as const };

  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
}
