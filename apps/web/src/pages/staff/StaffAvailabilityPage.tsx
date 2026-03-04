import * as React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import WeeklyScheduleEditor from './components/WeeklyScheduleEditor';
import type { DaySchedule } from './components/types';

const initial: DaySchedule[] = [
  { day: 'Mon', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { day: 'Tue', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { day: 'Wed', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { day: 'Thu', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { day: 'Fri', enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '13:30' },
  { day: 'Sat', enabled: true, start: '10:00', end: '16:00' },
  { day: 'Sun', enabled: false, start: '09:00', end: '18:00' },
];

export default function StaffAvailabilityPage() {
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(initial);

  function handleSave() {
    // TODO: PUT /staff/me/availability
    // eslint-disable-next-line no-console
    console.log('Save availability:', schedule);
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Availability
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Set your default weekly working hours and breaks.
        </Typography>
      </Box>

      <WeeklyScheduleEditor value={schedule} onChange={setSchedule} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save schedule
        </Button>
      </Box>
    </Stack>
  );
}