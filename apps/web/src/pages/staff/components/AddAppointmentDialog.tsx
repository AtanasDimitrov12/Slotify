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
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';
import { useToast } from '../../../components/ToastProvider';

type ServiceOption = {
  id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
};

export default function AddAppointmentDialog({
  open,
  onClose,
  onSubmit,
  creating,
  services,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    staffServiceAssignmentId: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }) => Promise<void>;
  creating: boolean;
  services: ServiceOption[];
}) {
  const { showError, showSuccess } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [staffServiceAssignmentId, setStaffServiceAssignmentId] = React.useState('');
  const [startTime, setStartTime] = React.useState('10:00');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setStaffServiceAssignmentId('');
    setStartTime('10:00');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
  }, [open]);

  const validateEmail = (email: string) => {
    if (!email) return true;
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
  };

  const validatePhone = (phone: string) => {
    return /^[+()\-\s0-9]{5,40}$/.test(phone);
  };

  async function handleSubmit() {
    if (!staffServiceAssignmentId) {
      showError('Please select a service.');
      return;
    }
    if (!startTime) {
      showError('Please select a start time.');
      return;
    }
    if (!customerName.trim()) {
      showError('Please enter the customer name.');
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
        staffServiceAssignmentId,
        startTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase() || undefined,
        notes: notes.trim() || undefined,
      });
      showSuccess('Appointment booked successfully.');
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
        sx: { borderRadius: fullScreen ? 0 : 3, p: 0 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5, py: 3, px: 4 }}>
        New Appointment
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            Fill in the customer details and select a service to book a slot manually.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              select
              label="Select Service"
              value={staffServiceAssignmentId}
              onChange={(e) => setStaffServiceAssignmentId(e.target.value)}
              fullWidth
              required
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} · {service.durationMin} min · €{service.priceEUR}
                </MenuItem>
              ))}
            </TextField>

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
              label="Customer Name"
              placeholder="e.g. John Doe"
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
                label="Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                fullWidth
              />
            </Stack>

            <TextField
              label="Appointment Notes"
              placeholder="Any special requests or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
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
          disabled={creating}
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
          {creating ? 'Saving Appointment...' : 'Book Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
