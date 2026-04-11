import type { StaffAppointment } from '@barber/shared';
import { landingColors, premium } from '@barber/shared';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import {
  alpha,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';
import AppointmentStatusChip from './AppointmentStatusChip';

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_HEIGHT = 80;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / 60;
const CALENDAR_START_HOUR = 8;
const SNAP_MINUTES = 5;

const TIME_COLUMN_WIDTH = 100;
const APPOINTMENT_LEFT = 116;
const APPOINTMENT_RIGHT_GAP = 24;
const APPOINTMENT_GAP = 12;

type LayoutItem = {
  appointment: StaffAppointment;
  laneIndex: number;
  laneCount: number;
};

function parseTimeToMinutes(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

function getAppointmentTop(startTime: string) {
  const startMinutes = parseTimeToMinutes(startTime);
  const startOfSchedule = CALENDAR_START_HOUR * 60;
  return ((startMinutes - startOfSchedule) / 60) * SLOT_HEIGHT;
}

function getAppointmentHeight(durationMin: number) {
  return Math.max((durationMin / 60) * SLOT_HEIGHT, 42);
}

function formatTimeOnly(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function isDraggableStatus(status: StaffAppointment['status']) {
  return status === 'pending' || status === 'confirmed';
}

function getStatusPriority(status: StaffAppointment['status']) {
  switch (status) {
    case 'confirmed':
      return 0;
    case 'pending':
      return 1;
    case 'completed':
      return 2;
    case 'no-show':
      return 3;
    case 'cancelled':
      return 4;
    default:
      return 5;
  }
}

function buildLayout(appointments: StaffAppointment[]): LayoutItem[] {
  if (!appointments.length) return [];

  const sorted = [...appointments].sort((a, b) => {
    const timeDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    if (timeDiff !== 0) return timeDiff;

    const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;

    return a.customerName.localeCompare(b.customerName);
  });

  const clusters: StaffAppointment[][] = [];
  let currentCluster: StaffAppointment[] = [];
  let currentClusterMaxEnd = 0;

  for (const appointment of sorted) {
    const start = new Date(appointment.startTime).getTime();
    const end = new Date(appointment.endTime).getTime();

    if (currentCluster.length === 0) {
      currentCluster = [appointment];
      currentClusterMaxEnd = end;
      continue;
    }

    if (start < currentClusterMaxEnd) {
      currentCluster.push(appointment);
      currentClusterMaxEnd = Math.max(currentClusterMaxEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [appointment];
      currentClusterMaxEnd = end;
    }
  }

  if (currentCluster.length) {
    clusters.push(currentCluster);
  }

  const layout: LayoutItem[] = [];

  for (const cluster of clusters) {
    const clusterSorted = [...cluster].sort((a, b) => {
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;

      const timeDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (timeDiff !== 0) return timeDiff;

      return a.customerName.localeCompare(b.customerName);
    });

    const laneEndTimes: number[] = [];
    const clusterItems: LayoutItem[] = [];

    for (const appointment of clusterSorted) {
      const start = new Date(appointment.startTime).getTime();
      const end = new Date(appointment.endTime).getTime();

      let assignedLane = -1;

      for (let laneIndex = 0; laneIndex < laneEndTimes.length; laneIndex += 1) {
        if (start >= laneEndTimes[laneIndex]) {
          assignedLane = laneIndex;
          laneEndTimes[laneIndex] = end;
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = laneEndTimes.length;
        laneEndTimes.push(end);
      }

      clusterItems.push({
        appointment,
        laneIndex: assignedLane,
        laneCount: 0,
      });
    }

    const laneCount = laneEndTimes.length;

    for (const item of clusterItems) {
      layout.push({
        ...item,
        laneCount,
      });
    }
  }

  return layout;
}

export default function ScheduleCalendar({
  selectedDate,
  appointments,
  loading,
  selectedAppointmentId,
  onSelectAppointment,
  onMoveAppointment,
  onViewInsights,
}: {
  selectedDate: string;
  appointments: StaffAppointment[];
  loading: boolean;
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  onMoveAppointment: (appointment: StaffAppointment, nextStartIso: string) => Promise<void>;
  onViewInsights?: (id: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [previewTopById, setPreviewTopById] = React.useState<Record<string, number>>({});
  const [contentWidth, setContentWidth] = React.useState(700);
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const dragMetaRef = React.useRef<{
    id: string;
    offsetY: number;
  } | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    const updateWidth = () => {
      setContentWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>, appointment: StaffAppointment) {
    if (!isDraggableStatus(appointment.status)) {
      onSelectAppointment(appointment.id);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    dragMetaRef.current = {
      id: appointment.id,
      offsetY: event.clientY - rect.top,
    };
    setDraggingId(appointment.id);
    onSelectAppointment(appointment.id);
    event.preventDefault();
  }

  React.useEffect(() => {
    async function handleMouseUp(event: MouseEvent) {
      if (!dragMetaRef.current || !containerRef.current) return;

      const meta = dragMetaRef.current;
      const appointment = appointments.find((item) => item.id === meta.id);

      dragMetaRef.current = null;
      setDraggingId(null);

      if (!appointment || !isDraggableStatus(appointment.status)) {
        setPreviewTopById({});
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const rawTop = event.clientY - containerRect.top - meta.offsetY;
      const maxTop = HOURS.length * SLOT_HEIGHT - getAppointmentHeight(appointment.durationMin);
      const clampedTop = clamp(rawTop, 0, maxTop);

      const minutesFromStart = roundToStep(clampedTop / PIXELS_PER_MINUTE, SNAP_MINUTES);
      const totalMinutes = CALENDAR_START_HOUR * 60 + minutesFromStart;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const nextStart = new Date(`${selectedDate}T12:00:00`);
      nextStart.setHours(hours, minutes, 0, 0);

      setPreviewTopById({});

      if (nextStart.toISOString() === appointment.startTime) {
        return;
      }

      await onMoveAppointment(appointment, nextStart.toISOString());
    }

    function handleMouseMove(event: MouseEvent) {
      if (!dragMetaRef.current || !containerRef.current) return;

      const meta = dragMetaRef.current;
      const appointment = appointments.find((item) => item.id === meta.id);
      if (!appointment || !isDraggableStatus(appointment.status)) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const rawTop = event.clientY - containerRect.top - meta.offsetY;
      const maxTop = HOURS.length * SLOT_HEIGHT - getAppointmentHeight(appointment.durationMin);
      const clampedTop = clamp(rawTop, 0, maxTop);

      const minutesFromStart = roundToStep(clampedTop / PIXELS_PER_MINUTE, SNAP_MINUTES);
      const snappedTop = minutesFromStart * PIXELS_PER_MINUTE;

      setPreviewTopById((prev) => ({
        ...prev,
        [appointment.id]: snappedTop,
      }));
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [appointments, onMoveAppointment, selectedDate]);

  const layoutItems = React.useMemo(() => buildLayout(appointments), [appointments]);

  const totalHorizontalSpace = contentWidth - APPOINTMENT_LEFT - APPOINTMENT_RIGHT_GAP;

  const isToday = now.toISOString().split('T')[0] === selectedDate;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = CALENDAR_START_HOUR * 60;
  const endMinutes = (CALENDAR_START_HOUR + HOURS.length) * 60;
  const nowTop =
    isToday && nowMinutes >= startMinutes && nowMinutes <= endMinutes
      ? ((nowMinutes - startMinutes) / 60) * SLOT_HEIGHT
      : null;

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 40px rgba(15,23,42,0.03)',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 500 }}>
          <CircularProgress size={32} sx={{ color: landingColors.purple }} />
        </Box>
      ) : (
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            height: HOURS.length * SLOT_HEIGHT,
            overflow: 'auto',
            bgcolor: '#FFFFFF',
            userSelect: 'none',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 4 },
          }}
        >
          {HOURS.map((hour, index) => (
            <Box
              key={hour}
              sx={{
                position: 'absolute',
                top: index * SLOT_HEIGHT,
                left: 0,
                right: 0,
                height: SLOT_HEIGHT,
                borderTop: '1px solid',
                borderColor: 'rgba(15,23,42,0.03)',
              }}
            >
              <Typography
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 20,
                  width: 60,
                  color: '#94A3B8',
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </Typography>

              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: TIME_COLUMN_WIDTH,
                  right: 0,
                  bottom: 0,
                  borderLeft: '1px solid',
                  borderColor: 'rgba(15,23,42,0.03)',
                }}
              />
            </Box>
          ))}

          {nowTop !== null && (
            <Box
              sx={{
                position: 'absolute',
                top: nowTop,
                left: TIME_COLUMN_WIDTH - 8,
                right: 0,
                zIndex: 200,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#EF4444',
                  border: '2px solid #FFF',
                }}
              />
              <Box sx={{ height: '2px', flex: 1, bgcolor: '#EF4444', opacity: 0.6 }} />
            </Box>
          )}

          {layoutItems.map(({ appointment, laneIndex, laneCount }) => {
            const selected = selectedAppointmentId === appointment.id;
            const isDragging = draggingId === appointment.id;
            const draggable = isDraggableStatus(appointment.status);

            const top =
              previewTopById[appointment.id] !== undefined
                ? previewTopById[appointment.id]
                : getAppointmentTop(appointment.startTime);

            const height = getAppointmentHeight(appointment.durationMin);

            const isCancelled = appointment.status === 'cancelled';
            const isCompleted = appointment.status === 'completed';
            const isNoShow = appointment.status === 'no-show';
            const isUpcoming =
              appointment.status === 'confirmed' || appointment.status === 'pending';

            const startTime = new Date(appointment.startTime);
            const isOverdue = isUpcoming && startTime < now;

            const innerGapTotal = Math.max(0, (laneCount - 1) * APPOINTMENT_GAP);
            const laneWidth = Math.max(
              180,
              Math.floor((totalHorizontalSpace - innerGapTotal) / laneCount),
            );

            const left = APPOINTMENT_LEFT + laneIndex * (laneWidth + APPOINTMENT_GAP);

            const dense = laneCount > 1 || laneWidth < 280 || height < 64;
            const veryDense = laneWidth < 200 || height < 50;

            const showMetaLine = !veryDense && height >= 58;
            const showDnaIcon = !veryDense && height >= 48;

            const getRiskColor = (score?: number) => {
              if (score === undefined) return '#94A3B8';
              if (score < 30) return '#10B981';
              if (score < 60) return '#F59E0B';
              return '#EF4444';
            };

            const riskColor = getRiskColor(appointment.riskScore);

            return (
              <Box
                key={appointment.id}
                onMouseDown={(event) => handleMouseDown(event, appointment)}
                onClick={() => onSelectAppointment(appointment.id)}
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
                  cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                  border: '1px solid',
                  borderStyle: isCancelled ? 'dashed' : 'solid',
                  borderColor: isCancelled
                    ? '#F43F5E'
                    : isOverdue
                      ? alpha('#EF4444', 0.4)
                      : selected
                        ? alpha(landingColors.purple, 0.4)
                        : 'rgba(15,23,42,0.06)',
                  bgcolor: isCancelled
                    ? alpha('#F43F5E', 0.02)
                    : isOverdue
                      ? alpha('#EF4444', 0.02)
                      : isCompleted
                        ? alpha(landingColors.success, 0.02)
                        : isNoShow
                          ? alpha('#94A3B8', 0.04)
                          : selected
                            ? alpha(landingColors.purple, 0.03)
                            : '#FFFFFF',
                  boxShadow:
                    selected && !isDragging
                      ? `0 8px 24px ${alpha(landingColors.purple, 0.1)}`
                      : 'none',
                  opacity: isDragging ? 0.8 : 1,
                  zIndex: isDragging ? 100 : selected ? 50 : 10,
                  transition: isDragging ? 'none' : 'top 0.1s ease, box-shadow 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0.5,
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
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: '0 4px 4px 0',
                    bgcolor: isCancelled ? '#F43F5E' : riskColor,
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: dense ? 13 : 14,
                      color: isCancelled ? '#F43F5E' : '#0F172A',
                      textDecoration: isCancelled ? 'line-through' : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {appointment.customerName}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {showDnaIcon && (
                      <Tooltip title={`Risk: ${appointment.riskScore ?? 'N/A'}%`} arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewInsights?.(appointment.id);
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
                    {!veryDense && <AppointmentStatusChip status={appointment.status} />}
                  </Stack>
                </Stack>

                {showMetaLine && (
                  <Typography
                    sx={{
                      color: isOverdue ? '#EF4444' : '#64748B',
                      fontWeight: 600,
                      fontSize: dense ? 11 : 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTimeOnly(appointment.startTime)} · {appointment.serviceName}
                    {isOverdue && ' · Running Late'}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
