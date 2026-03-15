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
} from '@mui/material';

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Service"
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
            label="Start time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Customer phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            fullWidth
          />

          <TextField
            label="Customer email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={creating}>
          {creating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}