import { landingColors, useToast } from '@barber/shared';
import {
  alpha,
  Box,
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

export type TimeOffPayload = {
  startDate: string;
  endDate: string;
  reason?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: TimeOffPayload) => void | Promise<void>;
};

export default function TimeOffRequestDialog({ open, onClose, onSubmit }: Props) {
  const { showError, showSuccess } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit =
    startDate.trim() !== '' && endDate.trim() !== '' && startDate <= endDate && !isSubmitting;

  const reset = React.useCallback(() => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsSubmitting(false);
  }, []);

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function handleSubmit() {
    if (!startDate || !endDate) {
      showError('Start date and end date are required.');
      return;
    }

    if (startDate > endDate) {
      showError('Start date cannot be after end date.');
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });

      showSuccess('Time off request submitted.');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit time off request.';
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
        Request Time Off
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            Submit a leave request. The salon owner will receive a notification to review and
            approve it.
          </Typography>

          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <TextField
              label="Reason for Leave"
              placeholder="e.g. Vacation, Personal Appointment, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(landingColors.blue, 0.05),
                border: `1px solid ${alpha(landingColors.blue, 0.1)}`,
              }}
            >
              <Typography
                sx={{
                  color: '#0369A1',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Note: Once approved, your availability for these dates will be automatically
                blocked.
              </Typography>
            </Box>
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
          disabled={!canSubmit}
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
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
