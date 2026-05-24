import type { StaffAppointment, StaffBlockedSlotItem } from '@barber/shared';

export const CALENDAR_CONFIG = {
  START_HOUR: 8,
  END_HOUR: 19,
  SLOT_HEIGHT: 80,
  SNAP_MINUTES: 5,
  TIME_COLUMN_WIDTH: 100,
  APPOINTMENT_LEFT: 116,
  APPOINTMENT_RIGHT_GAP: 24,
  APPOINTMENT_GAP: 12,
  MIN_HEIGHT: 42,
  UPDATE_INTERVAL_MS: 30000,
  MIN_LANE_WIDTH_FOR_DENSE: 280,
  MIN_LANE_WIDTH_FOR_VERY_DENSE: 200,
  MIN_HEIGHT_FOR_DENSE: 64,
  MIN_HEIGHT_FOR_VERY_DENSE: 50,
  MIN_HEIGHT_FOR_META: 58,
  MIN_HEIGHT_FOR_DNA: 48,
  MIN_LANE_WIDTH: 180,
} as const;

export type LayoutItem = {
  id: string;
  type: 'appt' | 'block';
  startTime: string;
  durationMin: number;
  original: StaffAppointment | StaffBlockedSlotItem;
  laneIndex: number;
  laneCount: number;
};

export function parseTimeToMinutes(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

export function parseHHMMToMinutes(value: string) {
  const [hh, mm] = value.split(':').map(Number);
  return hh * 60 + mm;
}

export function getTop(minutes: number) {
  const startOfSchedule = CALENDAR_CONFIG.START_HOUR * 60;
  return ((minutes - startOfSchedule) / 60) * CALENDAR_CONFIG.SLOT_HEIGHT;
}

export function getHeight(durationMin: number) {
  return Math.max((durationMin / 60) * CALENDAR_CONFIG.SLOT_HEIGHT, CALENDAR_CONFIG.MIN_HEIGHT);
}

export function formatTimeOnly(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function isDraggableStatus(status: StaffAppointment['status']) {
  return status === 'pending' || status === 'confirmed';
}

export function buildLayout(
  appointments: StaffAppointment[],
  blockedSlots: StaffBlockedSlotItem[],
): LayoutItem[] {
  const allItems = [
    ...appointments.map((a) => ({
      id: a.id,
      type: 'appt' as const,
      startMin: parseTimeToMinutes(a.startTime),
      endMin: parseTimeToMinutes(a.endTime),
      durationMin: a.durationMin,
      original: a,
    })),
    ...blockedSlots.map((s) => {
      const startMin = parseHHMMToMinutes(s.startTime);
      const endMin = parseHHMMToMinutes(s.endTime);
      return {
        id: s.id,
        type: 'block' as const,
        startMin,
        endMin,
        durationMin: endMin - startMin,
        original: s,
      };
    }),
  ].sort((a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin);

  if (!allItems.length) return [];

  const clusters: (typeof allItems)[] = [];
  let currentCluster: typeof allItems = [];
  let currentClusterMaxEnd = 0;

  for (const item of allItems) {
    if (currentCluster.length === 0) {
      currentCluster = [item];
      currentClusterMaxEnd = item.endMin;
      continue;
    }

    if (item.startMin < currentClusterMaxEnd) {
      currentCluster.push(item);
      currentClusterMaxEnd = Math.max(currentClusterMaxEnd, item.endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      currentClusterMaxEnd = item.endMin;
    }
  }

  if (currentCluster.length) {
    clusters.push(currentCluster);
  }

  const layout: LayoutItem[] = [];

  for (const cluster of clusters) {
    const laneEndTimes: number[] = [];
    const clusterItems: Omit<LayoutItem, 'laneCount'>[] = [];

    for (const item of cluster) {
      let assignedLane = -1;

      for (let laneIndex = 0; laneIndex < laneEndTimes.length; laneIndex += 1) {
        if (item.startMin >= laneEndTimes[laneIndex]) {
          assignedLane = laneIndex;
          laneEndTimes[laneIndex] = item.endMin;
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = laneEndTimes.length;
        laneEndTimes.push(item.endMin);
      }

      clusterItems.push({
        id: item.id,
        type: item.type,
        startTime:
          item.type === 'appt'
            ? (item.original as StaffAppointment).startTime
            : (item.original as StaffBlockedSlotItem).startTime,
        durationMin: item.durationMin,
        original: item.original,
        laneIndex: assignedLane,
      });
    }

    const laneCount = laneEndTimes.length;

    for (const item of clusterItems) {
      layout.push({
        ...item,
        laneCount,
      } as LayoutItem);
    }
  }

  return layout;
}
