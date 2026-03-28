import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import TimeOffRequestDialog, { type TimeOffPayload } from './components/TimeOffRequestDialog';
import type { TimeOffRequest } from './components/types';
import {
  createMyStaffTimeOff,
  deleteMyStaffTimeOff,
  getMyStaffTimeOff,
} from '@barber/shared'; 
import { landingColors, premium } from '@barber/shared'; 
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useToast } from '@barber/shared'; 

function StatusChip({ status }: { status: TimeOffRequest['status'] }) {
  const map: Record<TimeOffRequest['status'], { label: string; color: string }> = {
    requested: { label: 'Requested', color: landingColors.blue },
    approved: { label: 'Approved', color: landingColors.success },
    denied: { label: 'Denied', color: '#F43F5E' },
  };

  const meta = map[status];

  return (
    <Chip
      label={meta.label.toUpperCase()}
      size="small"
      sx={{
        fontWeight: 1000,
        fontSize: 10,
        letterSpacing: 0.8,
        bgcolor: alpha(meta.color, 0.1),
        color: meta.color,
        border: `1px solid ${alpha(meta.color, 0.2)}`,
        height: 24,
      }}
    />
  );
}

export default function StaffTimeOffPage() {
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadTimeOff = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyStaffTimeOff();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time off requests');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTimeOff();
  }, [loadTimeOff]);

  async function handleSubmit(payload: TimeOffPayload) {
    setSubmitting(true);

    try {
      const created = await createMyStaffTimeOff({
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
      });

      setItems((prev) => [created, ...prev]);
      setOpen(false);
      showSuccess('Time off request submitted successfully.');
    } catch (err) {
      showError(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMyStaffTimeOff(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showSuccess('Time off request removed successfully.');
    } catch (err) {
      showError(err);
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
              Time Off
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
              Request leave and track your history.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpen(true)}
            sx={{
              minHeight: 52,
              px: 3,
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: landingColors.purple,
              boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            }}
          >
            New Request
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        <Stack spacing={2}>
          {items.length === 0 ? (
            <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px dashed', borderColor: '#CBD5E1', bgcolor: 'transparent', py: 6 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: alpha(landingColors.purple, 0.06),
                    display: 'grid',
                    placeItems: 'center',
                    color: landingColors.purple,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CalendarMonthRoundedIcon />
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#64748B' }}>No requests yet</Typography>
                <Typography sx={{ color: '#94A3B8', mt: 1 }}>
                  Create a request when you need to take some days off.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            items.map((r) => (
              <Card
                key={r.id}
                sx={{
                  borderRadius: `${premium.rMd * 4}px`,
                  border: '1px solid',
                  borderColor: 'rgba(15,23,42,0.06)',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': { boxShadow: '0 10px 30px rgba(15,23,42,0.06)' },
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: alpha(landingColors.purple, 0.06),
                      display: 'grid',
                      placeItems: 'center',
                      color: landingColors.purple,
                      flexShrink: 0,
                    }}
                  >
                    <CalendarMonthRoundedIcon fontSize="small" />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: 17 }}>
                      {new Date(r.startDate).toLocaleDateString([], { day: '2-digit', month: 'short' })} → {new Date(r.endDate).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>

                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14, mt: 0.5 }}>
                      {r.reason || 'No reason provided'}
                    </Typography>
                  </Box>

                  <StatusChip status={r.status} />

                  {r.status === 'requested' ? (
                    <Button
                      color="error"
                      onClick={() => handleDelete(r.id)}
                      sx={{ fontWeight: 900, borderRadius: 999, ml: 1 }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        <TimeOffRequestDialog
          open={open}
          onClose={() => {
            if (!submitting) setOpen(false);
          }}
          onSubmit={handleSubmit}
        />
      </Stack>
    </>
  );
}
