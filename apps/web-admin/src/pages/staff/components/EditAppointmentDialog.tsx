import type { StaffAppointment } from '@barber/shared';
import { landingColors, useToast } from '@barber/shared';
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';

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
  const { showError, showSuccess } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

  const validateEmail = (email: string) => {
    if (!email) return true;
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const validatePhone = (phone: string) => {
    return /^[+()\-\s0-9]{5,40}$/.test(phone);
  };

  async function handleSubmit() {
    if (!customerName.trim()) {
      showError('Customer name is required.');
      return;
    }
    if (!customerPhone.trim() || !validatePhone(customerPhone)) {
      showError('Please provide a valid phone number.');
      return;
    }
    if (customerEmail.trim() && !validateEmail(customerEmail)) {
      showError('Please provide a valid email address.');
      return;
    }

    try {
      await onSubmit({
        startTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase() || undefined,
        notes: notes.trim() || undefined,
        status,
      });
      showSuccess('Appointment updated successfully.');
    } catch (err) {
      showError(err);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : 3, p: 0 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5, py: 3, px: 4 }}>
        Edit Appointment
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
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
                required
              />

              <TextField
                select
                label="Booking Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffAppointment['status'])}
                fullWidth
                required
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
              required
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
                required
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

      <Divider sx={{ opacity: 0.5 }} />

      <DialogActions sx={{ p: 3, px: 4, bgcolor: '#F8FAFC' }}>
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
