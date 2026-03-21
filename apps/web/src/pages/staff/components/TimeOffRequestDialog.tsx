import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';

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
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reason, setReason] = React.useState('');

  function reset() {
    setStartDate('');
    setEndDate('');
    setReason('');
  }

  const canSubmit = Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  React.useEffect(() => {
    if (!open) reset();
  }, [open]);

  async function handleSubmit() {
    await onSubmit({ startDate, endDate, reason: reason.trim() || undefined });
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 8, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5, py: 3, px: 4 }}>
        Request Time Off
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            Submit a leave request. The salon owner will receive a notification to review and approve it.
          </Typography>

          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
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

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(landingColors.blue, 0.05), border: `1px solid ${alpha(landingColors.blue, 0.1)}` }}>
              <Typography sx={{ color: '#0369A1', fontSize: 13, fontWeight: 700 }}>
                Note: Once approved, your availability for these dates will be automatically blocked.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 800, color: '#64748B', borderRadius: 999, px: 3 }}
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
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}