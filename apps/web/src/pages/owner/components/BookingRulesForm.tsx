import * as React from 'react';
import {
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

export type BookingRulesValues = {
  bufferBefore: { enabled: boolean; minutes: number };
  bufferAfter: { enabled: boolean; minutes: number };
  minimumNoticeMinutes: number;
  maximumDaysInAdvance: number;
  autoConfirmReservations: boolean;
  allowBookingToEndAfterWorkingHours: boolean;
  allowCustomerChooseSpecificStaff: boolean;
};

type Props = {
  value: BookingRulesValues;
  onChange: (next: BookingRulesValues) => void;
};

export default function BookingRulesForm({ value, onChange }: Props) {
  function update<K extends keyof BookingRulesValues>(
    field: K,
    fieldValue: BookingRulesValues[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function updateBuffer(
    field: 'bufferBefore' | 'bufferAfter',
    partial: Partial<BookingRulesValues['bufferBefore']>,
  ) {
    update(field, {
      ...value[field],
      ...partial,
    });
  }

  return (
    <Stack spacing={3} sx={{ px: 2 }}>
      <Typography sx={{ opacity: 0.7 }}>
        Configure how customers are allowed to book appointments.
      </Typography>

      <Grid container spacing={2}>
        {/* BUFFER BEFORE */}
        <Grid item xs={12} md={6}>
          <Typography fontWeight={600}>Buffer before appointment</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={value.bufferBefore.enabled}
                onChange={(e) =>
                  updateBuffer('bufferBefore', { enabled: e.target.checked })
                }
              />
            }
            label="Enabled"
          />

          <TextField
            fullWidth
            type="number"
            label="Minutes"
            disabled={!value.bufferBefore.enabled}
            value={value.bufferBefore.minutes}
            onChange={(e) =>
              updateBuffer('bufferBefore', {
                minutes: Number(e.target.value),
              })
            }
          />
        </Grid>

        {/* BUFFER AFTER */}
        <Grid item xs={12} md={6}>
          <Typography fontWeight={600}>Buffer after appointment</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={value.bufferAfter.enabled}
                onChange={(e) =>
                  updateBuffer('bufferAfter', { enabled: e.target.checked })
                }
              />
            }
            label="Enabled"
          />

          <TextField
            fullWidth
            type="number"
            label="Minutes"
            disabled={!value.bufferAfter.enabled}
            value={value.bufferAfter.minutes}
            onChange={(e) =>
              updateBuffer('bufferAfter', {
                minutes: Number(e.target.value),
              })
            }
          />
        </Grid>

        {/* MIN NOTICE */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Minimum booking notice (minutes)"
            value={value.minimumNoticeMinutes}
            onChange={(e) =>
              update('minimumNoticeMinutes', Number(e.target.value))
            }
          />
        </Grid>

        {/* MAX DAYS */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Maximum days in advance"
            value={value.maximumDaysInAdvance}
            onChange={(e) =>
              update('maximumDaysInAdvance', Number(e.target.value))
            }
          />
        </Grid>

        {/* AUTO CONFIRM */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.autoConfirmReservations}
                onChange={(e) =>
                  update('autoConfirmReservations', e.target.checked)
                }
              />
            }
            label="Automatically confirm reservations"
          />
        </Grid>

        {/* END AFTER HOURS */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.allowBookingToEndAfterWorkingHours}
                onChange={(e) =>
                  update(
                    'allowBookingToEndAfterWorkingHours',
                    e.target.checked,
                  )
                }
              />
            }
            label="Allow booking to end after working hours"
          />
        </Grid>

        {/* CHOOSE STAFF */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.allowCustomerChooseSpecificStaff}
                onChange={(e) =>
                  update(
                    'allowCustomerChooseSpecificStaff',
                    e.target.checked,
                  )
                }
              />
            }
            label="Allow customers to choose a specific staff member"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}