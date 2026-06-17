import type { AvailableTenant, StaffAppointment } from '@barber/shared';
import { landingColors } from '@barber/shared';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { alpha, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type * as React from 'react';
import AppointmentStatusChip from './AppointmentStatusChip';
import { CALENDAR_CONFIG, formatTimeOnly, getTop, isDraggableStatus } from './calendar-utils';

interface AppointmentCardProps {
  appointment: StaffAppointment;
  laneIndex: number;
  laneCount: number;
  totalHorizontalSpace: number;
  selectedAppointmentId: string | null;
  draggingId: string | null;
  previewTop: number | undefined;
  now: Date;
  salons: AvailableTenant[];
  onMouseDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onViewInsights?: (id: string) => void;
  startHour?: number;
}

export default function AppointmentCard({
  appointment,
  laneIndex,
  laneCount,
  totalHorizontalSpace,
  selectedAppointmentId,
  draggingId,
  previewTop,
  now,
  salons,
  onMouseDown,
  onPointerMove,
  onPointerUp,
  onClick,
  onViewInsights,
  startHour = 8,
}: AppointmentCardProps) {
  const { id, startTime, status, customerName, serviceName, durationMin, riskScore, tenantId } =
    appointment;

  const selected = selectedAppointmentId === id;
  const isDragging = draggingId === id;
  const draggable = isDraggableStatus(status);

  const top =
    previewTop !== undefined
      ? previewTop
      : getTop(new Date(startTime).getHours() * 60 + new Date(startTime).getMinutes(), startHour);
  const height = Math.max(
    (durationMin / 60) * CALENDAR_CONFIG.SLOT_HEIGHT,
    CALENDAR_CONFIG.MIN_HEIGHT,
  );

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

  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const isNoShow = status === 'no-show';
  const isUpcoming = status === 'confirmed' || status === 'pending';

  const startTimeDate = new Date(startTime);
  const isOverdue = isUpcoming && startTimeDate < now;

  const showMetaLine = !veryDense && height >= CALENDAR_CONFIG.MIN_HEIGHT_FOR_META;
  const showDnaIcon = !veryDense && height >= CALENDAR_CONFIG.MIN_HEIGHT_FOR_DNA;

  const getRiskColor = (score?: number) => {
    if (score === undefined) return '#94A3B8';
    if (score < 30) return '#10B981';
    if (score < 60) return '#F59E0B';
    return '#EF4444';
  };

  const riskColor = getRiskColor(riskScore);
  const salon = salons.find((s) => s._id === tenantId);

  const accentColor = isCancelled
    ? '#F43F5E'
    : isOverdue
      ? '#EF4444'
      : isCompleted
        ? '#10B981'
        : isNoShow
          ? '#64748B'
          : landingColors.purple;

  return (
    <Box
      onPointerDown={onMouseDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
      sx={{
        position: 'absolute',
        top,
        left,
        width: laneWidth,
        height: height - 2,
        boxSizing: 'border-box',
        pl: dense ? 2.5 : 3,
        pr: dense ? 1.5 : 2,
        py: dense ? 1 : 1.5,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        border: '1px solid',
        borderStyle: isCancelled ? 'dashed' : 'solid',
        borderColor: isCancelled
          ? '#F43F5E'
          : isOverdue
            ? alpha('#EF4444', 0.4)
            : selected
              ? alpha(accentColor, 0.4)
              : 'rgba(15,23,42,0.08)',
        background: isDragging
          ? '#FFFFFF'
          : `linear-gradient(135deg, ${alpha(accentColor, 0.03)} 0%, #FFFFFF 100%)`,
        boxShadow: isDragging
          ? '0 20px 40px rgba(15,23,42,0.12)'
          : selected
            ? `0 10px 25px ${alpha(accentColor, 0.12)}`
            : '0 2px 6px rgba(15,23,42,0.02)',
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 1000 : selected ? 50 : 10,
        transform: isDragging ? 'scale(1.03) rotate(0.5deg)' : 'scale(1) rotate(0deg)',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 0.5,
        transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          ...(!isDragging && {
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 30px ${alpha(accentColor, 0.08)}`,
            borderColor: alpha(accentColor, 0.35),
          }),
        },
        ...(isOverdue && {
          animation: 'overdue-pulse 2s infinite ease-in-out',
          '@keyframes overdue-pulse': {
            '0%': { borderColor: alpha('#EF4444', 0.4) },
            '50%': { borderColor: alpha('#EF4444', 0.8) },
            '100%': { borderColor: alpha('#EF4444', 0.4) },
          },
        }),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 6,
          top: 6,
          bottom: 6,
          width: 4,
          borderRadius: 99,
          background: `linear-gradient(to bottom, ${accentColor}, ${alpha(accentColor, 0.6)})`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: dense ? 13 : 14.5,
            color: isCancelled ? '#F43F5E' : '#0F172A',
            letterSpacing: '-0.3px',
            textDecoration: isCancelled ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {customerName}
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {showDnaIcon && (
            <Tooltip title={`Risk: ${riskScore ?? 'N/A'}%`} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewInsights?.(id);
                }}
                sx={{
                  p: 0.4,
                  color: riskColor,
                  bgcolor: alpha(riskColor, 0.05),
                  '&:hover': { bgcolor: alpha(riskColor, 0.1) },
                }}
              >
                <ShieldRoundedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
          {!veryDense && <AppointmentStatusChip status={status} />}
        </Stack>
      </Stack>

      {showMetaLine && (
        <Typography
          sx={{
            color: isOverdue ? '#EF4444' : '#64748B',
            fontWeight: 700,
            fontSize: dense ? 11 : 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <span>{formatTimeOnly(startTime)}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{serviceName}</span>
          {salon && (
            <>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ color: landingColors.purple, fontWeight: 800 }}>{salon.name}</span>
            </>
          )}
          {isOverdue && (
            <>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ color: '#EF4444', fontWeight: 800 }}>LATE</span>
            </>
          )}
        </Typography>
      )}
    </Box>
  );
}
