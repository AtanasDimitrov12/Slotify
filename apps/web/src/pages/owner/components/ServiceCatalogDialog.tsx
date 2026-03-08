import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

export type CatalogServicePayload = {
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

type InitialData = {
  id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
} | null;

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CatalogServicePayload) => void | Promise<void>;
  initialData?: InitialData;
};

export default function ServiceCatalogDialog({
  open,
  onClose,
  onSave,
  initialData = null,
}: Props) {
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
    name.trim().length > 0 &&
    Number(durationMin) > 0 &&
    Number(priceEUR) >= 0;

  async function handleSave() {
    await onSave({
      name: name.trim(),
      durationMin: Number(durationMin),
      priceEUR: Number(priceEUR),
      description: description.trim(),
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit service' : 'Create service'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Service name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Default duration (min)"
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />

          <TextField
            label="Default price (€)"
            type="number"
            value={priceEUR}
            onChange={(e) => setPriceEUR(e.target.value)}
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit} onClick={handleSave}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}