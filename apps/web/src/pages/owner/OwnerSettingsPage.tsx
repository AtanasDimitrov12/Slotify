import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import GeneralSettingsForm, { type GeneralSettingsValues } from './components/GeneralSettingsForm';
import OpeningHoursEditor, { type OpeningDay } from './components/OpeningHoursEditor';
import {
  getOwnerSettings,
  saveGeneralSettings,
  saveOpeningHours,
} from '../../api/ownerSettings';

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

const emptyGeneralSettings: GeneralSettingsValues = {
  salonName: '',
  contactPersonName: '',
  phone: '',
  email: '',
  street: '',
  houseNumber: '',
  city: '',
  postalCode: '',
  country: '',
  timezone: 'Europe/Amsterdam',
  websiteUrl: '',
  instagram: '',
  facebook: '',
  tiktok: '',
};

const defaultOpeningHours: OpeningDay[] = [
  { key: 'mon', label: 'Monday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'tue', label: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'wed', label: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'thu', label: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'fri', label: 'Friday', enabled: true, start: '09:00', end: '18:00' },
  { key: 'sat', label: 'Saturday', enabled: false, start: '10:00', end: '16:00' },
  { key: 'sun', label: 'Sunday', enabled: false, start: '10:00', end: '16:00' },
];

function mapOpeningHoursFromApi(
  openingHours?: Record<string, { start: string; end: string }[]>,
): OpeningDay[] {
  return defaultOpeningHours.map((day) => {
    const ranges = openingHours?.[day.key] ?? [];
    const first = ranges[0];

    if (!first) {
      return { ...day, enabled: false };
    }

    return {
      ...day,
      enabled: true,
      start: first.start,
      end: first.end,
    };
  });
}

export default function OwnerSettingsPage() {
  const [tab, setTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [generalSettings, setGeneralSettings] = React.useState<GeneralSettingsValues>(emptyGeneralSettings);
  const [openingHours, setOpeningHours] = React.useState<OpeningDay[]>(defaultOpeningHours);

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getOwnerSettings();

      setGeneralSettings({
        salonName: data.salonName ?? '',
        contactPersonName: data.contactPersonName ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        street: data.street ?? '',
        houseNumber: data.houseNumber ?? '',
        city: data.city ?? '',
        postalCode: data.postalCode ?? '',
        country: data.country ?? '',
        timezone: data.timezone ?? 'Europe/Amsterdam',
        websiteUrl: data.websiteUrl ?? '',
        instagram: data.instagram ?? '',
        facebook: data.facebook ?? '',
        tiktok: data.tiktok ?? '',
      });

      setOpeningHours(mapOpeningHoursFromApi(data.openingHours));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSaveGeneral() {
    setSaving(true);
    setError('');

    try {
      await saveGeneralSettings(generalSettings);
      setSuccess('Business settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveOpeningHours() {
    setSaving(true);
    setError('');

    try {
      await saveOpeningHours({
        days: openingHours.map((day) => ({
          key: day.key,
          enabled: day.enabled,
          start: day.enabled ? day.start : undefined,
          end: day.enabled ? day.end : undefined,
        })),
      });

      setSuccess('Opening hours saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opening hours');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Business settings
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            Configure your salon details and opening hours.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ px: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="General" />
              <Tab label="Opening hours" />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <GeneralSettingsForm value={generalSettings} onChange={setGeneralSettings} />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleSaveGeneral} disabled={saving}>
                  Save
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleSaveOpeningHours} disabled={saving}>
                  Save
                </Button>
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}