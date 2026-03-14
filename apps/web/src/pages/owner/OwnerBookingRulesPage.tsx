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
} from '@mui/material';

import BookingRulesForm, { type BookingRulesValues } from './components/BookingRulesForm';
import { getBookingRules, saveBookingRules } from '../../api/bookingRules';

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
            Booking rules
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            Configure how customers can book appointments in your salon.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ px: 3 }}>
            <BookingRulesForm value={rules} onChange={setRules} />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                Save
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}