import * as React from 'react';
import { Box, Card, CardContent, Grid, Stack, Switch, TextField, Typography, alpha } from '@mui/material';
import type { DaySchedule } from './types';
import { landingColors } from '../../../components/landing/constants';

type Props = {
  value: DaySchedule[];
  onChange: (next: DaySchedule[]) => void;
};

export default function WeeklyScheduleEditor({ value, onChange }: Props) {
  function patch(dayOfWeek: number, patchObj: Partial<DaySchedule>) {
    onChange(value.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patchObj } : d)));
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography sx={{ fontWeight: 1000, fontSize: 22, color: '#0F172A', mb: 1 }}>
          Weekly Availability
        </Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15, mb: 4 }}>
          Set your default recurring schedule.
        </Typography>

        <Stack spacing={1.5}>
          {value.map((d) => (
            <Box
              key={d.dayOfWeek}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: d.enabled ? 'rgba(124,108,255,0.12)' : 'rgba(15,23,42,0.04)',
                bgcolor: d.enabled ? alpha(landingColors.purple, 0.02) : alpha('#F8FAFC', 0.5),
                transition: 'all 0.2s ease',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      size="small"
                      checked={d.enabled}
                      onChange={(e) => patch(d.dayOfWeek, { enabled: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple },
                      }}
                    />
                    <Typography sx={{ fontWeight: 900, fontSize: 16, color: d.enabled ? '#0F172A' : '#94A3B8' }}>
                      {d.label}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    label="Start"
                    type="time"
                    value={d.start}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    label="End"
                    type="time"
                    value={d.end}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>

                <Grid item xs={6} sm={2.5}>
                  <TextField
                    fullWidth
                    label="Break Start"
                    type="time"
                    value={d.breakStart ?? ''}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { breakStart: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>

                <Grid item xs={6} sm={2.5}>
                  <TextField
                    fullWidth
                    label="Break End"
                    type="time"
                    value={d.breakEnd ?? ''}
                    disabled={!d.enabled}
                    onChange={(e) => patch(d.dayOfWeek, { breakEnd: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
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