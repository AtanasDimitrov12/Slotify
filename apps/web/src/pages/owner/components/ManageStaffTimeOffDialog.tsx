import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import {
  getOwnerStaffTimeOffRequests,
  reviewOwnerStaffTimeOffRequest,
  type OwnerStaffTimeOffItem,
} from '../../../api/staffTimeOff';

type Props = {
  open: boolean;
  onClose: () => void;
  staffId: string | null;
  staffName: string;
  onUpdated?: () => void | Promise<void>;
};

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate.slice(0, 10)} → ${endDate.slice(0, 10)}`;
}

export default function ManageStaffTimeOffDialog({
  open,
  onClose,
  staffId,
  staffName,
  onUpdated,
}: Props) {
  const [items, setItems] = React.useState<OwnerStaffTimeOffItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    if (!open || !staffId) return;

    setLoading(true);
    setError('');

    try {
      const data = await getOwnerStaffTimeOffRequests(staffId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load time off requests',
      );
    } finally {
      setLoading(false);
    }
  }, [open, staffId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleReview(requestId: string, status: 'approved' | 'denied') {
    setActionLoadingId(requestId);
    setError('');

    try {
      await reviewOwnerStaffTimeOffRequest(requestId, status);
      await load();
      await onUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to review time off request',
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  const pending = items.filter((item) => item.status === 'requested');
  const history = items.filter((item) => item.status !== 'requested');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Time Off — {staffName}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Typography sx={{ opacity: 0.7 }}>Loading requests...</Typography>
          ) : (
            <>
              <Box>
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>
                  Pending requests
                </Typography>

                {pending.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>
                    No pending requests.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {pending.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography fontWeight={800}>
                                {formatDateRange(item.startDate, item.endDate)}
                              </Typography>
                              <Typography sx={{ opacity: 0.75 }}>
                                {item.reason || 'No reason provided'}
                              </Typography>
                            </Box>

                            <Chip label="requested" size="small" />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              variant="outlined"
                              color="error"
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleReview(item._id, 'denied')}
                            >
                              Deny
                            </Button>

                            <Button
                              variant="contained"
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleReview(item._id, 'approved')}
                            >
                              Approve
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>
                  History
                </Typography>

                {history.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>
                    No reviewed requests yet.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {history.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography fontWeight={800}>
                              {formatDateRange(item.startDate, item.endDate)}
                            </Typography>
                            <Typography sx={{ opacity: 0.75 }}>
                              {item.reason || 'No reason provided'}
                            </Typography>
                          </Box>

                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === 'approved' ? 'success' : 'error'}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}