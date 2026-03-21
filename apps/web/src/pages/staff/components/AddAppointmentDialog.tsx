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
import { landingColors } from '../../../components/landing/constants';

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

  async function handleSubmit() {
    if (!staffServiceAssignmentId || !customerName.trim() || !customerPhone.trim() || !startTime) {
      return;
    }

    await onSubmit({
      staffServiceAssignmentId,
      startTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined,
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
        New Appointment
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
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
            />

            <TextField
              label="Customer Name"
              placeholder="e.g. John Doe"
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
