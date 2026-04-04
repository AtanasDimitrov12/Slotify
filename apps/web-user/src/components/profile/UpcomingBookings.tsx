import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  CalendarMonthRounded,
  LocationOnRounded,
  PersonRounded,
  ContentCutRounded,
} from '@mui/icons-material';
import { type CustomerReservation } from '@barber/shared';

interface Props {
  reservations: CustomerReservation[];
}

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
  completed: '#3B82F6',
  'no-show': '#6B7280',
};

export default function UpcomingBookings({ reservations }: Props) {
  if (reservations.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          No upcoming bookings
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          When you book an appointment, it will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {reservations.map((res) => (
        <Card
          key={res._id}
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(15,23,42,0.08)',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#7C6CFF',
              boxShadow: '0 8px 24px rgba(124,108,255,0.08)',
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha('#7C6CFF', 0.04),
                borderBottom: '1px solid rgba(15,23,42,0.04)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRounded sx={{ color: '#7C6CFF', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                  {new Date(res.startTime).toLocaleDateString([], {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.secondary' }}>
                  at {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
              <Chip
                label={res.status.toUpperCase()}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: 11,
                  bgcolor: alpha(statusColors[res.status] || '#6B7280', 0.1),
                  color: statusColors[res.status] || '#6B7280',
                  borderRadius: 1.5,
                }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5, display: 'block' }}
                      >
                        Salon
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnRounded sx={{ fontSize: 18, color: '#64748B' }} />
                        <Typography sx={{ fontWeight: 700 }}>{res.tenantId.name}</Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5, display: 'block' }}
                      >
                        Service
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ContentCutRounded sx={{ fontSize: 18, color: '#64748B' }} />
                        <Typography sx={{ fontWeight: 700 }}>{res.serviceName}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                          ({res.durationMin} min • €{res.priceEUR})
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5, display: 'block' }}
                      >
                        Professional
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonRounded sx={{ fontSize: 18, color: '#64748B' }} />
                        <Typography sx={{ fontWeight: 700 }}>{res.staffId.displayName}</Typography>
                      </Stack>
                    </Box>
                    {res.notes && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5, display: 'block' }}
                        >
                          Notes
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{res.notes}"
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
