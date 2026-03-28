import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material';
import GeneralSettingsForm, { type GeneralSettingsValues } from './components/GeneralSettingsForm';
import OpeningHoursEditor, { type OpeningDay } from './components/OpeningHoursEditor';
import {
  getOwnerSettings,
  saveGeneralSettings,
  saveOpeningHours,
} from '@barber/shared'; 
import { landingColors, premium } from '@barber/shared'; 
import { useToast } from '@barber/shared'; 

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ mt: 4 }}>{children}</Box>;
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
  const { showError, showSuccess } = useToast();
  const [tab, setTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
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
      showSuccess('Business settings saved successfully.');
    } catch (err) {
      showError(err);
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

      showSuccess('Opening hours saved successfully.');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={4}>
        <Box>
          <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
            Business Settings
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Update your salon profile and operational hours.
          </Typography>
        </Box>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        <Card
          sx={{
            borderRadius: `${premium.rLg * 4}px`,
            border: '1px solid',
            borderColor: 'rgba(15,23,42,0.06)',
            bgcolor: '#FFFFFF',
            boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                flexDirection: { xs: 'column', md: 'row' },
                borderBottom: '1px solid rgba(15,23,42,0.06)',
                pb: 2,
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    fontWeight: 900,
                    fontSize: 15,
                    textTransform: 'none',
                    minHeight: 48,
                    color: '#64748B',
                    '&.Mui-selected': { color: landingColors.purple },
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: landingColors.purple,
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab label="General Info" />
                <Tab label="Opening Hours" />
              </Tabs>

              <Button
                variant="contained"
                size="large"
                onClick={tab === 0 ? handleSaveGeneral : handleSaveOpeningHours}
                disabled={saving}
                sx={{
                  minHeight: 52,
                  px: 4,
                  borderRadius: 999,
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  bgcolor: landingColors.purple,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                }}
              >
                {saving ? 'Saving...' : tab === 0 ? 'Save Profile' : 'Save Hours'}
              </Button>
            </Box>

            <TabPanel value={tab} index={0}>
              <GeneralSettingsForm value={generalSettings} onChange={setGeneralSettings} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
            </TabPanel>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
