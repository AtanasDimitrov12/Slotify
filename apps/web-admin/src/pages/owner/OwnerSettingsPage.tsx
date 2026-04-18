import {
  createMySalon,
  getMyTenants,
  getOwnerSettings,
  landingColors,
  premium,
  saveGeneralSettings,
  saveOpeningHours,
  useAuth,
  useToast,
} from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import {
  Alert,
  Avatar,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import GeneralSettingsForm, { type GeneralSettingsValues } from './components/GeneralSettingsForm';
import OpeningHoursEditor, { type OpeningDay } from './components/OpeningHoursEditor';

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
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
  notes: '',
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
  const { user, switchTenant } = useAuth();
  const { showError, showSuccess } = useToast();
  const [tab, setTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [generalSettings, setGeneralSettings] =
    React.useState<GeneralSettingsValues>(emptyGeneralSettings);
  const [openingHours, setOpeningHours] = React.useState<OpeningDay[]>(defaultOpeningHours);

  // My Salons state
  const [mySalons, setMySalons] = React.useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [newSalonName, setNewSalonName] = React.useState('');

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [data, salons] = await Promise.all([getOwnerSettings(), getMyTenants()]);

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
        notes: data.notes ?? '',
      });

      setOpeningHours(mapOpeningHoursFromApi(data.openingHours));
      setMySalons(salons);
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

  async function handleCreateSalon() {
    if (!newSalonName.trim()) return;
    setSaving(true);
    try {
      await createMySalon(newSalonName.trim());
      showSuccess('New salon created successfully!');
      setCreateDialogOpen(false);
      setNewSalonName('');
      void loadSettings();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSwitch(id: string) {
    try {
      await switchTenant(id);
      window.location.reload();
    } catch (err) {
      showError(err);
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
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
          Business Settings
        </Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
          Update your salon profile and operational hours.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

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
              <Tab label="My Salons" />
            </Tabs>

            {tab !== 2 ? (
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
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  minHeight: 52,
                  px: 4,
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: landingColors.purple,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                }}
              >
                Add Salon
              </Button>
            )}
          </Box>

          <TabPanel value={tab} index={0}>
            <GeneralSettingsForm value={generalSettings} onChange={setGeneralSettings} />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Stack spacing={3}>
              <Typography sx={{ fontWeight: 800, color: '#475569' }}>
                You can manage multiple salon locations from a single account.
              </Typography>

              <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
                {mySalons.map((salon, idx) => (
                  <React.Fragment key={salon._id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{ py: 2 }}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSwitch(salon._id)}
                          disabled={salon._id === user?.tenantId}
                          sx={{ borderRadius: 999, fontWeight: 800 }}
                        >
                          Switch to this
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(landingColors.purple, 0.1),
                            color: landingColors.purple,
                          }}
                        >
                          <BusinessRoundedIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={salon.name}
                        primaryTypographyProps={{ fontWeight: 900, fontSize: 16 }}
                        secondary={salon.slug ? `slug: ${salon.slug}` : 'New Salon'}
                        secondaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    {idx < mySalons.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Stack>
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog
        open={createDialogOpen}
        onClose={() => !saving && setCreateDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5 }}>
          Create New Salon
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
              Build your empire. Each salon has its own staff, services, and booking rules.
            </Typography>
            <TextField
              autoFocus
              label="Salon Name"
              fullWidth
              value={newSalonName}
              onChange={(e) => setNewSalonName(e.target.value)}
              placeholder="e.g. Slotify Central"
              disabled={saving}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{ fontWeight: 800, color: '#64748B' }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSalon}
            disabled={saving || !newSalonName.trim()}
            sx={{
              borderRadius: 999,
              px: 4,
              fontWeight: 900,
              bgcolor: landingColors.purple,
            }}
          >
            {saving ? 'Creating...' : 'Create Salon'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
