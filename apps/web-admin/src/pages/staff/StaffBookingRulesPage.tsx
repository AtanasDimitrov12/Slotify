import {
  type AvailableTenant,
  getMyStaffBookingRules,
  getMyTenants,
  landingColors,
  premium,
  updateMyStaffBookingRules,
  useAuth,
  useToast,
} from '@barber/shared';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import StaffBookingRulesForm, {
  type StaffBookingRulesValues,
} from './components/StaffBookingRulesForm';

const defaultRules: StaffBookingRulesValues = {
  bufferBefore: { enabled: false, minutes: 0 },
  bufferAfter: { enabled: true, minutes: 5 },
  minimumNoticeMinutes: 60,
  maximumDaysInAdvance: 30,
  autoConfirmReservations: true,
  allowBookingToEndAfterWorkingHours: false,
  allowCustomerChooseSpecificStaff: true,
};

export default function StaffBookingRulesPage() {
  const { user, switchTenant } = useAuth();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [salons, setSalons] = React.useState<AvailableTenant[]>([]);
  const [useGlobalSettings, setUseGlobalSettings] = React.useState(true);
  const [rules, setRules] = React.useState<StaffBookingRulesValues>(defaultRules);
  const [globalRules, setGlobalRules] = React.useState<StaffBookingRulesValues>(defaultRules);

  const loadRules = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [data, myTenants] = await Promise.all([getMyStaffBookingRules(), getMyTenants()]);

      const mappedTenants: AvailableTenant[] = myTenants
        .filter((t: any) => t._id && t.name)
        .map((t: any) => ({ _id: t._id, name: t.name }));

      setSalons(mappedTenants);
      setUserId(data.staffSettings?.userId ?? '');
      setUseGlobalSettings(data.staffSettings?.useGlobalSettings ?? true);
      setGlobalRules(data.globalSettings ?? defaultRules);
      setRules(data.effectiveSettings ?? defaultRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking rules');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRules();
  }, [loadRules]);

  async function handleSalonChange(tenantId: string) {
    try {
      setLoading(true);
      await switchTenant(tenantId);
      await loadRules();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleUseGlobal(checked: boolean) {
    setUseGlobalSettings(checked);

    if (checked) {
      setRules(globalRules);
    }
  }

  async function handleSave() {
    if (!userId) {
      showError('Missing staff user id.');
      return;
    }

    setSaving(true);

    try {
      await updateMyStaffBookingRules({
        useGlobalSettings,
        overrides: useGlobalSettings ? undefined : rules,
      });

      showSuccess('Booking rules saved successfully.');
      await loadRules();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading && salons.length === 0) {
    return (
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}
          >
            Booking Rules
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Use salon-wide rules or define your own personal schedule behavior.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          {salons.length > 1 && (
            <TextField
              select
              size="small"
              label="Active Salon"
              value={user?.tenantId || ''}
              onChange={(e) => handleSalonChange(e.target.value)}
              sx={{ minWidth: 200 }}
              disabled={loading}
            >
              {salons.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving || loading}
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
            {saving ? 'Saving...' : 'Save Rules'}
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ minHeight: 200, display: 'grid', placeItems: 'center' }}>
          <CircularProgress sx={{ color: landingColors.purple }} />
        </Box>
      ) : (
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
            <Stack spacing={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: alpha(landingColors.purple, 0.04),
                  border: `1px solid ${alpha(landingColors.purple, 0.1)}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={useGlobalSettings}
                      onChange={(e) => handleToggleUseGlobal(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: landingColors.purple,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Follow salon default rules
                    </Typography>
                  }
                />
              </Box>

              {useGlobalSettings ? (
                <Alert severity="info" sx={{ borderRadius: 3, fontWeight: 600 }}>
                  Your personal schedule currently inherits all rules from the salon owner.
                </Alert>
              ) : null}

              <StaffBookingRulesForm
                value={rules}
                onChange={setRules}
                disabled={useGlobalSettings}
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
