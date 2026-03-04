import * as React from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

export default function OwnerSettingsPage() {
  const [tab, setTab] = React.useState(0);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Business settings
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Configure opening hours, services, pricing, and salon details.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="General" />
            <Tab label="Opening hours" />
            <Tab label="Services & prices" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Salon name" defaultValue="Fade District" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone" defaultValue="+31 6 12345678" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Address" defaultValue="Boutenslaan 10, Eindhoven" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Timezone" defaultValue="Europe/Amsterdam" />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained">Save</Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Typography sx={{ opacity: 0.7, mb: 2 }}>
              Placeholder: per-day opening hours + breaks.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Mon-Fri" defaultValue="09:00 - 18:00" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Saturday" defaultValue="10:00 - 16:00" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Sunday" defaultValue="Closed" />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained">Save</Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Typography sx={{ opacity: 0.7, mb: 2 }}>
              Placeholder: service catalog (name, duration, price).
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Service" defaultValue="Haircut" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Duration (min)" defaultValue="30" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Price (€)" defaultValue="25" />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button>Add service</Button>
              <Button variant="contained">Save</Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Stack>
  );
}