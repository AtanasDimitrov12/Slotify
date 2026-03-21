import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import WeeklyScheduleEditor from './components/WeeklyScheduleEditor';
import type { DaySchedule } from './components/types';
import {
  getMyStaffAvailability,
  updateMyStaffAvailability,
} from '../../api/staffAvailability';
import { landingColors } from '../../components/landing/constants';

const defaultSchedule: DaySchedule[] = [
  { dayOfWeek: 1, label: 'Mon', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { dayOfWeek: 2, label: 'Tue', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { dayOfWeek: 3, label: 'Wed', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { dayOfWeek: 4, label: 'Thu', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { dayOfWeek: 5, label: 'Fri', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { dayOfWeek: 6, label: 'Sat', enabled: true, start: '10:00', end: '16:00' },
  { dayOfWeek: 0, label: 'Sun', enabled: false, start: '09:00', end: '18:00' },
];

function mapApiToUi(
  weeklyAvailability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isAvailable: boolean;
  }[],
): DaySchedule[] {
  return [...defaultSchedule]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((defaultDay) => {
      const found = weeklyAvailability?.find((d) => d.dayOfWeek === defaultDay.dayOfWeek);

      if (!found) return defaultDay;

      return {
        dayOfWeek: found.dayOfWeek,
        label: defaultDay.label,
        enabled: found.isAvailable,
        start: found.startTime,
        end: found.endTime,
        breakStart: found.breakStartTime,
        breakEnd: found.breakEndTime,
      };
    })
    .sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
    });
}

export default function StaffAvailabilityPage() {
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(defaultSchedule);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadAvailability = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyStaffAvailability();
      setSchedule(mapApiToUi(data.weeklyAvailability));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      await updateMyStaffAvailability({
        weeklyAvailability: schedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: day.start,
          endTime: day.end,
          breakStartTime: day.breakStart || undefined,
          breakEndTime: day.breakEnd || undefined,
          isAvailable: day.enabled,
        })),
      });

      setSuccess('Availability updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={4}>
        <Box>
          <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
            Availability
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Set your weekly working hours and break times.
          </Typography>
        </Box>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        <WeeklyScheduleEditor value={schedule} onChange={setSchedule} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </Box>
      </Stack>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 800 }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}