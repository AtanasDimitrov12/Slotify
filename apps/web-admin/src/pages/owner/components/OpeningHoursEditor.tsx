import { landingColors } from '@barber/shared';
import {
  alpha,
  Box,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export type OpeningDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type OpeningDay = {
  key: OpeningDayKey;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
};

type Props = {
  value: OpeningDay[];
  onChange: (next: OpeningDay[]) => void;
};

export default function OpeningHoursEditor({ value, onChange }: Props) {
  function updateOpeningDay(dayKey: OpeningDayKey, patch: Partial<OpeningDay>) {
    onChange(value.map((day) => (day.key === dayKey ? { ...day, ...patch } : day)));
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(landingColors.purple, 0.04),
          border: `1px solid ${alpha(landingColors.purple, 0.1)}`,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <Typography sx={{ color: landingColors.purple, fontWeight: 700, fontSize: 14 }}>
          Specify your salon's weekly schedule. These hours determine when customers can book
          appointments.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {value.map((day) => (
          <Box
            key={day.key}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: day.enabled ? 'rgba(15,23,42,0.08)' : 'rgba(15,23,42,0.04)',
              bgcolor: day.enabled ? '#FFFFFF' : alpha('#F8FAFC', 0.5),
              boxShadow: day.enabled ? '0 4px 12px rgba(15,23,42,0.02)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Grid
              container
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
            >
              <Grid item xs={12} sm={3}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 16,
                    color: day.enabled ? '#0F172A' : '#94A3B8',
                  }}
                >
                  {day.label}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={day.enabled}
                        onChange={(e) => updateOpeningDay(day.key, { enabled: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: landingColors.purple,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: day.enabled ? landingColors.success : '#64748B',
                        }}
                      >
                        {day.enabled ? 'OPEN' : 'CLOSED'}
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Start"
                  type="time"
                  value={day.start}
                  onChange={(e) => updateOpeningDay(day.key, { start: e.target.value })}
                  disabled={!day.enabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  size="small"
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="End"
                  type="time"
                  value={day.end}
                  onChange={(e) => updateOpeningDay(day.key, { end: e.target.value })}
                  disabled={!day.enabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
