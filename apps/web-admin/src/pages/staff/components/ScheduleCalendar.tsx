import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import type { StaffAppointment } from '@barber/shared'; 
import AppointmentStatusChip from './AppointmentStatusChip';
import { landingColors, premium } from '@barber/shared'; 

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
    const timeDiff =
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
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

      const timeDiff =
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
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
}: {
  selectedDate: string;
  appointments: StaffAppointment[];
  loading: boolean;
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  onMoveAppointment: (
    appointment: StaffAppointment,
    nextStartIso: string,
  ) => Promise<void>;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [previewTopById, setPreviewTopById] = React.useState<Record<string, number>>({});
  const [contentWidth, setContentWidth] = React.useState(700);

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

  function handleMouseDown(
    event: React.MouseEvent<HTMLDivElement>,
    appointment: StaffAppointment,
  ) {
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
      const maxTop =
        HOURS.length * SLOT_HEIGHT - getAppointmentHeight(appointment.durationMin);
      const clampedTop = clamp(rawTop, 0, maxTop);

      const minutesFromStart = roundToStep(
        clampedTop / PIXELS_PER_MINUTE,
        SNAP_MINUTES,
      );
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
      const maxTop =
        HOURS.length * SLOT_HEIGHT - getAppointmentHeight(appointment.durationMin);
      const clampedTop = clamp(rawTop, 0, maxTop);

      const minutesFromStart = roundToStep(
        clampedTop / PIXELS_PER_MINUTE,
        SNAP_MINUTES,
      );
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

  const totalHorizontalSpace =
    contentWidth - APPOINTMENT_LEFT - APPOINTMENT_RIGHT_GAP;

  return (
    <Card
      sx={{
        borderRadius: `${premium.rLg * 4}px`,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 4,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'rgba(15,23,42,0.04)',
            bgcolor: alpha(landingColors.purple, 0.02),
          }}
        >
          <Typography sx={{ fontWeight: 1000, fontSize: 20, color: '#0F172A', letterSpacing: -0.5 }}>
            Daily Timeline
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 500 }}>
            <CircularProgress sx={{ color: landingColors.purple }} />
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
                  borderColor: 'rgba(15,23,42,0.04)',
                }}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 24,
                    width: 60,
                    color: '#94A3B8',
                    fontWeight: 800,
                    fontSize: 13,
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
                    borderColor: 'rgba(15,23,42,0.04)',
                  }}
                />
              </Box>
            ))}

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

              const innerGapTotal = Math.max(0, (laneCount - 1) * APPOINTMENT_GAP);
              const laneWidth = Math.max(
                180,
                Math.floor((totalHorizontalSpace - innerGapTotal) / laneCount),
              );

              const left =
                APPOINTMENT_LEFT + laneIndex * (laneWidth + APPOINTMENT_GAP);

              const dense = laneCount > 1 || laneWidth < 280 || height < 64;
              const veryDense = laneWidth < 200 || height < 50;

              const showMetaLine = !veryDense && height >= 58;

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
                    borderRadius: 3,
                    px: dense ? 1.5 : 2,
                    py: dense ? 1 : 1.5,
                    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                    border: '1px solid',
                    borderStyle: isCancelled ? 'dashed' : 'solid',
                    borderColor: isCancelled
                      ? '#F43F5E'
                      : selected
                        ? landingColors.purple
                        : 'rgba(15,23,42,0.08)',
                    bgcolor: isCancelled
                      ? alpha('#F43F5E', 0.04)
                      : isCompleted
                        ? alpha(landingColors.success, 0.04)
                        : isNoShow
                          ? alpha('#94A3B8', 0.06)
                          : selected
                            ? alpha(landingColors.purple, 0.06)
                            : '#FFFFFF',
                    boxShadow:
                      selected && !isDragging
                        ? `0 12px 30px ${alpha(landingColors.purple, 0.15)}`
                        : '0 4px 12px rgba(0,0,0,0.02)',
                    opacity: isDragging ? 0.8 : 1,
                    zIndex: isDragging ? 100 : selected ? 50 : 10,
                    transition: isDragging ? 'none' : 'top 0.1s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: dense ? 13 : 14.5,
                        color: isCancelled ? '#F43F5E' : '#0F172A',
                        textDecoration: isCancelled ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatTimeOnly(appointment.startTime)} · {appointment.customerName}
                    </Typography>
                    
                    {!veryDense && (
                      <AppointmentStatusChip status={appointment.status} />
                    )}
                  </Stack>

                  {showMetaLine && (
                    <Typography
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: dense ? 11 : 12.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {appointment.serviceName}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}