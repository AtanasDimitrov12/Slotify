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
  alpha,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';

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
        {initialData ? 'Edit Catalog Service' : 'Add Catalog Service'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            {initialData 
              ? 'Update the details for this global service offering.' 
              : 'Define a new service that will be available for barbers to choose.'}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Service Name"
              placeholder="e.g. Premium Haircut"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Duration (min)"
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                fullWidth
              />

              <TextField
                label="Price (€)"
                type="number"
                value={priceEUR}
                onChange={(e) => setPriceEUR(e.target.value)}
                fullWidth
              />
            </Stack>

            <TextField
              label="Description (optional)"
              placeholder="Describe the service details..."
              multiline
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          disabled={!canSubmit}
          onClick={handleSave}
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
          {initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
