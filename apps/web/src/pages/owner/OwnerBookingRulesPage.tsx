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
  Typography,
  alpha,
} from '@mui/material';

import BookingRulesForm, { type BookingRulesValues } from './components/BookingRulesForm';
import { getBookingRules, saveBookingRules } from '../../api/bookingRules';
import { landingColors, premium } from '../../components/landing/constants';

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
  const [rules, setRules] = React.useState<BookingRulesValues>(defaultRules);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
        allowBookingToEndAfterWorkingHours:
          data.allowBookingToEndAfterWorkingHours ?? false,
        allowCustomerChooseSpecificStaff:
          data.allowCustomerChooseSpecificStaff ?? true,
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
      setSuccess('Booking rules saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking rules');
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
            Booking Rules
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Configure how customers interact with your calendar.
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
            <BookingRulesForm value={rules} onChange={setRules} />

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
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
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 800 }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}