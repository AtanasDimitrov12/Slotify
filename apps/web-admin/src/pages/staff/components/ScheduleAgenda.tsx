import type { AvailableTenant, StaffAppointment, StaffBlockedSlotItem } from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { alpha, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import * as React from 'react';
import AppointmentStatusChip from './AppointmentStatusChip';

const profileColors = {
  purple: '#7C6CFF',
  text: '#0F172A',
  textSoft: '#64748B',
  bgSoft: '#F8FAFC',
  border: 'rgba(15,23,42,0.08)',
};

type TimeGap = {
  start: Date;
  end: Date;
  durationMin: number;
};

type AppointmentCluster = {
  id: string;
  start: Date;
  end: Date;
  appointments: StaffAppointment[];
  blockedSlots: StaffBlockedSlotItem[];
  gapBefore?: TimeGap;
};

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 19;
const MIN_GAP_TO_SHOW = 10;

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function toTimeInputValue(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getRiskColor(score?: number) {
  if (score === undefined) return '#94A3B8';
  if (score < 30) return '#10B981';
  if (score < 60) return '#F59E0B';
  return '#EF4444';
}

function buildClusters(
  appointments: StaffAppointment[],
  blockedSlots: StaffBlockedSlotItem[],
  selectedDate: string,
): {
  clusters: AppointmentCluster[];
  firstGap?: TimeGap;
  lastGap?: TimeGap;
} {
  const dayStart = new Date(`${selectedDate}T00:00:00`);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(`${selectedDate}T00:00:00`);
  dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  const allItems: { type: 'appt' | 'block'; start: number; end: number; original: any }[] = [
    ...appointments.map((a) => ({
      type: 'appt' as const,
      start: new Date(a.startTime).getTime(),
      end: new Date(a.endTime).getTime(),
      original: a,
    })),
    ...blockedSlots.map((s) => ({
      type: 'block' as const,
      start: new Date(`${s.date}T${s.startTime}:00`).getTime(),
      end: new Date(`${s.date}T${s.endTime}:00`).getTime(),
      original: s,
    })),
  ].sort((a, b) => a.start - b.start || a.end - b.end);

  if (!allItems.length) {
    return {
      clusters: [],
      firstGap: {
        start: dayStart,
        end: dayEnd,
        durationMin: Math.round((dayEnd.getTime() - dayStart.getTime()) / 60000),
      },
    };
  }

  const clusters: AppointmentCluster[] = [];
  let currentGroup: typeof allItems = [];
  let groupMaxEnd = 0;

  function finalizeCluster(group: typeof allItems): AppointmentCluster {
    const start = new Date(Math.min(...group.map((i) => i.start)));
    const end = new Date(Math.max(...group.map((i) => i.end)));
    return {
      id: `${start.toISOString()}-${end.toISOString()}`,
      start,
      end,
      appointments: group.filter((i) => i.type === 'appt').map((i) => i.original),
      blockedSlots: group.filter((i) => i.type === 'block').map((i) => i.original),
    };
  }

  for (const item of allItems) {
    if (currentGroup.length === 0) {
      currentGroup = [item];
      groupMaxEnd = item.end;
      continue;
    }

    if (item.start < groupMaxEnd) {
      currentGroup.push(item);
      groupMaxEnd = Math.max(groupMaxEnd, item.end);
    } else {
      clusters.push(finalizeCluster(currentGroup));
      currentGroup = [item];
      groupMaxEnd = item.end;
    }
  }

  if (currentGroup.length) {
    clusters.push(finalizeCluster(currentGroup));
  }

  // Calculate gaps
  let cursor = dayStart;
  let firstGap: TimeGap | undefined;

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const gapMin = Math.round((cluster.start.getTime() - cursor.getTime()) / 60000);

    if (gapMin >= MIN_GAP_TO_SHOW) {
      const gap = {
        start: new Date(cursor),
        end: new Date(cluster.start),
        durationMin: gapMin,
      };
      if (i === 0) firstGap = gap;
      cluster.gapBefore = gap;
    }
    cursor = cluster.end;
  }

  const lastGapMin = Math.round((dayEnd.getTime() - cursor.getTime()) / 60000);
  const lastGap =
    lastGapMin >= MIN_GAP_TO_SHOW
      ? {
          start: new Date(cursor),
          end: new Date(dayEnd),
          durationMin: lastGapMin,
        }
      : undefined;

  return { clusters, firstGap, lastGap };
}

function GapInline({
  start,
  durationMin,
  onAddAppointmentAt,
}: {
  start: Date;
  durationMin: number;
  onAddAppointmentAt: (time: string) => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      onClick={() => onAddAppointmentAt(toTimeInputValue(start))}
      sx={{
        py: 0.75,
        cursor: 'pointer',
        '&:hover .add-icon': { opacity: 1, transform: 'scale(1.1)' },
        '&:hover .gap-text': { color: profileColors.purple },
      }}
    >
      <Box sx={{ width: 50, textAlign: 'right' }}>
        <Typography
          sx={{
            color: '#CBD5E1',
            fontWeight: 700,
            fontSize: 11,
            fontFamily: 'monospace',
          }}
        >
          {formatTime(start)}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#E2E8F0' }} />
        <Typography
          className="gap-text"
          sx={{
            color: '#94A3B8',
            fontWeight: 700,
            fontSize: 12,
            transition: '0.2s',
          }}
        >
          {formatDuration(durationMin)} free
        </Typography>
        <IconButton
          size="small"
          className="add-icon"
          sx={{
            opacity: 0,
            color: profileColors.purple,
            transition: '0.2s',
            p: 0.25,
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
}

function AppointmentItem({
  appointment,
  selected,
  onSelect,
  onViewInsights,
  salons,
}: {
  appointment: StaffAppointment;
  selected: boolean;
  onSelect: () => void;
  onViewInsights?: () => void;
  salons: AvailableTenant[];
}) {
  const riskColor = getRiskColor(appointment.riskScore);
  const isCancelled = appointment.status === 'cancelled';
  const end = new Date(appointment.endTime);
  const salon = salons.find((s) => s._id === appointment.tenantId);

  return (
    <Box
      onClick={onSelect}
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.75,
        borderRadius: 2.5,
        bgcolor: selected ? alpha(profileColors.purple, 0.02) : '#FFF',
        border: '1px solid',
        borderColor: selected ? alpha(profileColors.purple, 0.3) : 'rgba(15,23,42,0.06)',
        boxShadow: selected
          ? `0 8px 20px ${alpha(profileColors.purple, 0.08)}`
          : '0 2px 8px rgba(0,0,0,0.01)',
        transition: 'all 0.15s ease-out',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: selected
            ? alpha(profileColors.purple, 0.4)
            : alpha(profileColors.purple, 0.2),
          bgcolor: selected ? alpha(profileColors.purple, 0.03) : alpha(profileColors.purple, 0.01),
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: isCancelled ? '#F43F5E' : riskColor,
        }}
      />

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
                color: isCancelled ? '#F43F5E' : profileColors.text,
                letterSpacing: -0.3,
                textDecoration: isCancelled ? 'line-through' : 'none',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {appointment.customerName}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography
                sx={{
                  color: profileColors.textSoft,
                  fontWeight: 600,
                  fontSize: 12.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {appointment.serviceName}
              </Typography>
              {salon && (
                <Typography
                  sx={{
                    color: profileColors.purple,
                    fontWeight: 700,
                    fontSize: 11,
                    bgcolor: alpha(profileColors.purple, 0.08),
                    px: 0.6,
                    borderRadius: 0.5,
                  }}
                >
                  {salon.name}
                </Typography>
              )}
            </Stack>
          </Box>
          <AppointmentStatusChip status={appointment.status} />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              color: profileColors.textSoft,
              fontWeight: 700,
              fontSize: 11,
              fontFamily: 'monospace',
              bgcolor: profileColors.bgSoft,
              px: 1,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            Until {formatTime(end)} · {appointment.durationMin}m
          </Typography>

          <Tooltip title={`Risk: ${appointment.riskScore ?? 'N/A'}%`} arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewInsights?.();
              }}
              sx={{
                p: 0.5,
                color: riskColor,
                bgcolor: alpha(riskColor, 0.05),
                '&:hover': { bgcolor: alpha(riskColor, 0.1) },
              }}
            >
              <ShieldRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

function BlockedSlotItem({ slot }: { slot: StaffBlockedSlotItem }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.75,
        borderRadius: 2.5,
        bgcolor: alpha('#94A3B8', 0.05),
        border: '1px dashed',
        borderColor: 'rgba(15,23,42,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#475569' }}>
          BLOCKED SLOT
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#64748B',
          }}
        >
          Until {slot.endTime}
        </Typography>
      </Stack>
      <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
        {slot.reason || 'No reason provided'}
      </Typography>
    </Box>
  );
}

