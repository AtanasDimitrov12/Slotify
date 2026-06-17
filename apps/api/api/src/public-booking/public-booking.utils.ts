import { BadRequestException } from '@nestjs/common';
import type { TimeRange } from './types/availability.types';

export function parseTimeToMinutes(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new BadRequestException(`Invalid time format: ${value}`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new BadRequestException(`Invalid time value: ${value}`);
  }

  return hours * 60 + minutes;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b;
}

export function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function clampToStep(date: Date, stepMinutes: number): Date {
  const ms = stepMinutes * 60_000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

export function getTimezoneOffset(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partValues: Record<string, string> = {};
  for (const part of parts) {
    partValues[part.type] = part.value;
  }

  const localInUTC = Date.UTC(
    Number(partValues.year),
    Number(partValues.month) - 1,
    Number(partValues.day),
    Number(partValues.hour) === 24 ? 0 : Number(partValues.hour),
    Number(partValues.minute),
    Number(partValues.second),
  );

  const offsetMs = localInUTC - date.getTime();
  return offsetMs / 60000;
}

export function getLocalMidnight(baseDate: Date, timezone: string): Date {
  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const date = baseDate.getUTCDate();

  const utcMidnight = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  const offsetMinutes = getTimezoneOffset(timezone, utcMidnight);
  return new Date(utcMidnight.getTime() - offsetMinutes * 60000);
}

export function startOfDay(date: Date, timezone = 'UTC'): Date {
  return getLocalMidnight(date, timezone);
}

export function endOfDay(date: Date, timezone = 'UTC'): Date {
  const localMidnight = getLocalMidnight(date, timezone);
  return new Date(localMidnight.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function buildDateTimeOnDay(baseDate: Date, hhmm: string, timezone = 'UTC'): Date {
  const localMidnight = getLocalMidnight(baseDate, timezone);
  const total = parseTimeToMinutes(hhmm);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return new Date(localMidnight.getTime() + (hours * 60 + minutes) * 60000);
}

export function subtractRanges(source: TimeRange, blockers: TimeRange[]): TimeRange[] {
  let segments: TimeRange[] = [source];

  for (const blocker of blockers) {
    const next: TimeRange[] = [];

    for (const segment of segments) {
      if (!rangesOverlap(segment.start, segment.end, blocker.start, blocker.end)) {
        next.push(segment);
        continue;
      }

      if (blocker.start > segment.start) {
        next.push({ start: segment.start, end: blocker.start });
      }

      if (blocker.end < segment.end) {
        next.push({ start: blocker.end, end: segment.end });
      }
    }

    segments = next.filter((segment) => segment.start < segment.end);
  }

  return segments;
}

export function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
  });
  const weekdayName = formatter.format(date);
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[weekdayName] ?? date.getUTCDay();
}
