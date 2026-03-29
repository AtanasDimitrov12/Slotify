import { landingColors, useToast } from '@barber/shared';
import {
  alpha,
  Box,
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
  const { showError, showSuccess } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

  async function handleSave() {
    if (!serviceId) {
      showError('Please select a service.');
      return;
    }
    if (Number(durationMin) <= 0) {
      showError('Duration must be at least 1 minute.');
      return;
    }
    if (Number(priceEUR) < 0) {
      showError('Price cannot be negative.');
      return;
    }

    try {
      await onSave({
        serviceId,
        durationMin: Number(durationMin),
        priceEUR: Number(priceEUR),
      });
      showSuccess(isEditing ? 'Service updated successfully.' : 'Service added to your profile.');
      onClose();
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
        {isEditing ? 'Adjust Service' : 'Offer New Service'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            {isEditing
              ? 'Customize your personal price and duration for this service.'
              : 'Choose a service from the salon catalog to add to your profile.'}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              select
              label="Select Service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={isEditing}
              fullWidth
              required
            >
              {catalogOptions.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>

            {selectedCatalogService?.description ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha('#F1F5F9', 0.5),
                  border: '1px solid rgba(15,23,42,0.04)',
                }}
              >
                <Typography
                  sx={{ color: '#475569', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}
                >
                  "{selectedCatalogService.description}"
                </Typography>
              </Box>
            ) : null}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Duration Override (min)"
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Price Override (€)"
                type="number"
                value={priceEUR}
                onChange={(e) => setPriceEUR(e.target.value)}
                fullWidth
                required
              />
            </Stack>

            <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}>
              Note: The service name and description are fixed by the salon. You only control your
              personal availability and pricing.
            </Typography>
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
          {isEditing ? 'Update My Rates' : 'Start Offering Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
