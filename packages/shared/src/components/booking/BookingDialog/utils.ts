import type { CustomerProfile } from '../../../api/customerProfile';
import type { CustomerReservation } from '../../../api/customerReservations';
import type { AvailabilitySlot } from '../../../api/publicTenants';

export const STEP_SERVICE = 0;
export const STEP_TIME = 1;
export const STEP_DETAILS = 2;
export const STEP_OVERVIEW = 3;
export const STEP_SUCCESS = 4;

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatSlotTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSlotDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNextDays(count: number) {
  const result: Date[] = [];
  const base = new Date();

  for (let i = 0; i < count; i += 1) {
    const day = new Date(base);
    day.setDate(base.getDate() + i);
    result.push(day);
  }

  return result;
}

export function formatDayChip(date: Date) {
  return {
    value: formatDateInput(date),
    title: date.toLocaleDateString([], { weekday: 'short' }),
    subtitle: date.toLocaleDateString([], { day: '2-digit', month: 'short' }),
  };
}

export function isQuarterHourSlot(slot: AvailabilitySlot) {
  const date = new Date(slot.startTime);
  const minutes = date.getMinutes();
  return minutes % 15 === 0;
}

export type RecommendationResult = {
  bonus: number;
  reasons: string[];
  isCustomerPreferred: boolean;
  isStaffOptimized: boolean;
};

/**
 * AI-Driven Recommendation Engine
 * Mimics a personalized assistant by correlating historical behavior,
 * explicit intent, and operational efficiency.
 */
export function analyzeSlot(
  slot: AvailabilitySlot,
  profile: CustomerProfile | null,
  history: CustomerReservation[],
): RecommendationResult {
  if (!profile)
    return { bonus: 0, reasons: [], isCustomerPreferred: false, isStaffOptimized: false };

  let bonus = 0;
  const reasons: string[] = [];

  const slotDate = new Date(slot.startTime);
  const hour = slotDate.getHours();
  const day = slotDate.getDay();
  const minutes = slotDate.getMinutes();
  const currentTimeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // 1. INTENT ANALYSIS (Explicit Preferences)
  let hasSpecificPreference = false;
  if (profile.preferredBookingSlots) {
    for (const pSlot of profile.preferredBookingSlots) {
      if (pSlot.dayOfWeek === day) {
        if (pSlot.timeSlot.includes(' - ')) {
          const [start, end] = pSlot.timeSlot.split(' - ');
          if (currentTimeStr >= start && currentTimeStr <= end) {
            bonus += 2000; // High priority for explicit intent
            reasons.push('Matches your custom preferred window');
            hasSpecificPreference = true;
          }
        } else if (pSlot.timeSlot === 'morning' && hour < 12) {
          bonus += 1200;
          reasons.push('Perfect for your morning routine');
        } else if (pSlot.timeSlot === 'afternoon' && hour >= 12 && hour < 17) {
          bonus += 1200;
          reasons.push('Aligned with your afternoon availability');
        } else if (pSlot.timeSlot === 'evening' && hour >= 17) {
          bonus += 1200;
          reasons.push('Fits your evening schedule');
        }
      }
    }
  }

  // 2. BEHAVIORAL INTELLIGENCE (Pattern Matching)
  if (history.length > 0) {
    const successfulVisits = history.filter(
      (r) => r.status === 'completed' || r.status === 'confirmed',
    );

    // Check for "Loyalty Time" (Do they always come at this time?)
    const matchCount = successfulVisits.filter((res) => {
      const resDate = new Date(res.startTime);
      const diffMins = Math.abs((slotDate.getTime() - resDate.getTime()) / 60000) % 1440;
      return diffMins <= 30 || diffMins >= 1410;
    }).length;

    if (matchCount > 0) {
      bonus += 1000 * matchCount;
      reasons.push(`You've successfully visited at this time ${matchCount}x before`);
    }
  }

  // 3. OPERATIONAL SYNERGY (Business Health)
  const isStaffOptimized = slot.score >= 1000;
  if (isStaffOptimized) {
    bonus += 500;
    reasons.push('Excellent fit for the salon schedule');
  }

  return {
    bonus,
    reasons,
    isCustomerPreferred: bonus > 800,
    isStaffOptimized,
  };
}

/**
 * Groups and sorts slots based on the Recommendation Engine's scores.
 */
export function groupSlots(
  allSlots: AvailabilitySlot[],
  profile: CustomerProfile | null,
  history: CustomerReservation[],
) {
  const processedSlots = allSlots.map((s) => {
    const analysis = analyzeSlot(s, profile, history);
    return {
      ...s,
      combinedScore: s.score + analysis.bonus,
      isCustomerPreferred: analysis.isCustomerPreferred,
      isStaffOptimized: analysis.isStaffOptimized,
      reasons: analysis.reasons,
    };
  });

  const sorted = [...processedSlots].sort((a, b) => b.combinedScore - a.combinedScore);

  const recommendedSet = new Set<string>();
  const recommended: any[] = [];

  const addRec = (s: any) => {
    const key = `${s.staffId}-${s.startTime}`;
    if (!recommendedSet.has(key) && recommended.length < 6) {
      recommendedSet.add(key);
      recommended.push(s);
    }
  };

  // Build high-quality diverse recommendations
  sorted.slice(0, 3).forEach(addRec);
  sorted
    .filter((s) => s.isCustomerPreferred)
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, 2)
    .forEach(addRec);
  sorted
    .filter((s) => s.isStaffOptimized)
    .slice(0, 1)
    .forEach(addRec);
  sorted.slice(0, 4).forEach(addRec);

  const groups: Record<string, any[]> = {
    Recommended: recommended.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    ),
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  processedSlots.filter(isQuarterHourSlot).forEach((slot) => {
    const hour = new Date(slot.startTime).getHours();
    if (hour < 12) groups.Morning.push(slot);
    else if (hour < 17) groups.Afternoon.push(slot);
    else groups.Evening.push(slot);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return groups;
}
