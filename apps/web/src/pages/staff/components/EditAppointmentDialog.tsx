import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import type { StaffAppointment } from '../../../api/staffAppointments';
import { landingColors } from '../../../components/landing/constants';

function toTimeInputValue(value: string) {
  const date = new Date(value);
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function EditAppointmentDialog({
  open,
  appointment,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  appointment: StaffAppointment | null;
  onClose: () => void;
  onSubmit: (payload: {
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
    status: StaffAppointment['status'];
  }) => Promise<void>;
  saving: boolean;
}) {
  const [startTime, setStartTime] = React.useState('10:00');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState<StaffAppointment['status']>('confirmed');

  React.useEffect(() => {
    if (!appointment || !open) return;

    setStartTime(toTimeInputValue(appointment.startTime));
    setCustomerName(appointment.customerName ?? '');
    setCustomerPhone(appointment.customerPhone ?? '');
    setCustomerEmail(appointment.customerEmail ?? '');
    setNotes(appointment.notes ?? '');
    setStatus(appointment.status);
  }, [appointment, open]);

  async function handleSubmit() {
    if (!customerName.trim() || !customerPhone.trim() || !startTime) return;

    await onSubmit({
      startTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });
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
        Edit Appointment
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            Adjust the timing, customer details, or update the current status of this booking.
          </Typography>

          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                select
                label="Booking Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffAppointment['status'])}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="no-show">No-show</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
              />

              <TextField
                label="Email Address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                fullWidth
              />
            </Stack>

            <TextField
              label="Appointment Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
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
          onClick={handleSubmit}
          disabled={saving}
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
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}