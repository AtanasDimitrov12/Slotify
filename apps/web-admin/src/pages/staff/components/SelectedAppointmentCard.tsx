import type { StaffAppointment } from '@barber/shared';
import { landingColors } from '@barber/shared';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
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
  onViewInsights,
}: {
  selectedAppointment: StaffAppointment | null;
  onEdit: () => void;
  onCancel: () => void;
  onMarkDone: () => void;
  onMarkNoShow: () => void;
  onViewInsights?: () => void;
}) {
  if (!selectedAppointment) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px dashed rgba(15,23,42,0.12)',
          bgcolor: 'transparent',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#64748B', fontSize: 16 }}>
            No Selection
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: 13, mt: 1, maxWidth: 200, mx: 'auto' }}>
            Select an appointment to view details and manage booking.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const status = selectedAppointment.status;
  const canCancel = status === 'pending' || status === 'confirmed';
  const canMarkDone = status === 'pending' || status === 'confirmed';
  const canMarkNoShow = status === 'pending' || status === 'confirmed';

  const isOverdue =
    (status === 'pending' || status === 'confirmed') &&
    new Date(selectedAppointment.startTime) < new Date();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: isOverdue ? '2px solid #EF4444' : '1px solid rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: isOverdue
          ? `0 0 20px ${alpha('#EF4444', 0.15)}`
          : '0 10px 40px rgba(15,23,42,0.03)',
        animation: isOverdue ? 'pulse-border 2s infinite ease-in-out' : 'none',
        '@keyframes pulse-border': {
          '0%': { borderColor: alpha('#EF4444', 0.4) },
          '50%': { borderColor: alpha('#EF4444', 1) },
          '100%': { borderColor: alpha('#EF4444', 0.4) },
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {isOverdue && (
            <Box
              sx={{
                bgcolor: alpha('#EF4444', 0.08),
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <Typography sx={{ color: '#EF4444', fontWeight: 900, fontSize: 13, mb: 0.5 }}>
                RUNNING LATE
              </Typography>
              <Typography sx={{ color: '#991B1B', fontWeight: 600, fontSize: 12 }}>
                This appointment was scheduled to start at{' '}
                {formatTimeOnly(selectedAppointment.startTime)}. Is the customer here?
              </Typography>
            </Box>
          )}

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography
                sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: -0.5 }}
              >
                Booking Details
              </Typography>
              {onViewInsights && (
                <Tooltip title={`DNA Risk: ${selectedAppointment.riskScore ?? 'N/A'}%`} arrow>
                  <Button
                    size="small"
                    onClick={onViewInsights}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      borderRadius: 1.5,
                      px: 1.25,
                      py: 0.5,
                      minWidth: 'auto',
                      bgcolor: () => {
                        const score = selectedAppointment.riskScore;
                        if (score === undefined) return alpha(landingColors.purple, 0.05);
                        if (score < 30) return alpha('#10B981', 0.05);
                        if (score < 60) return alpha('#F59E0B', 0.05);
                        return alpha('#EF4444', 0.05);
                      },
                      color: () => {
                        const score = selectedAppointment.riskScore;
                        if (score === undefined) return landingColors.purple;
                        if (score < 30) return '#10B981';
                        if (score < 60) return '#F59E0B';
                        return '#EF4444';
                      },
                      border: '1px solid currentColor',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: () => {
                          const score = selectedAppointment.riskScore;
                          let color = landingColors.purple;
                          if (score !== undefined) {
                            if (score < 30) color = '#10B981';
                            else if (score < 60) color = '#F59E0B';
                            else color = '#EF4444';
                          }
                          return alpha(color, 0.1);
                        },
                      },
                    }}
                  >
                    DNA{' '}
                    {selectedAppointment.riskScore !== undefined
                      ? `${selectedAppointment.riskScore}%`
                      : 'Check'}
                  </Button>
                </Tooltip>
              )}
            </Stack>

            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: '#94A3B8', display: 'flex' }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>
                  {formatTimeOnly(selectedAppointment.startTime)}
                  <Box component="span" sx={{ color: '#CBD5E1', mx: 1 }}>
                    •
                  </Box>
                  {selectedAppointment.durationMin} min
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: '#94A3B8', display: 'flex' }}>
                  <PersonRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                  {selectedAppointment.customerName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: '#94A3B8', display: 'flex' }}>
                  <ContentCutRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>
                  {selectedAppointment.serviceName}
                </Typography>
              </Stack>

              {selectedAppointment.notes ? (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: alpha('#F1F5F9', 0.5),
                    borderRadius: 2,
                    border: '1px solid rgba(15,23,42,0.04)',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <NotesRoundedIcon sx={{ fontSize: 16, color: '#94A3B8', mt: 0.2 }} />
                    <Typography
                      sx={{ fontWeight: 500, fontSize: 13, color: '#64748B', lineHeight: 1.5 }}
                    >
                      {selectedAppointment.notes}
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 11,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Current Status
            </Typography>
            <AppointmentStatusChip status={selectedAppointment.status} />
          </Stack>

          <Divider sx={{ borderColor: 'rgba(15,23,42,0.04)' }} />

          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onEdit}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: 13,
                  py: 1,
                  textTransform: 'none',
                  borderColor: 'rgba(15,23,42,0.1)',
                  color: '#475569',
                  '&:hover': {
                    bgcolor: alpha('#0F172A', 0.02),
                    borderColor: 'rgba(15,23,42,0.2)',
                  },
                }}
              >
                Edit
              </Button>

              {canCancel ? (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={onCancel}
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: 13,
                    py: 1,
                    textTransform: 'none',
                    borderColor: alpha('#F43F5E', 0.15),
                    color: '#F43F5E',
                    '&:hover': {
                      bgcolor: alpha('#F43F5E', 0.02),
                      borderColor: alpha('#F43F5E', 0.3),
                    },
                  }}
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
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: 14,
                  py: 1.5,
                  textTransform: 'none',
                  bgcolor: landingColors.purple,
                  boxShadow: `0 8px 20px ${alpha(landingColors.purple, 0.2)}`,
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.9),
                    boxShadow: `0 10px 25px ${alpha(landingColors.purple, 0.3)}`,
                  },
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
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'none',
                }}
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
