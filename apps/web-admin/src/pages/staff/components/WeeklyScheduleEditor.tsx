import { type AvailableTenant, landingColors } from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { DaySchedule } from './types';

type Props = {
  value: DaySchedule[];
  onChange: (next: DaySchedule[]) => void;
  salons: AvailableTenant[];
};

export default function WeeklyScheduleEditor({ value, onChange, salons }: Props) {
  function patch(dayOfWeek: number, patchObj: Partial<DaySchedule>) {
    onChange(value.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patchObj } : d)));
  }

  function addSlot(dayOfWeek: number) {
    const day = value.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const newSlot = {
      startTime: '09:00',
      endTime: '17:00',
      tenantId: salons[0]?._id || '',
    };

    patch(dayOfWeek, { slots: [...day.slots, newSlot] });
  }

  function removeSlot(dayOfWeek: number, slotIndex: number) {
    const day = value.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const nextSlots = [...day.slots];
    nextSlots.splice(slotIndex, 1);
    patch(dayOfWeek, { slots: nextSlots });
  }

  function updateSlot(dayOfWeek: number, slotIndex: number, patchObj: any) {
    const day = value.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const nextSlots = day.slots.map((s, idx) => (idx === slotIndex ? { ...s, ...patchObj } : s));
    patch(dayOfWeek, { slots: nextSlots });
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
          Set your working hours and select the salon for each time slot.
        </Typography>

        <Stack spacing={2.5}>
          {value.map((d) => (
            <Box
              key={d.dayOfWeek}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: d.enabled ? 'rgba(124,108,255,0.12)' : 'rgba(15,23,42,0.04)',
                bgcolor: d.enabled ? alpha(landingColors.purple, 0.02) : alpha('#F8FAFC', 0.5),
                transition: 'all 0.2s ease',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Switch
                      size="small"
                      checked={d.enabled}
                      onChange={(e) => patch(d.dayOfWeek, { enabled: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: landingColors.purple,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 1000,
                        fontSize: 18,
                        color: d.enabled ? '#0F172A' : '#94A3B8',
                        width: 44,
                      }}
                    >
                      {d.label}
                    </Typography>
                  </Stack>

                  {d.enabled && (
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => addSlot(d.dayOfWeek)}
                      sx={{
                        fontWeight: 800,
                        color: landingColors.purple,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: alpha(landingColors.purple, 0.05) },
                      }}
                    >
                      Add Slot
                    </Button>
                  )}
                </Stack>

                {d.enabled && d.slots.length === 0 && (
                  <Typography sx={{ fontSize: 14, color: '#94A3B8', fontStyle: 'italic', px: 1 }}>
                    No working hours set for this day.
                  </Typography>
                )}

                {d.enabled && d.slots.length > 0 && (
                  <Stack spacing={1.5}>
                    {d.slots.map((slot, idx) => {
                      const slotKey = `${d.dayOfWeek}-${slot.tenantId}-${slot.startTime}-${slot.endTime}`;

                      return (
                        <Grid container spacing={2} key={slotKey} alignItems="center">
                          <Grid item xs={12} sm={3.5}>
                            <TextField
                              fullWidth
                              label="Start"
                              type="time"
                              size="small"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(d.dayOfWeek, idx, { startTime: e.target.value })
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3.5}>
                            <TextField
                              fullWidth
                              label="End"
                              type="time"
                              size="small"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(d.dayOfWeek, idx, { endTime: e.target.value })
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={10} sm={4}>
                            <TextField
                              select
                              fullWidth
                              label="Salon"
                              size="small"
                              value={slot.tenantId}
                              onChange={(e) =>
                                updateSlot(d.dayOfWeek, idx, { tenantId: e.target.value })
                              }
                            >
                              {salons.map((salon) => (
                                <MenuItem key={salon._id} value={salon._id}>
                                  {salon.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid
                            item
                            xs={2}
                            sm={1}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                          >
                            <Button
                              size="small"
                              onClick={() => removeSlot(d.dayOfWeek, idx)}
                              sx={{
                                minWidth: 40,
                                height: 40,
                                borderRadius: 2,
                                color: '#94A3B8',
                                '&:hover': { color: '#F43F5E', bgcolor: alpha('#F43F5E', 0.05) },
                              }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </Button>
                          </Grid>
                        </Grid>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
