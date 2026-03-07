import * as React from 'react';
import { Box, Button, Card, CardContent, Stack, Tab, Tabs, Typography } from '@mui/material';
import GeneralSettingsForm, { type GeneralSettingsValues } from './components/GeneralSettingsForm';
import OpeningHoursEditor, { type OpeningDay } from './components/OpeningHoursEditor';

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

const initialGeneralSettings: GeneralSettingsValues = {
  salonName: 'Fade District',
  phone: '+31 6 12345678',
  email: 'info@fadedistrict.nl',
  address: 'Boutenslaan 10',
  city: 'Eindhoven',
  postalCode: '5611 AA',
  timezone: 'Europe/Amsterdam',
};

const initialOpeningHours: OpeningDay[] = [
  { key: 'monday', label: 'Monday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'tuesday', label: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'wednesday', label: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'thursday', label: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'friday', label: 'Friday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'saturday', label: 'Saturday', enabled: true, start: '10:00', end: '16:00' },
  { key: 'sunday', label: 'Sunday', enabled: false, start: '10:00', end: '16:00' },
];

export default function OwnerSettingsPage() {
  const [tab, setTab] = React.useState(0);
  const [generalSettings, setGeneralSettings] = React.useState<GeneralSettingsValues>(initialGeneralSettings);
  const [openingHours, setOpeningHours] = React.useState<OpeningDay[]>(initialOpeningHours);

  function handleSaveGeneral() {
    // TODO: save general settings to backend
    console.log('generalSettings', generalSettings);
  }

  function handleSaveOpeningHours() {
    // TODO: save opening hours to backend
    console.log('openingHours', openingHours);
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Business settings
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Configure your salon details and opening hours.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ px: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="General" />
            <Tab label="Opening hours" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <GeneralSettingsForm value={generalSettings} onChange={setGeneralSettings} />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveGeneral}>
                Save
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveOpeningHours}>
                Save
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Stack>
  );
}