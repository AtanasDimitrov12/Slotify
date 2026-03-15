import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import type { StaffAppointment } from '../../../api/staffAppointments';
import AppointmentStatusChip from './AppointmentStatusChip';

function formatTimeOnly(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SelectedAppointmentCard({
  selectedAppointment,
  onEdit,
  onCancel,
  onMarkDone,
  onMarkNoShow,
}: {
  selectedAppointment: StaffAppointment | null;
  onEdit: () => void;
  onCancel: () => void;
  onMarkDone: () => void;
  onMarkNoShow: () => void;
}) {
  if (!selectedAppointment) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={900} sx={{ mb: 1.5 }}>
            Selected appointment
          </Typography>

          <Typography sx={{ opacity: 0.7 }}>
            Select an appointment from the schedule to manage it.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const status = selectedAppointment.status;
  const canCancel = status === 'pending' || status === 'confirmed';
  const canMarkDone = status === 'pending' || status === 'confirmed';
  const canMarkNoShow = status === 'pending' || status === 'confirmed';

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography fontWeight={900} sx={{ mb: 1.5 }}>
          Selected appointment
        </Typography>

        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRoundedIcon fontSize="small" />
            <Typography>
              {formatTimeOnly(selectedAppointment.startTime)} · {selectedAppointment.durationMin} min
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <PersonRoundedIcon fontSize="small" />
            <Typography>{selectedAppointment.customerName}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <ContentCutRoundedIcon fontSize="small" />
            <Typography>{selectedAppointment.serviceName}</Typography>
          </Stack>

          {selectedAppointment.notes ? (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <NotesRoundedIcon fontSize="small" sx={{ mt: 0.2 }} />
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedAppointment.notes}
              </Typography>
            </Stack>
          ) : null}

          <AppointmentStatusChip status={selectedAppointment.status} />

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" size="small" onClick={onEdit}>
              Edit
            </Button>

            {canCancel ? (
              <Button variant="outlined" size="small" color="error" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}

            {canMarkDone ? (
              <Button variant="contained" size="small" onClick={onMarkDone}>
                Mark done
              </Button>
            ) : null}

            {canMarkNoShow ? (
              <Button variant="outlined" size="small" onClick={onMarkNoShow}>
                No-show
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}