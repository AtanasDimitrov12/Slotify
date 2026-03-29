import {
  getOwnerStaffTimeOffRequests,
  landingColors,
  type OwnerStaffTimeOffItem,
  reviewOwnerStaffTimeOffRequest,
  useToast,
} from '@barber/shared';
import {
  Alert,
  alpha,
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
import * as React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  staffId: string | null;
  staffName: string;
  onUpdated?: () => void | Promise<void>;
};

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString([], { day: '2-digit', month: 'short' });
  const end = new Date(endDate).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${start} → ${end}`;
}

export default function ManageStaffTimeOffDialog({
  open,
  onClose,
  staffId,
  staffName,
  onUpdated,
}: Props) {
  const { showError, showSuccess } = useToast();
  const [items, setItems] = React.useState<OwnerStaffTimeOffItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!open || !staffId) return;

    setLoading(true);

    try {
      const data = await getOwnerStaffTimeOffRequests(staffId);
      setItems(data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }, [open, staffId, showError]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleReview(requestId: string, status: 'approved' | 'denied') {
    setActionLoadingId(requestId);

    try {
      await reviewOwnerStaffTimeOffRequest(requestId, status);
      showSuccess(`Request ${status} successfully.`);
      await load();
      await onUpdated?.();
    } catch (err) {
      showError(err);
    } finally {
      setActionLoadingId(null);
    }
  }

  const pending = items.filter((item) => item.status === 'requested');
  const history = items.filter((item) => item.status !== 'requested');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 8, p: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5, py: 3, px: 4 }}>
        Time Off Requests — {staffName}
      </DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Stack spacing={4} sx={{ mt: 1 }}>
          {loading ? (
            <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Loading requests...</Typography>
          ) : (
            <>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: landingColors.purple,
                    mb: 2,
                  }}
                >
                  Pending Requests
                </Typography>

                {pending.length === 0 ? (
                  <Typography sx={{ color: '#94A3B8', fontWeight: 600, py: 2 }}>
                    No pending requests at this time.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {pending.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'rgba(15,23,42,0.06)',
                          borderRadius: 4,
                          p: 3,
                          bgcolor: alpha(landingColors.purple, 0.02),
                        }}
                      >
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 900, fontSize: 17, color: '#0F172A' }}>
                                {formatDateRange(item.startDate, item.endDate)}
                              </Typography>
                              <Typography sx={{ color: '#64748B', fontWeight: 600, mt: 0.5 }}>
                                {item.reason || 'No reason provided'}
                              </Typography>
                            </Box>

                            <Chip
                              label="PENDING"
                              size="small"
                              sx={{
                                fontWeight: 1000,
                                fontSize: 10,
                                letterSpacing: 0.8,
                                bgcolor: alpha(landingColors.blue, 0.1),
                                color: landingColors.blue,
                                border: `1px solid ${alpha(landingColors.blue, 0.2)}`,
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                            <Button
                              variant="outlined"
                              color="error"
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleReview(item._id, 'denied')}
                              sx={{ borderRadius: 999, fontWeight: 900, px: 3 }}
                            >
                              Deny
                            </Button>

                            <Button
                              variant="contained"
                              disabled={actionLoadingId === item._id}
                              onClick={() => handleReview(item._id, 'approved')}
                              sx={{
                                borderRadius: 999,
                                fontWeight: 900,
                                px: 3,
                                bgcolor: landingColors.purple,
                                '&:hover': {
                                  bgcolor: landingColors.purple,
                                  filter: 'brightness(1.05)',
                                },
                              }}
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
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    mb: 2,
                  }}
                >
                  History
                </Typography>

                {history.length === 0 ? (
                  <Typography sx={{ color: '#94A3B8', fontWeight: 600, py: 2 }}>
                    No reviewed requests yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {history.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'rgba(15,23,42,0.04)',
                          borderRadius: 3,
                          p: 2.5,
                          bgcolor: alpha('#F8FAFC', 0.5),
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#475569' }}>
                              {formatDateRange(item.startDate, item.endDate)}
                            </Typography>
                            <Typography sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>
                              {item.reason || 'No reason'}
                            </Typography>
                          </Box>

                          <Chip
                            label={item.status.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 1000,
                              fontSize: 10,
                              letterSpacing: 0.8,
                              bgcolor:
                                item.status === 'approved'
                                  ? alpha(landingColors.success, 0.1)
                                  : alpha('#F43F5E', 0.1),
                              color: item.status === 'approved' ? landingColors.success : '#F43F5E',
                              border: `1px solid ${item.status === 'approved' ? alpha(landingColors.success, 0.2) : alpha('#F43F5E', 0.2)}`,
                            }}
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

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 900, color: '#64748B', borderRadius: 999, px: 4 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
