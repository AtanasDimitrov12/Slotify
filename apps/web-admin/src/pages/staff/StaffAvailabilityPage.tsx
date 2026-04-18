import {
  type AvailableTenant,
  getMyStaffAvailability,
  getMyTenants,
  landingColors,
  updateMyStaffAvailability,
  useToast,
} from '@barber/shared';
import { Alert, alpha, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import * as React from 'react';
import type { DaySchedule } from './components/types';
import WeeklyScheduleEditor from './components/WeeklyScheduleEditor';

const defaultSchedule: DaySchedule[] = [
  { dayOfWeek: 1, label: 'Mon', enabled: true, slots: [] },
  { dayOfWeek: 2, label: 'Tue', enabled: true, slots: [] },
  { dayOfWeek: 3, label: 'Wed', enabled: true, slots: [] },
  { dayOfWeek: 4, label: 'Thu', enabled: true, slots: [] },
  { dayOfWeek: 5, label: 'Fri', enabled: true, slots: [] },
  { dayOfWeek: 6, label: 'Sat', enabled: true, slots: [] },
  { dayOfWeek: 0, label: 'Sun', enabled: false, slots: [] },
];

function mapApiToUi(
  weeklyAvailability?: {
    dayOfWeek: number;
    slots: { startTime: string; endTime: string; tenantId: string }[];
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
        slots: found.slots || [],
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
  const [salons, setSalons] = React.useState<AvailableTenant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [availability, myTenants] = await Promise.all([
        getMyStaffAvailability(),
        getMyTenants(),
      ]);

      const mappedTenants: AvailableTenant[] = myTenants
        .filter((t: any) => t._id && t.name)
        .map((t: any) => ({ _id: t._id, name: t.name }));

      setSalons(mappedTenants);
      setSchedule(mapApiToUi(availability.weeklyAvailability));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSave() {
    setSaving(true);

    try {
      await updateMyStaffAvailability({
        weeklyAvailability: schedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          slots: day.slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            tenantId: s.tenantId,
          })),
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
            Set your working hours and select which salon you'll be working in for each shift.
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 13, mt: 1 }}>
            Your schedule is shared across all salons you work in to prevent double-booking.
          </Typography>
        </Box>

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
            alignSelf: { xs: 'flex-start', md: 'center' },
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
          }}
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      <WeeklyScheduleEditor value={schedule} onChange={setSchedule} salons={salons} />
    </Stack>
  );
}
