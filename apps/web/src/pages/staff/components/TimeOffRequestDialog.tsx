import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request time off</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={3}
          />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Your request will be sent to the salon owner for approval.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit} onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}