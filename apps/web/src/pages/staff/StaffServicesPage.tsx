import * as React from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ServiceEditorDialog, { type ServicePayload } from './components/ServiceEditorDialog';
import type { StaffService } from './components/types';

const seed: StaffService[] = [
  { id: 's1', name: 'Haircut', durationMin: 30, priceEUR: 25, description: 'Classic or modern haircut.' },
  { id: 's2', name: 'Beard', durationMin: 20, priceEUR: 15, description: 'Trim + line-up.' },
  { id: 's3', name: 'Hair + Beard', durationMin: 50, priceEUR: 35 },
];

export default function StaffServicesPage() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<StaffService[]>(seed);

  async function handleSave(payload: ServicePayload) {
    // TODO: PUT /staff/me/services (or add)
    const next: StaffService = { id: String(Date.now()), ...payload };
    setItems((p) => [next, ...p]);
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            Services & prices
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            Manage your services, durations, and suggested prices.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Add service
        </Button>
      </Box>

      <Grid container spacing={2}>
        {items.map((s) => (
          <Grid item xs={12} md={6} key={s.id}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>{s.name}</Typography>
                <Typography sx={{ opacity: 0.7 }}>
                  {s.durationMin} min · €{s.priceEUR}
                </Typography>
                {s.description ? (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    {s.description}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ServiceEditorDialog open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </Stack>
  );
}