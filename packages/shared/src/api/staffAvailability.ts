import { apiFetch } from './http';

export type StaffAvailabilitySlot = {
  startTime: string;
  endTime: string;
  tenantId: string;
};

export type StaffAvailabilityResponse = {
  id: string;
  userId: string;
  weeklyAvailability: {
    dayOfWeek: number;
    slots: StaffAvailabilitySlot[];
    isAvailable: boolean;
  }[];
};

export type UpdateMyAvailabilityPayload = {
  weeklyAvailability: {
    dayOfWeek: number;
    slots: StaffAvailabilitySlot[];
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
