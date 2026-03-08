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
} from '@mui/material';
import type { CatalogServiceOption, StaffService } from './types';

export type ServicePayload = {
  serviceId: string;
  durationMin: number;
  priceEUR: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ServicePayload) => void | Promise<void>;
  initialData?: StaffService | null;
  catalogOptions?: CatalogServiceOption[];
};

export default function ServiceEditorDialog({
  open,
  onClose,
  onSave,
  initialData,
  catalogOptions = [],
}: Props) {
  const [serviceId, setServiceId] = React.useState('');
  const [durationMin, setDurationMin] = React.useState('30');
  const [priceEUR, setPriceEUR] = React.useState('25');

  React.useEffect(() => {
    if (!open) return;

    if (initialData) {
      setServiceId(initialData.serviceId);
      setDurationMin(String(initialData.durationMin));
      setPriceEUR(String(initialData.priceEUR));
      return;
    }

    setServiceId('');
    setDurationMin('30');
    setPriceEUR('25');
  }, [open, initialData]);

  React.useEffect(() => {
    if (!open || initialData || !serviceId) return;

    const selected = catalogOptions.find((item) => item.id === serviceId);
    if (!selected) return;

    setDurationMin(String(selected.durationMin));
    setPriceEUR(String(selected.priceEUR));
  }, [serviceId, open, initialData, catalogOptions]);

  const selectedCatalogService = catalogOptions.find((item) => item.id === serviceId);
  const isEditing = Boolean(initialData);

  const canSubmit =
    serviceId.trim().length > 0 &&
    Number(durationMin) > 0 &&
    Number(priceEUR) >= 0;

  async function handleSave() {
    await onSave({
      serviceId,
      durationMin: Number(durationMin),
      priceEUR: Number(priceEUR),
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit service' : 'Add service'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={isEditing}
          >
            {catalogOptions.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </TextField>

          {selectedCatalogService?.description ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {selectedCatalogService.description}
            </Typography>
          ) : null}

          <TextField
            label="Duration override (min)"
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />

          <TextField
            label="Price override (€)"
            type="number"
            value={priceEUR}
            onChange={(e) => setPriceEUR(e.target.value)}
          />

          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            The service name and description come from the salon catalog. You can only adjust the duration and price for your own offering.
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