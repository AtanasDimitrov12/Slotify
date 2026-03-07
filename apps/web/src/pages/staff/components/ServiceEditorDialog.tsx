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
import type { StaffService } from '../components/types';

export type ServicePayload = Omit<StaffService, 'id'>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ServicePayload) => void | Promise<void>;
  initialData?: StaffService | null;
};

export default function ServiceEditorDialog({ open, onClose, onSave, initialData }: Props) {
  const [name, setName] = React.useState('');
  const [durationMin, setDurationMin] = React.useState('30');
  const [priceEUR, setPriceEUR] = React.useState('25');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (!open) return;

    if (initialData) {
      setName(initialData.name);
      setDurationMin(String(initialData.durationMin));
      setPriceEUR(String(initialData.priceEUR));
      setDescription(initialData.description ?? '');
      return;
    }

    setName('');
    setDurationMin('30');
    setPriceEUR('25');
    setDescription('');
  }, [open, initialData]);

  const canSubmit =
    name.trim().length > 1 &&
    Number(durationMin) > 0 &&
    Number(priceEUR) >= 0;

  async function handleSave() {
    await onSave({
      name: name.trim(),
      durationMin: Number(durationMin),
      priceEUR: Number(priceEUR),
      description: description.trim() || undefined,
    });
    onClose();
  }

  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit service' : 'Add service'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Service name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Duration (min)"
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
          <TextField
            label="Price (€)"
            type="number"
            value={priceEUR}
            onChange={(e) => setPriceEUR(e.target.value)}
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Later this can be connected to the salon catalog (owner-approved services).
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit} onClick={handleSave}>
          {isEditing ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}