import {
  createMyStaffBlockedSlot,
  deleteMyStaffBlockedSlot,
  getMyStaffBlockedSlots,
  landingColors,
  premium,
  type StaffBlockedSlotItem,
  updateMyStaffBlockedSlot,
  useToast,
} from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import BlockedSlotDialog, { type BlockedSlotPayload } from './components/BlockedSlotDialog';

function StatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      label={isActive ? 'ACTIVE' : 'INACTIVE'}
      size="small"
      sx={{
        fontWeight: 1000,
        fontSize: 10,
        letterSpacing: 0.8,
        bgcolor: alpha(isActive ? landingColors.success : '#94A3B8', 0.1),
        color: isActive ? landingColors.success : '#64748B',
        border: `1px solid ${alpha(isActive ? landingColors.success : '#94A3B8', 0.2)}`,
        height: 24,
      }}
    />
  );
}

export default function StaffBlockedSlotsPage() {
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = React.useState(false);
  const [editingSlot, setEditingSlot] = React.useState<StaffBlockedSlotItem | null>(null);
  const [items, setItems] = React.useState<StaffBlockedSlotItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');

  const loadSlots = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyStaffBlockedSlots(true);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocked slots');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  async function handleSubmit(payload: BlockedSlotPayload) {
    setSubmitting(true);

    try {
      if (editingSlot) {
        const updated = await updateMyStaffBlockedSlot(editingSlot.id, payload);
        setItems((prev) => prev.map((item) => (item.id === editingSlot.id ? updated : item)));
        showSuccess('Blocked slot updated successfully.');
      } else {
        const created = await createMyStaffBlockedSlot(payload);
        setItems((prev) => [created, ...prev]);
        showSuccess('Hours blocked successfully.');
      }
      setOpen(false);
      setEditingSlot(null);
    } catch (err) {
      showError(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const updated = await deleteMyStaffBlockedSlot(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showSuccess('Blocked slot deactivated.');
    } catch (err) {
      showError(err);
    }
  }

  async function handleRestore(id: string) {
    try {
      const updated = await updateMyStaffBlockedSlot(id, { isActive: true });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showSuccess('Blocked slot reactivated.');
    } catch (err) {
      showError(err);
    }
  }

  function handleEditClick(item: StaffBlockedSlotItem) {
    setEditingSlot(item);
    setOpen(true);
  }

  function handleAddClick() {
    setEditingSlot(null);
    setOpen(true);
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  const filteredItems = items.filter((item) => {
    if (!filterDate) return true;
    return item.date === filterDate;
  });

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography
            sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}
          >
            Blocked Slots
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Quickly block out hours from your schedule without approval.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddClick}
          sx={{
            minHeight: 52,
            px: 3,
            borderRadius: 999,
            fontWeight: 900,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
          }}
        >
          Block Hours
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          p: 2,
          borderRadius: 3,
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
        }}
      >
        <TextField
          label="Filter by Date"
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        {filterDate && (
          <Button
            size="small"
            onClick={() => setFilterDate('')}
            sx={{ fontWeight: 700, color: '#64748B' }}
          >
            Clear Filter
          </Button>
        )}
      </Box>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2}>
        {filteredItems.length === 0 ? (
          <Card
            sx={{
              borderRadius: `${premium.rLg * 4}px`,
              border: '1px dashed',
              borderColor: '#CBD5E1',
              bgcolor: 'transparent',
              py: 6,
            }}
          >
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
                <BlockRoundedIcon />
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                {filterDate ? 'No slots found for this date' : 'No blocked slots yet'}
              </Typography>
              <Typography sx={{ color: '#94A3B8', mt: 1 }}>
                {filterDate
                  ? 'Try selecting a different date or clear the filter.'
                  : 'Block hours when you need a quick break or have an appointment.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: `${premium.rMd * 4}px`,
                border: '1px solid',
                borderColor: 'rgba(15,23,42,0.06)',
                bgcolor: item.isActive ? '#FFFFFF' : alpha('#F8FAFC', 0.5),
                boxShadow: item.isActive ? '0 4px 20px rgba(15,23,42,0.03)' : 'none',
                transition: 'all 0.2s ease',
                opacity: item.isActive ? 1 : 0.7,
                '&:hover': {
                  boxShadow: item.isActive ? '0 10px 30px rgba(15,23,42,0.06)' : 'none',
                },
              }}
            >
              <CardContent
                sx={{ p: 3, display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: alpha(item.isActive ? landingColors.purple : '#94A3B8', 0.06),
                    display: 'grid',
                    placeItems: 'center',
                    color: item.isActive ? landingColors.purple : '#64748B',
                    flexShrink: 0,
                  }}
                >
                  <BlockRoundedIcon fontSize="small" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: 17 }}>
                    {new Date(item.date).toLocaleDateString([], {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>

                  <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: 15, mt: 0.5 }}>
                    {item.startTime} — {item.endTime}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: 14,
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.reason || 'No reason provided'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StatusChip isActive={item.isActive} />

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {(() => {
                      const isPast = new Date(`${item.date}T${item.startTime}:00`) < new Date();
                      if (isPast) return null;

                      return item.isActive ? (
                        <>
                          <Button
                            size="small"
                            onClick={() => handleEditClick(item)}
                            sx={{ fontWeight: 900, borderRadius: 999 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.id)}
                            sx={{ fontWeight: 900, borderRadius: 999 }}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleRestore(item.id)}
                          sx={{ fontWeight: 900, borderRadius: 999 }}
                        >
                          Restore
                        </Button>
                      );
                    })()}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      <BlockedSlotDialog
        open={open}
        onClose={() => {
          if (!submitting) {
            setOpen(false);
            setEditingSlot(null);
          }
        }}
        initialData={editingSlot}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
