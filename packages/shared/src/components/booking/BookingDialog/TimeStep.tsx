import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { alpha, Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import type * as React from 'react';
import type { AvailabilitySlot } from '../../../api/publicTenants';
import { landingColors } from '../../landing/constants';
import { formatDayChip, formatSlotTime } from './utils';

interface TimeStepProps {
  nextDays: Date[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  slots: any[];
  slotsLoading: boolean;
  selectedSlot: AvailabilitySlot | null;
  onSlotSelect: (slot: AvailabilitySlot) => void;
  groupedSlots: Record<string, any[]>;
  profilePreferredDays?: number[];
}

export const TimeStep: React.FC<TimeStepProps> = ({
  nextDays,
  selectedDate,
  onDateChange,
  slots,
  slotsLoading,
  selectedSlot,
  onSlotSelect,
  groupedSlots,
  profilePreferredDays,
}) => {
  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      {/* Date Picker */}
      <Box
        sx={{
          mx: -1,
          px: 1,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(landingColors.purple, 0.2),
            borderRadius: 3,
          },
        }}
      >
        <Stack direction="row" spacing={1}>
          {nextDays.map((date) => {
            const day = formatDayChip(date);
            const selected = selectedDate === day.value;
            const isPreferred = profilePreferredDays?.includes(date.getDay());
            return (
              <Box
                key={day.value}
                onClick={() => onDateChange(day.value)}
                sx={{
                  minWidth: 80,
                  p: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                  bgcolor: selected ? landingColors.purple : '#FFFFFF',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: landingColors.purple,
                  },
                }}
              >
                {isPreferred && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: selected ? '#FFF' : landingColors.purple,
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: selected ? '#FFFFFF' : '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  {day.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: selected ? '#FFFFFF' : '#0F172A',
                    mt: 0.25,
                  }}
                >
                  {day.subtitle.split(' ')[0]}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Slots Grid */}
      <Box>
        {slotsLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
            <CircularProgress size={32} sx={{ color: landingColors.purple }} />
          </Box>
        ) : slots.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#F1F5F9' }}>
            <Typography sx={{ fontWeight: 700, color: '#64748B' }}>No slots available</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {(['Recommended', 'Morning', 'Afternoon', 'Evening'] as const).map((groupName) => {
              const items = groupedSlots[groupName];
              if (!items.length) return null;
              return (
                <Box key={groupName}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 12,
                      color: groupName === 'Recommended' ? landingColors.purple : '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {groupName === 'Recommended' ? (
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                    ) : null}
                    {groupName} Slots
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: 1,
                    }}
                  >
                    {items.map((slot) => {
                      const selected =
                        selectedSlot?.staffId === slot.staffId &&
                        selectedSlot?.startTime === slot.startTime;

                      const showTooltip = groupName === 'Recommended' && slot.reasons?.length > 0;

                      const slotButton = (
                        <Button
                          variant={selected ? 'contained' : 'outlined'}
                          onClick={() => onSlotSelect(slot)}
                          sx={{
                            borderRadius: 2,
                            py: 1,
                            textTransform: 'none',
                            bgcolor: selected ? landingColors.purple : 'transparent',
                            borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.1)',
                            color: selected ? '#FFFFFF' : '#0F172A',
                            fontWeight: 700,
                            minWidth: 0,
                          }}
                        >
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {formatSlotTime(slot.startTime)}
                            {slot.isCustomerPreferred && groupName === 'Recommended' && (
                              <HistoryRoundedIcon sx={{ fontSize: 12 }} />
                            )}
                          </Stack>
                        </Button>
                      );

                      if (!showTooltip)
                        return <Box key={`${slot.staffId}-${slot.startTime}`}>{slotButton}</Box>;

                      return (
                        <Tooltip
                          key={`${slot.staffId}-${slot.startTime}`}
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  mb: 0.5,
                                  textTransform: 'uppercase',
                                  opacity: 0.8,
                                }}
                              >
                                Why this slot?
                              </Typography>
                              {slot.reasons?.map((r: string) => (
                                <Typography
                                  key={`${slot.staffId}-${slot.startTime}-${r}`}
                                  sx={{
                                    fontSize: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  • {r}
                                </Typography>
                              ))}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          {slotButton}
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};
