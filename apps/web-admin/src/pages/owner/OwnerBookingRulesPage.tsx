import {
  getBookingRules,
  landingColors,
  premium,
  saveBookingRules,
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
  Stack,
  Typography,
} from '@mui/material';
import * as React from 'react';
import BookingRulesForm, { type BookingRulesValues } from './components/BookingRulesForm';

const defaultRules: BookingRulesValues = {
  bufferBefore: { enabled: false, minutes: 0 },
  bufferAfter: { enabled: true, minutes: 5 },
  minimumNoticeMinutes: 60,
  maximumDaysInAdvance: 30,
  autoConfirmReservations: true,
  allowBookingToEndAfterWorkingHours: false,
  allowCustomerChooseSpecificStaff: true,
};

export default function OwnerBookingRulesPage() {
  const { showError, showSuccess } = useToast();
  const [rules, setRules] = React.useState<BookingRulesValues>(defaultRules);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await getBookingRules();

      setRules({
        bufferBefore: data.bufferBefore ?? defaultRules.bufferBefore,
        bufferAfter: data.bufferAfter ?? defaultRules.bufferAfter,
        minimumNoticeMinutes: data.minimumNoticeMinutes ?? 60,
        maximumDaysInAdvance: data.maximumDaysInAdvance ?? 30,
        autoConfirmReservations: data.autoConfirmReservations ?? true,
        allowBookingToEndAfterWorkingHours: data.allowBookingToEndAfterWorkingHours ?? false,
        allowCustomerChooseSpecificStaff: data.allowCustomerChooseSpecificStaff ?? true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking rules');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      await saveBookingRules(rules);
      showSuccess('Booking rules saved successfully.');
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

              <Typography sx={{ mt: 1, color: '#64748B', fontWeight: 600, fontSize: 18 }}>
                Configure how customers interact with your calendar.
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: 'auto' },
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  minHeight: 52,
                  px: 4,
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: landingColors.purple,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                }}
              >
                {saving ? 'Saving...' : 'Save Rules'}
              </Button>
            </Box>
          </Box>
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
            <BookingRulesForm value={rules} onChange={setRules} />
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
