import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import TimeOffRequestDialog, { type TimeOffPayload } from './components/TimeOffRequestDialog';
import type { TimeOffRequest } from './components/types';
import {
  createMyStaffTimeOff,
  deleteMyStaffTimeOff,
  getMyStaffTimeOff,
} from '../../api/staffTimeOff';

function StatusChip({ status }: { status: TimeOffRequest['status'] }) {
  const label =
    status === 'requested'
      ? 'Requested'
      : status === 'approved'
      ? 'Approved'
      : 'Denied';

  return <Chip label={label} size="small" />;
}

export default function StaffTimeOffPage() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
    setError('');

    try {
      const created = await createMyStaffTimeOff({
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
      });

      setItems((prev) => [created, ...prev]);
      setOpen(false);
      setSuccess('Time off request submitted successfully.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create time off request';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError('');

    try {
      await deleteMyStaffTimeOff(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Time off request removed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time off request');
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={900}>
              Time off
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>
              Request time off. The owner will approve or reject it.
            </Typography>
          </Box>

          <Button variant="contained" onClick={() => setOpen(true)}>
            Request time off
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={2}>
          {items.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>No time off requests yet</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Create your first request when you need days off.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            items.map((r) => (
              <Card key={r.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={900}>
                      {r.startDate} → {r.endDate}
                    </Typography>

                    {r.reason ? (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        {r.reason}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        No reason provided
                      </Typography>
                    )}
                  </Box>

                  <StatusChip status={r.status} />

                  {r.status === 'requested' ? (
                    <Button color="inherit" onClick={() => handleDelete(r.id)}>
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

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}