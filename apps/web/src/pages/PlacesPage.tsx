import {
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { SectionTitle } from '../components/landing/SectionTitle';
import { Page } from '../layout/Page';

type Tenant = { _id: string; name: string; city: string; address: string };

export default function PlacesPage() {
  // временно mock — после ще replace с fetch към /tenants
  const [tenants] = useState<Tenant[]>([
    { _id: '1', name: 'Fade Studio', city: 'Eindhoven', address: 'Main Street 1' },
    { _id: '2', name: 'Klondike', city: 'Burgas', address: 'Fotinov 10' },
  ]);

  const [city, setCity] = useState('all');
  const [q, setQ] = useState('');

  const cities = useMemo(
    () => ['all', ...Array.from(new Set(tenants.map((t) => t.city)))],
    [tenants],
  );

  const filtered = tenants.filter((t) => {
    const cityOk = city === 'all' || t.city === city;
    const qOk = !q || `${t.name} ${t.city} ${t.address}`.toLowerCase().includes(q.toLowerCase());
    return cityOk && qOk;
  });

  return (
    <Page>
      <SectionTitle
        heading="Explore places"
        subheading=" Choose a city and find a salon to book your next slot."
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField fullWidth label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <TextField
          select
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
        >
          {cities.map((c) => (
            <MenuItem key={c} value={c}>
              {c === 'all' ? 'All cities' : c}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        {filtered.map((t) => (
          <Grid key={t._id} item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{t.name}</Typography>
                    <Chip size="small" label={t.city} />
                  </Stack>
                  <Typography sx={{ color: 'text.secondary' }}>{t.address}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                    Booking UI comes next (workers/services/availability).
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Typography sx={{ color: 'text.secondary' }}>
          No places found. Try another city or search term.
        </Typography>
      )}
    </Page>
  );
}