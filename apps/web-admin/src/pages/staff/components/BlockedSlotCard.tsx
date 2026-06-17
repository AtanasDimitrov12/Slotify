import type { StaffBlockedSlotItem } from '@barber/shared';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { alpha, Box, Stack, Typography } from '@mui/material';
import { CALENDAR_CONFIG, getHeight, getTop, parseHHMMToMinutes } from './calendar-utils';

interface BlockedSlotCardProps {
  slot: StaffBlockedSlotItem;
  laneIndex: number;
  laneCount: number;
  totalHorizontalSpace: number;
  startHour?: number;
}

export default function BlockedSlotCard({
  slot,
  laneIndex,
  laneCount,
  totalHorizontalSpace,
  startHour = 8,
}: BlockedSlotCardProps) {
  const { id, startTime, endTime, reason } = slot;

  const startMin = parseHHMMToMinutes(startTime);
  const endMin = parseHHMMToMinutes(endTime);
  const durationMin = endMin - startMin;

  const top = getTop(startMin, startHour);
  const height = getHeight(durationMin);

  const innerGapTotal = Math.max(0, (laneCount - 1) * CALENDAR_CONFIG.APPOINTMENT_GAP);
  const laneWidth = Math.max(
    CALENDAR_CONFIG.MIN_LANE_WIDTH,
    Math.floor((totalHorizontalSpace - innerGapTotal) / laneCount),
  );

  const left =
    CALENDAR_CONFIG.APPOINTMENT_LEFT + laneIndex * (laneWidth + CALENDAR_CONFIG.APPOINTMENT_GAP);

  const dense =
    laneCount > 1 ||
    laneWidth < CALENDAR_CONFIG.MIN_LANE_WIDTH_FOR_DENSE ||
    height < CALENDAR_CONFIG.MIN_HEIGHT_FOR_DENSE;
  const veryDense =
    laneWidth < CALENDAR_CONFIG.MIN_LANE_WIDTH_FOR_VERY_DENSE ||
    height < CALENDAR_CONFIG.MIN_HEIGHT_FOR_VERY_DENSE;

  return (
    <Box
      key={id}
      sx={{
        position: 'absolute',
        top,
        left,
        width: laneWidth,
        height: height - 2,
        boxSizing: 'border-box',
        borderRadius: 3,
        pl: dense ? 2.5 : 3,
        pr: dense ? 1.5 : 2,
        py: dense ? 1 : 1.5,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.12)',
        background: `repeating-linear-gradient(45deg, ${alpha('#64748B', 0.02)} 0px, ${alpha('#64748B', 0.02)} 10px, ${alpha('#64748B', 0.06)} 10px, ${alpha('#64748B', 0.06)} 20px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 5,
        boxShadow: '0 2px 6px rgba(15,23,42,0.01)',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 6,
          top: 6,
          bottom: 6,
          width: 4,
          borderRadius: 99,
          bgcolor: '#64748B',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ mb: reason && !veryDense ? 0.5 : 0 }}
      >
        <LockRoundedIcon sx={{ fontSize: dense ? 13 : 15, color: '#64748B', opacity: 0.8 }} />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: dense ? 11 : 12,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
          Blocked Slot
        </Typography>
      </Stack>
      {reason && !veryDense && (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: dense ? 12 : 13,
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            pl: dense ? 0.25 : 0.5,
          }}
        >
          {reason}
        </Typography>
      )}
    </Box>
  );
}
