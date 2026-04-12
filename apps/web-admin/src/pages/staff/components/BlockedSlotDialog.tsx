import { landingColors, type StaffBlockedSlotItem, useToast } from '@barber/shared';
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';

export type BlockedSlotPayload = {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: BlockedSlotPayload) => void | Promise<void>;
  initialData?: StaffBlockedSlotItem | null;
};

export default function BlockedSlotDialog({ open, onClose, onSubmit, initialData }: Props) {
  const { showError, showSuccess } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('13:00');
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

  const isDateMissing = Boolean(attemptedSubmit && !date);
  const isStartTimeMissing = Boolean(attemptedSubmit && !startTime);
  const isEndTimeMissing = Boolean(attemptedSubmit && !endTime);

  const isPastError = Boolean(
    attemptedSubmit && date && startTime && new Date(`${date}T${startTime}:00`) < new Date(),
  );

  const isRangeError = Boolean(attemptedSubmit && startTime && endTime && startTime >= endTime);

  const reset = React.useCallback(() => {
    if (initialData) {
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setReason(initialData.reason || '');
    } else {
      setDate('');
      setStartTime('09:00');
      setEndTime('13:00');
      setReason('');
    }
    setIsSubmitting(false);
    setAttemptedSubmit(false);
  }, [initialData]);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  async function handleSubmit() {
    setAttemptedSubmit(true);

    if (!date) {
      showError('Please select a date.');
      return;
    }
    if (!startTime || !endTime) {
      showError('Please specify both start and end times.');
      return;
    }

    if (startTime >= endTime) {
      showError('The end time must be later than the start time.');
      return;
    }

    const slotStart = new Date(`${date}T${startTime}:00`);
    if (slotStart < new Date()) {
      showError('You cannot block a time that has already passed.');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        date,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
      });

      showSuccess(initialData ? 'Slot updated successfully.' : 'Slot blocked successfully.');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save blocked slot.';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          p: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 1000,
          fontSize: 24,
          letterSpacing: -0.5,
          py: 3,
          px: 4,
        }}
      >
        {initialData ? 'Edit Blocked Hours' : 'Block Hours'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            {initialData
              ? 'Update the timing or reason for this blocked period.'
              : 'Block out specific hours from your schedule. This will immediately prevent any new reservations during this period.'}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (attemptedSubmit) setAttemptedSubmit(false);
              }}
              error={isDateMissing}
              helperText={isDateMissing ? 'Date is required' : ''}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
              }}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (attemptedSubmit) setAttemptedSubmit(false);
                }}
                error={isStartTimeMissing || isPastError || isRangeError}
                helperText={
                  isStartTimeMissing
                    ? 'Start time required'
                    : isPastError
                      ? 'Time is in the past'
                      : ''
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (attemptedSubmit) setAttemptedSubmit(false);
                }}
                error={isEndTimeMissing || isRangeError}
                helperText={
                  isEndTimeMissing ? 'End time required' : isRangeError ? 'Must be after start' : ''
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <TextField
              label="Reason (optional)"
              placeholder="e.g. Personal errand, Maintenance, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>

      <Divider sx={{ opacity: 0.5 }} />

      <DialogActions sx={{ p: 3, px: 4, bgcolor: '#F8FAFC' }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            fontWeight: 800,
            color: '#64748B',
            borderRadius: 999,
            px: 3,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit}
          sx={{
            borderRadius: 999,
            px: 4,
            fontWeight: 900,
            minHeight: 48,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            '&:hover': {
              bgcolor: landingColors.purple,
              filter: 'brightness(1.05)',
            },
          }}
        >
          {isSubmitting
            ? initialData
              ? 'Updating...'
              : 'Blocking...'
            : initialData
              ? 'Save Changes'
              : 'Block Hours'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
