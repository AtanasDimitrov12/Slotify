import {
  getMyStaffAvailability,
  getOtherAvailabilitySync,
  landingColors,
  updateMyStaffAvailability,
  useToast,
} from '@barber/shared';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { Alert, alpha, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import * as React from 'react';
import type { DaySchedule } from './components/types';
import WeeklyScheduleEditor from './components/WeeklyScheduleEditor';

const defaultSchedule: DaySchedule[] = [
  {
    dayOfWeek: 1,
    label: 'Mon',
    enabled: true,
    start: '09:00',
    end: '18:00',
    breakStart: '13:00',
    breakEnd: '13:30',
  },
  {
    dayOfWeek: 2,
    label: 'Tue',
    enabled: true,
    start: '09:00',
    end: '18:00',
    breakStart: '13:00',
    breakEnd: '13:30',
  },
  {
    dayOfWeek: 3,
    label: 'Wed',
    enabled: true,
    start: '09:00',
    end: '18:00',
    breakStart: '13:00',
    breakEnd: '13:30',
  },
  {
    dayOfWeek: 4,
    label: 'Thu',
    enabled: true,
    start: '09:00',
    end: '18:00',
    breakStart: '13:00',
    breakEnd: '13:30',
  },
  {
    dayOfWeek: 5,
    label: 'Fri',
    enabled: true,
    start: '09:00',
    end: '18:00',
    breakStart: '13:00',
    breakEnd: '13:30',
  },
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
  const { showError, showSuccess } = useToast();
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(defaultSchedule);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [error, setError] = React.useState('');

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

  async function handleSync() {
    setSyncing(true);
    try {
      const other = await getOtherAvailabilitySync();
      if (other.weeklyAvailability) {
        setSchedule(mapApiToUi(other.weeklyAvailability));
        showSuccess("Availability loaded from your other salon. Don't forget to save!");
      }
    } catch (err) {
      showError("You don't have other availability settings to sync from yet.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSave() {
    setSaving(true);

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

      showSuccess('Availability updated successfully.');
    } catch (err) {
      showError(err);
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
            Availability
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Set your weekly working hours and break times.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
          <Button
            variant="outlined"
            startIcon={<SyncRoundedIcon />}
            onClick={handleSync}
            disabled={syncing || loading}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'rgba(15,23,42,0.12)',
              color: '#475569',
              px: 3,
              '&:hover': {
                bgcolor: alpha(landingColors.purple, 0.04),
                borderColor: landingColors.purple,
              },
            }}
          >
            {syncing ? 'Syncing...' : 'Sync from other Salon'}
          </Button>

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
              whiteSpace: 'nowrap',
              bgcolor: landingColors.purple,
              boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            }}
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      <WeeklyScheduleEditor value={schedule} onChange={setSchedule} />
    </Stack>
  );
}
