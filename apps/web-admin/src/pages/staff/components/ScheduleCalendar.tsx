import type { AvailableTenant, StaffAppointment, StaffBlockedSlotItem } from '@barber/shared';
import { landingColors, useToast } from '@barber/shared';
import { Box, CircularProgress, Typography } from '@mui/material';
import * as React from 'react';
import AppointmentCard from './AppointmentCard';
import BlockedSlotCard from './BlockedSlotCard';
import {
  buildLayout,
  CALENDAR_CONFIG,
  clamp,
  getHeight,
  isDraggableStatus,
  roundToStep,
} from './calendar-utils';

const HOURS = Array.from(
  { length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR },
  (_, i) => CALENDAR_CONFIG.START_HOUR + i,
);
const PIXELS_PER_MINUTE = CALENDAR_CONFIG.SLOT_HEIGHT / 60;

export default function ScheduleCalendar({
  selectedDate,
  appointments,
  blockedSlots = [],
  loading,
  selectedAppointmentId,
  onSelectAppointment,
  onMoveAppointment,
  onViewInsights,
  salons,
}: {
  selectedDate: string;
  appointments: StaffAppointment[];
  blockedSlots?: StaffBlockedSlotItem[];
  loading: boolean;
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  onMoveAppointment: (appointment: StaffAppointment, nextStartIso: string) => Promise<void>;
  onViewInsights?: (id: string) => void;
  salons: AvailableTenant[];
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [previewTopById, setPreviewTopById] = React.useState<Record<string, number>>({});
  const [contentWidth, setContentWidth] = React.useState(700);
  const [now, setNow] = React.useState(new Date());
  const { showToast } = useToast();

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CALENDAR_CONFIG.UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const dragMetaRef = React.useRef<{
    id: string;
    offsetY: number;
  } | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const updateWidth = () => setContentWidth(element.clientWidth);

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    appointment: StaffAppointment,
  ) => {
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

    // Crucial for pointer capture
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMetaRef.current || !containerRef.current) return;

    const meta = dragMetaRef.current;
    const appointment = appointments.find((item) => item.id === meta.id);
    if (!appointment || !isDraggableStatus(appointment.status)) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const rawTop = event.clientY - containerRect.top - meta.offsetY;
    const maxTop = HOURS.length * CALENDAR_CONFIG.SLOT_HEIGHT - getHeight(appointment.durationMin);
    const clampedTop = clamp(rawTop, 0, maxTop);

    const minutesFromStart = roundToStep(
      clampedTop / PIXELS_PER_MINUTE,
      CALENDAR_CONFIG.SNAP_MINUTES,
    );
    const snappedTop = minutesFromStart * PIXELS_PER_MINUTE;

    setPreviewTopById((prev) => ({
      ...prev,
      [appointment.id]: snappedTop,
    }));
  };

  const handlePointerUp = async (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMetaRef.current || !containerRef.current) return;

    const meta = dragMetaRef.current;
    const appointment = appointments.find((item) => item.id === meta.id);

    event.currentTarget.releasePointerCapture(event.pointerId);
    dragMetaRef.current = null;
    setDraggingId(null);
    setPreviewTopById({});

    if (!appointment || !isDraggableStatus(appointment.status)) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const rawTop = event.clientY - containerRect.top - meta.offsetY;
    const maxTop = HOURS.length * CALENDAR_CONFIG.SLOT_HEIGHT - getHeight(appointment.durationMin);
    const clampedTop = clamp(rawTop, 0, maxTop);

    const minutesFromStart = roundToStep(
      clampedTop / PIXELS_PER_MINUTE,
      CALENDAR_CONFIG.SNAP_MINUTES,
    );
    const totalMinutes = CALENDAR_CONFIG.START_HOUR * 60 + minutesFromStart;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Use current year/month/day from the selectedDate string to avoid timezone shifts
    const [year, month, day] = selectedDate.split('-').map(Number);
    const nextStart = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (nextStart.toISOString() === appointment.startTime) {
      return;
    }

    try {
      await onMoveAppointment(appointment, nextStart.toISOString());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to move appointment', 'error');
    }
  };

  const layoutItems = React.useMemo(
    () => buildLayout(appointments, blockedSlots),
    [appointments, blockedSlots],
  );

  const totalHorizontalSpace =
    contentWidth - CALENDAR_CONFIG.APPOINTMENT_LEFT - CALENDAR_CONFIG.APPOINTMENT_RIGHT_GAP;

  const isToday = now.toISOString().split('T')[0] === selectedDate;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = CALENDAR_CONFIG.START_HOUR * 60;
  const endMinutes = (CALENDAR_CONFIG.START_HOUR + HOURS.length) * 60;
  const nowTop =
    isToday && nowMinutes >= startMinutes && nowMinutes <= endMinutes
      ? ((nowMinutes - startMinutes) / 60) * CALENDAR_CONFIG.SLOT_HEIGHT
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
            height: HOURS.length * CALENDAR_CONFIG.SLOT_HEIGHT,
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
                top: index * CALENDAR_CONFIG.SLOT_HEIGHT,
                left: 0,
                right: 0,
                height: CALENDAR_CONFIG.SLOT_HEIGHT,
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
                  left: CALENDAR_CONFIG.TIME_COLUMN_WIDTH,
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
                left: CALENDAR_CONFIG.TIME_COLUMN_WIDTH - 8,
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

          {layoutItems.map((item) => {
            if (item.type === 'block') {
              return (
                <BlockedSlotCard
                  key={item.id}
                  slot={item.original as StaffBlockedSlotItem}
                  laneIndex={item.laneIndex}
                  laneCount={item.laneCount}
                  totalHorizontalSpace={totalHorizontalSpace}
                />
              );
            }

            const appointment = item.original as StaffAppointment;
            return (
              <AppointmentCard
                key={item.id}
                appointment={appointment}
                laneIndex={item.laneIndex}
                laneCount={item.laneCount}
                totalHorizontalSpace={totalHorizontalSpace}
                selectedAppointmentId={selectedAppointmentId}
                draggingId={draggingId}
                previewTop={previewTopById[item.id]}
                now={now}
                salons={salons}
                onMouseDown={(e) => handlePointerDown(e, appointment)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={() => onSelectAppointment(item.id)}
                onViewInsights={onViewInsights}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}
