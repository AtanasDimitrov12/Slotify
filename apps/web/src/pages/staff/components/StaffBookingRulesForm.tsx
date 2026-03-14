import * as React from 'react';
import {
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export type StaffBookingRulesValues = {
  bufferBefore: { enabled: boolean; minutes: number };
  bufferAfter: { enabled: boolean; minutes: number };
  minimumNoticeMinutes: number;
  maximumDaysInAdvance: number;
  autoConfirmReservations: boolean;
  allowBookingToEndAfterWorkingHours: boolean;
  allowCustomerChooseSpecificStaff: boolean;
};

type Props = {
  value: StaffBookingRulesValues;
  onChange: (next: StaffBookingRulesValues) => void;
  disabled?: boolean;
};

export default function StaffBookingRulesForm({
  value,
  onChange,
  disabled = false,
}: Props) {
  function update<K extends keyof StaffBookingRulesValues>(
    field: K,
    fieldValue: StaffBookingRulesValues[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function updateBuffer(
    field: 'bufferBefore' | 'bufferAfter',
    partial: Partial<StaffBookingRulesValues['bufferBefore']>,
  ) {
    update(field, {
      ...value[field],
      ...partial,
    });
  }

  return (
    <Stack spacing={3}>
      <Typography sx={{ opacity: 0.7 }}>
        Define how bookings should behave for your personal schedule.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Buffer before appointment
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={value.bufferBefore.enabled}
                onChange={(e) =>
                  updateBuffer('bufferBefore', { enabled: e.target.checked })
                }
                disabled={disabled}
              />
            }
            label="Enabled"
          />

          <TextField
            fullWidth
            type="number"
            label="Minutes"
            disabled={disabled || !value.bufferBefore.enabled}
            value={value.bufferBefore.minutes}
            onChange={(e) =>
              updateBuffer('bufferBefore', {
                minutes: Number(e.target.value),
              })
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Buffer after appointment
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={value.bufferAfter.enabled}
                onChange={(e) =>
                  updateBuffer('bufferAfter', { enabled: e.target.checked })
                }
                disabled={disabled}
              />
            }
            label="Enabled"
          />

          <TextField
            fullWidth
            type="number"
            label="Minutes"
            disabled={disabled || !value.bufferAfter.enabled}
            value={value.bufferAfter.minutes}
            onChange={(e) =>
              updateBuffer('bufferAfter', {
                minutes: Number(e.target.value),
              })
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Minimum booking notice (minutes)"
            disabled={disabled}
            value={value.minimumNoticeMinutes}
            onChange={(e) =>
              update('minimumNoticeMinutes', Number(e.target.value))
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Maximum days in advance"
            disabled={disabled}
            value={value.maximumDaysInAdvance}
            onChange={(e) =>
              update('maximumDaysInAdvance', Number(e.target.value))
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.autoConfirmReservations}
                onChange={(e) =>
                  update('autoConfirmReservations', e.target.checked)
                }
                disabled={disabled}
              />
            }
            label="Automatically confirm reservations"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.allowBookingToEndAfterWorkingHours}
                onChange={(e) =>
                  update('allowBookingToEndAfterWorkingHours', e.target.checked)
                }
                disabled={disabled}
              />
            }
            label="Allow booking to end after working hours"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.allowCustomerChooseSpecificStaff}
                onChange={(e) =>
                  update('allowCustomerChooseSpecificStaff', e.target.checked)
                }
                disabled={disabled}
              />
            }
            label="Allow customers to choose you directly"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}