import { apiFetch } from './http';

export type StaffAvailabilityResponse = {
  id: string;
  tenantId: string;
  userId: string;
  weeklyAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isAvailable: boolean;
  }[];
};

export type UpdateMyAvailabilityPayload = {
  weeklyAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isAvailable: boolean;
  }[];
};

export async function getMyStaffAvailability(): Promise<StaffAvailabilityResponse> {
  return apiFetch('/staff/me/availability', {
    method: 'GET',
  });
}

export async function updateMyStaffAvailability(
  payload: UpdateMyAvailabilityPayload,
): Promise<StaffAvailabilityResponse> {
  return apiFetch('/staff/me/availability', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
