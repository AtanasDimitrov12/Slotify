import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { SectionTitle } from '../components/landing/SectionTitle';
import { Page } from '../layout/Page';

type Tenant = { _id: string; name: string; city: string; address: string };

export default function PartnerPage() {
  const [items, setItems] = useState<Tenant[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const add = () => {
    if (!name || !city || !address) return;
    setItems((prev) => [{ _id: crypto.randomUUID(), name, city, address }, ...prev]);
    setName('');
    setCity('');
    setAddress('');
  };

  return (
    <Page>
      <SectionTitle
        heading="Become a partner"
        subheading=" Add your salon and start building your booking setup (opening hours, services, workers)."
      />

      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography sx={{ fontWeight: 800 }}>Create salon</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                label="Salon name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <TextField
                fullWidth
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Stack>
            <Box>
              <Button variant="contained" size="large" onClick={add}>
                Create
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 800 }}>Your salons (local demo)</Typography>
        <Divider />
        {items.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>No salons yet.</Typography>
        ) : (
          items.map((t) => (
            <Card key={t._id} variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900 }}>{t.name}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {t.city} • {t.address}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Page>
  );
}