import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { StaffAppointment } from '../../../api/staffAppointments';
import AppointmentStatusChip from './AppointmentStatusChip';

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_HEIGHT = 72;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / 60;
const CALENDAR_START_HOUR = 8;
const SNAP_MINUTES = 5;

const TIME_COLUMN_WIDTH = 88;
const APPOINTMENT_LEFT = 104;
const APPOINTMENT_RIGHT_GAP = 16;
const APPOINTMENT_GAP = 8;

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
  return Math.max((durationMin / 60) * SLOT_HEIGHT, 38);
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
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={900}>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            ref={containerRef}
            sx={{
              position: 'relative',
              height: HOURS.length * SLOT_HEIGHT,
              overflow: 'auto',
              bgcolor: 'background.paper',
              userSelect: 'none',
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
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 16,
                    width: 56,
                    opacity: 0.65,
                    fontWeight: 700,
                  }}
                >
                  {`${String(hour).padStart(2, '0')}:00`}
                </Typography>

                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: TIME_COLUMN_WIDTH,
                    right: 16,
                    bottom: 0,
                    borderLeft: '1px dashed',
                    borderColor: 'divider',
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
                150,
                Math.floor((totalHorizontalSpace - innerGapTotal) / laneCount),
              );

              const left =
                APPOINTMENT_LEFT + laneIndex * (laneWidth + APPOINTMENT_GAP);

              const dense = laneCount > 1 || laneWidth < 250 || height < 58;
              const veryDense = laneWidth < 190 || height < 46;

              const showMetaLine = !veryDense && height >= 52;
              const compactChip = dense;

              return (
                <Box
                  key={appointment.id}
                  onMouseDown={(event) => handleMouseDown(event, appointment)}
                  onClick={() => onSelectAppointment(appointment.id)}
                  title={`${formatTimeOnly(appointment.startTime)} · ${appointment.customerName} · ${appointment.serviceName} · ${appointment.durationMin} min`}
                  sx={{
                    position: 'absolute',
                    top,
                    left,
                    width: laneWidth,
                    height,
                    boxSizing: 'border-box',
                    borderRadius: 2.5,
                    px: dense ? 1 : 1.5,
                    py: dense ? 0.75 : 1.25,
                    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                    border: '1px solid',
                    borderStyle: isCancelled ? 'dashed' : 'solid',
                    borderColor: isCancelled
                      ? 'error.main'
                      : selected
                        ? 'primary.main'
                        : 'divider',
                    bgcolor: isCancelled
                      ? 'rgba(211, 47, 47, 0.06)'
                      : isCompleted
                        ? 'rgba(46, 125, 50, 0.06)'
                        : isNoShow
                          ? 'rgba(117, 117, 117, 0.08)'
                          : selected
                            ? 'primary.50'
                            : 'background.paper',
                    boxShadow:
                      selected && !isCancelled
                        ? '0 0 0 1px rgba(25,118,210,0.2)'
                        : 'none',
                    opacity: isCancelled ? 0.78 : isCompleted ? 0.92 : 1,
                    zIndex: isDragging ? 20 : selected ? 5 : isCancelled ? 1 : 2,
                    transition: isDragging ? 'none' : 'top 0.12s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: showMetaLine ? 'flex-start' : 'center',
                    gap: dense ? 0.25 : 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: dense ? 'center' : 'flex-start',
                      justifyContent: 'space-between',
                      gap: 0.75,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontWeight: 800,
                        fontSize: dense ? 14 : 15,
                        lineHeight: 1.2,
                        textDecoration: isCancelled ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatTimeOnly(appointment.startTime)} · {appointment.customerName}
                    </Typography>

                    <Box
                      sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        '& .MuiChip-root': compactChip
                          ? {
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: 12,
                                fontWeight: 700,
                              },
                            }
                          : undefined,
                      }}
                    >
                      <AppointmentStatusChip status={appointment.status} />
                    </Box>
                  </Box>

                  {showMetaLine && (
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.78,
                        fontSize: dense ? 12 : 13,
                        lineHeight: 1.2,
                        textDecoration: isCancelled ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {appointment.serviceName} · {appointment.durationMin} min
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