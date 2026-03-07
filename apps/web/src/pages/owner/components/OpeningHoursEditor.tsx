import * as React from 'react';
import {
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export type OpeningDay = {
  key: string;
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
  function updateOpeningDay(dayKey: string, patch: Partial<OpeningDay>) {
    onChange(value.map((day) => (day.key === dayKey ? { ...day, ...patch } : day)));
  }

  return (
    <Stack spacing={2}>
      <Typography sx={{ opacity: 0.7 }}>
        Set working days and start/end time for each day.
      </Typography>

      {value.map((day) => (
        <Card key={day.key} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography fontWeight={800}>{day.label}</Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={day.enabled}
                      onChange={(e) =>
                        updateOpeningDay(day.key, { enabled: e.target.checked })
                      }
                    />
                  }
                  label={day.enabled ? 'Open' : 'Closed'}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start time"
                  type="time"
                  value={day.start}
                  onChange={(e) =>
                    updateOpeningDay(day.key, { start: e.target.value })
                  }
                  disabled={!day.enabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End time"
                  type="time"
                  value={day.end}
                  onChange={(e) =>
                    updateOpeningDay(day.key, { end: e.target.value })
                  }
                  disabled={!day.enabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}