export default function ScheduleAgenda({
  selectedDate,
  appointments,
  blockedSlots = [],
  selectedAppointmentId,
  onSelectAppointment,
  onAddAppointmentAt,
  onViewInsights,
  salons,
}: {
  selectedDate: string;
  appointments: StaffAppointment[];
  blockedSlots?: StaffBlockedSlotItem[];
  selectedAppointmentId: string | null;
  onSelectAppointment: (id: string) => void;
  onAddAppointmentAt: (time: string) => void;
  onViewInsights?: (id: string) => void;
  salons: AvailableTenant[];
}) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { clusters, firstGap, lastGap } = React.useMemo(
    () => buildClusters(appointments, blockedSlots, selectedDate),
    [appointments, blockedSlots, selectedDate],
  );

  const isToday = now.toISOString().split('T')[0] === selectedDate;

  return (
    <Box
      sx={{
        bgcolor: '#FFF',
        borderRadius: 4,
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 8px 32px rgba(15,23,42,0.02)',
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={1.5}>
        {!clusters.length ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: profileColors.text, mb: 0.5 }}>
              Free Day
            </Typography>
            <Typography sx={{ color: profileColors.textSoft, fontWeight: 500, fontSize: 14 }}>
              No appointments scheduled for today.
            </Typography>
          </Box>
        ) : (
          <>
            {firstGap && (
              <GapInline
                start={firstGap.start}
                durationMin={firstGap.durationMin}
                onAddAppointmentAt={onAddAppointmentAt}
              />
            )}

            {clusters.map((cluster, idx) => {
              const nextCluster = clusters[idx + 1];

              // Find where "Now" fits
              const isNowInThisCluster = isToday && now >= cluster.start && now <= cluster.end;
              const isNowAfterThisButBeforeNext =
                isToday && now > cluster.end && (!nextCluster || now < nextCluster.start);

              return (
                <React.Fragment key={cluster.id}>
                  {idx > 0 && cluster.gapBefore && (
                    <GapInline
                      start={cluster.gapBefore.start}
                      durationMin={cluster.gapBefore.durationMin}
                      onAddAppointmentAt={onAddAppointmentAt}
                    />
                  )}

                  <Stack direction="row" spacing={2} sx={{ py: 0.5, position: 'relative' }}>
                    <Box sx={{ width: 50, textAlign: 'right', pt: 1.5 }}>
                      <Typography
                        sx={{
                          color: isNowInThisCluster ? '#EF4444' : profileColors.text,
                          fontWeight: 800,
                          fontSize: 13,
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatTime(cluster.start)}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{
                        xs: 'column',
                        sm:
                          cluster.appointments.length + cluster.blockedSlots.length > 1
                            ? 'row'
                            : 'column',
                      }}
                      spacing={1.5}
                      sx={{ flex: 1 }}
                    >
                      {cluster.blockedSlots.map((slot) => (
                        <BlockedSlotItem key={slot.id} slot={slot} />
                      ))}
                      {cluster.appointments.map((appointment) => {
                        const startTime = new Date(appointment.startTime);
                        const isUpcoming =
                          appointment.status === 'confirmed' || appointment.status === 'pending';
                        const isOverdue = isUpcoming && startTime < now;

                        return (
                          <Box
                            key={appointment.id}
                            sx={{
                              flex: 1,
                              ...(isOverdue && {
                                animation: 'overdue-pulse-agenda 2s infinite ease-in-out',
                                '@keyframes overdue-pulse-agenda': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.01)' },
                                  '100%': { transform: 'scale(1)' },
                                },
                              }),
                            }}
                          >
                            <AppointmentItem
                              appointment={appointment}
                              selected={selectedAppointmentId === appointment.id}
                              onSelect={() => onSelectAppointment(appointment.id)}
                              onViewInsights={
                                onViewInsights ? () => onViewInsights(appointment.id) : undefined
                              }
                              salons={salons}
                            />
                            {isOverdue && (
                              <Typography
                                sx={{
                                  color: '#EF4444',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  mt: 0.5,
                                  ml: 1,
                                }}
                              >
                                RUNNING LATE
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Stack>

                  {isNowAfterThisButBeforeNext && (
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2 }}>
                      <Box sx={{ width: 40, height: '2px', bgcolor: '#EF4444', opacity: 0.4 }} />
                      <Typography
                        sx={{
                          mx: 2,
                          color: '#EF4444',
                          fontSize: 10,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        NOW · {formatTime(now)}
                      </Typography>
                      <Box sx={{ flex: 1, height: '2px', bgcolor: '#EF4444', opacity: 0.4 }} />
                    </Box>
                  )}
                </React.Fragment>
              );
            })}

            {lastGap && (
              <GapInline
                start={lastGap.start}
                durationMin={lastGap.durationMin}
                onAddAppointmentAt={onAddAppointmentAt}
              />
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
