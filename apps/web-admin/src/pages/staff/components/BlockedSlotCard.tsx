import type { StaffBlockedSlotItem } from '@barber/shared';
import { alpha, Box, Typography } from '@mui/material';
import { CALENDAR_CONFIG, getHeight, getTop, parseHHMMToMinutes } from './calendar-utils';

interface BlockedSlotCardProps {
  slot: StaffBlockedSlotItem;
  laneIndex: number;
  laneCount: number;
  totalHorizontalSpace: number;
}

export default function BlockedSlotCard({
  slot,
  laneIndex,
  laneCount,
  totalHorizontalSpace,
}: BlockedSlotCardProps) {
  const { id, startTime, endTime, reason } = slot;

  const startMin = parseHHMMToMinutes(startTime);
  const endMin = parseHHMMToMinutes(endTime);
  const durationMin = endMin - startMin;

  const top = getTop(startMin);
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
        borderRadius: 2.5,
        px: dense ? 1.5 : 2,
        py: dense ? 1 : 1.5,
        border: '1px dashed',
        borderColor: 'rgba(15,23,42,0.15)',
        bgcolor: alpha('#94A3B8', 0.05),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 5,
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: dense ? 11 : 12,
          color: '#64748B',
          textTransform: 'uppercase',
        }}
      >
        Blocked Slot
      </Typography>
      {!veryDense && (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: dense ? 12 : 13,
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {reason || 'No reason'}
        </Typography>
      )}
    </Box>
  );
}
