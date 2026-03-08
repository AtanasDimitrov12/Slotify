import * as React from 'react';
import { Box, Card, CardContent, Grid, Stack, Switch, TextField, Typography } from '@mui/material';
import type { DaySchedule } from './types';

type Props = {
  value: DaySchedule[];
  onChange: (next: DaySchedule[]) => void;
};

export default function WeeklyScheduleEditor({ value, onChange }: Props) {
  function patch(dayOfWeek: number, patchObj: Partial<DaySchedule>) {
    onChange(value.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patchObj } : d)));
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
          Weekly availability
        </Typography>
        <Typography sx={{ opacity: 0.7, mb: 2 }}>
          This is your default working schedule.
        </Typography>

        <Stack spacing={2}>
          {value.map((d) => (
            <Box key={d.dayOfWeek} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={900}>{d.label}</Typography>
                    <Switch
                      checked={d.enabled}
                      onChange={(e) => patch(d.dayOfWeek, { enabled: e.target.checked })}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={6} md={2.5}>
                  <TextField
                    fullWidth
                    label="Start"
                    type="time"
                    value={d.start}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6} md={2.5}>
                  <TextField
                    fullWidth
                    label="End"
                    type="time"
                    value={d.end}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6} md={2.5}>
                  <TextField
                    fullWidth
                    label="Break start"
                    type="time"
                    value={d.breakStart ?? ''}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { breakStart: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6} md={2.5}>
                  <TextField
                    fullWidth
                    label="Break end"
                    type="time"
                    value={d.breakEnd ?? ''}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { breakEnd: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}