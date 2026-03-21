import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  alpha,
  Box,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import type { StaffAppointment } from '../../../api/staffAppointments';
import AppointmentStatusChip from './AppointmentStatusChip';
import { landingColors, premium } from '../../../components/landing/constants';

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
      <Card
        sx={{
          borderRadius: `${premium.rLg * 4}px`,
          border: '1px dashed',
          borderColor: '#CBD5E1',
          bgcolor: 'transparent',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
            No appointment selected
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: 14, mt: 1 }}>
            Select a slot from the calendar to view details or manage the booking.
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
    <Card
      sx={{
        borderRadius: `${premium.rLg * 4}px`,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A', mb: 2 }}>
              Booking Details
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: landingColors.purple, display: 'grid', placeItems: 'center' }}>
                  <AccessTimeRoundedIcon fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#475569' }}>
                  {formatTimeOnly(selectedAppointment.startTime)} · {selectedAppointment.durationMin} min
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: landingColors.purple, display: 'grid', placeItems: 'center' }}>
                  <PersonRoundedIcon fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#0F172A' }}>
                  {selectedAppointment.customerName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: landingColors.purple, display: 'grid', placeItems: 'center' }}>
                  <ContentCutRoundedIcon fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#475569' }}>
                  {selectedAppointment.serviceName}
                </Typography>
              </Stack>

              {selectedAppointment.notes ? (
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ color: landingColors.purple, display: 'grid', placeItems: 'center', mt: 0.3 }}>
                    <NotesRoundedIcon fontSize="small" />
                  </Box>
                  <Typography sx={{ fontWeight: 500, fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>
                    {selectedAppointment.notes}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Status:
            </Typography>
            <AppointmentStatusChip status={selectedAppointment.status} />
          </Box>

          <Divider sx={{ borderColor: 'rgba(15,23,42,0.04)' }} />

          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onEdit}
                sx={{ borderRadius: 999, fontWeight: 900, borderColor: 'rgba(15,23,42,0.12)', color: '#475569' }}
              >
                Edit
              </Button>

              {canCancel ? (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={onCancel}
                  sx={{ borderRadius: 999, fontWeight: 900, borderColor: alpha('#F43F5E', 0.2), color: '#F43F5E' }}
                >
                  Cancel
                </Button>
              ) : null}
            </Stack>

            {canMarkDone ? (
              <Button
                variant="contained"
                fullWidth
                onClick={onMarkDone}
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: landingColors.purple,
                  minHeight: 48,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.2)}`,
                }}
              >
                Mark as Done
              </Button>
            ) : null}

            {canMarkNoShow ? (
              <Button
                variant="text"
                fullWidth
                color="error"
                onClick={onMarkNoShow}
                sx={{ borderRadius: 999, fontWeight: 900 }}
              >
                Customer No-Show
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}