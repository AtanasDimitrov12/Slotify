import { landingColors } from '@barber/shared';
import {
  alpha,
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
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
  function update<K extends keyof BookingRulesValues>(field: K, fieldValue: BookingRulesValues[K]) {
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
    <Stack spacing={4}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: alpha(landingColors.blue, 0.04),
          border: `1px solid ${alpha(landingColors.blue, 0.1)}`,
        }}
      >
        <Typography sx={{ color: '#0369A1', fontWeight: 700, fontSize: 15 }}>
          Define the operational boundaries for your salon's calendar. These rules apply to all
          bookings by default.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* BUFFER BEFORE */}
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: 16,
              color: '#0F172A',
              mb: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Buffer Before Appointment
          </Typography>
          <Typography
            sx={{
              color: '#64748B',
              fontSize: 14,
              mb: 2,
              fontWeight: 600,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Gap required before a client arrives.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.bufferBefore.enabled}
                  onChange={(e) => updateBuffer('bufferBefore', { enabled: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: landingColors.purple,
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontWeight: 800, fontSize: 14 }}>Enable Buffer</Typography>}
            />
          </Box>

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
            sx={{
              mt: 2,
              maxWidth: 200,
              mx: { xs: 'auto', sm: 0 },
              display: 'flex',
            }}
          />
        </Grid>

        {/* BUFFER AFTER */}
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: 16,
              color: '#0F172A',
              mb: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Buffer After Appointment
          </Typography>
          <Typography
            sx={{
              color: '#64748B',
              fontSize: 14,
              mb: 2,
              fontWeight: 600,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Time for cleanup or break after service.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.bufferAfter.enabled}
                  onChange={(e) => updateBuffer('bufferAfter', { enabled: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: landingColors.purple,
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontWeight: 800, fontSize: 14 }}>Enable Buffer</Typography>}
            />
          </Box>

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
            sx={{
              mt: 2,
              maxWidth: 200,
              mx: { xs: 'auto', sm: 0 },
              display: 'flex',
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ opacity: 0.5 }} />
        </Grid>

        {/* MIN NOTICE */}
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: 16,
              color: '#0F172A',
              mb: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Minimum Booking Notice
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Minutes before start"
            value={value.minimumNoticeMinutes}
            onChange={(e) => update('minimumNoticeMinutes', Number(e.target.value))}
            helperText="Prevents last-minute surprise bookings."
            sx={{
              maxWidth: 240,
              mx: { xs: 'auto', sm: 0 },
              display: 'flex',
              '& .MuiFormHelperText-root': { textAlign: { xs: 'center', sm: 'left' } },
            }}
          />
        </Grid>

        {/* MAX DAYS */}
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: 16,
              color: '#0F172A',
              mb: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Maximum Booking Horizon
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Days in advance"
            value={value.maximumDaysInAdvance}
            onChange={(e) => update('maximumDaysInAdvance', Number(e.target.value))}
            helperText="How far into the future can clients book."
            sx={{
              maxWidth: 240,
              mx: { xs: 'auto', sm: 0 },
              display: 'flex',
              '& .MuiFormHelperText-root': { textAlign: { xs: 'center', sm: 'left' } },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ opacity: 0.5 }} />
        </Grid>

        {/* AUTO CONFIRM */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.autoConfirmReservations}
                  onChange={(e) => update('autoConfirmReservations', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: landingColors.purple,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 800, textAlign: { xs: 'center', sm: 'left' } }}>
                  Automatically confirm all new reservations
                </Typography>
              }
            />
          </Box>
        </Grid>

        {/* END AFTER HOURS */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.allowBookingToEndAfterWorkingHours}
                  onChange={(e) => update('allowBookingToEndAfterWorkingHours', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: landingColors.purple,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 800, textAlign: { xs: 'center', sm: 'left' } }}>
                  Allow appointments to finish after closing time
                </Typography>
              }
            />
          </Box>
        </Grid>

        {/* CHOOSE STAFF */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.allowCustomerChooseSpecificStaff}
                  onChange={(e) => update('allowCustomerChooseSpecificStaff', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: landingColors.purple,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 800, textAlign: { xs: 'center', sm: 'left' } }}>
                  Enable clients to request specific staff members
                </Typography>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
