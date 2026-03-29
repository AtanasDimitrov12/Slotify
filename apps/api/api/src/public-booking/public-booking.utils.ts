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

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function buildDateTimeOnDay(baseDate: Date, hhmm: string): Date {
  const total = parseTimeToMinutes(hhmm);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
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
