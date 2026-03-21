import * as React from 'react';
import {
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
  Box,
  Divider,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';

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
    <Stack spacing={4}>
      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(landingColors.purple, 0.04), border: `1px solid ${alpha(landingColors.purple, 0.1)}` }}>
        <Typography sx={{ color: landingColors.purple, fontWeight: 700, fontSize: 15 }}>
          Customize how your personal calendar handles bookings. These settings override salon defaults when active.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: 1000, fontSize: 16, color: '#0F172A', mb: 1 }}>Buffer Before Appointment</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={value.bufferBefore.enabled}
                onChange={(e) =>
                  updateBuffer('bufferBefore', { enabled: e.target.checked })
                }
                disabled={disabled}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple } }}
              />
            }
            label={<Typography sx={{ fontWeight: 800, fontSize: 14 }}>Enable Buffer</Typography>}
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
            sx={{ mt: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: 1000, fontSize: 16, color: '#0F172A', mb: 1 }}>Buffer After Appointment</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={value.bufferAfter.enabled}
                onChange={(e) =>
                  updateBuffer('bufferAfter', { enabled: e.target.checked })
                }
                disabled={disabled}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple } }}
              />
            }
            label={<Typography sx={{ fontWeight: 800, fontSize: 14 }}>Enable Buffer</Typography>}
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
            sx={{ mt: 2 }}
          />
        </Grid>

        <Grid item xs={12}><Divider sx={{ opacity: 0.5 }} /></Grid>

        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: 1000, fontSize: 16, color: '#0F172A', mb: 1 }}>Booking Notice</Typography>
          <TextField
            fullWidth
            type="number"
            label="Minimum notice (minutes)"
            disabled={disabled}
            value={value.minimumNoticeMinutes}
            onChange={(e) =>
              update('minimumNoticeMinutes', Number(e.target.value))
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: 1000, fontSize: 16, color: '#0F172A', mb: 1 }}>Booking Horizon</Typography>
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

        <Grid item xs={12}><Divider sx={{ opacity: 0.5 }} /></Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.autoConfirmReservations}
                onChange={(e) =>
                  update('autoConfirmReservations', e.target.checked)
                }
                disabled={disabled}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple } }}
              />
            }
            label={<Typography sx={{ fontWeight: 800 }}>Automatically confirm my reservations</Typography>}
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
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple } }}
              />
            }
            label={<Typography sx={{ fontWeight: 800 }}>Allow sessions to end after my working hours</Typography>}
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
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple } }}
              />
            }
            label={<Typography sx={{ fontWeight: 800 }}>Allow customers to book me directly</Typography>}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}