import { apiFetch } from './http';

export type StaffBlockedSlotItem = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason?: string;
  isActive: boolean;
};

export type CreateStaffBlockedSlotPayload = {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

export async function getMyStaffBlockedSlots(
  includeInactive = false,
): Promise<StaffBlockedSlotItem[]> {
  return apiFetch(`/staff-blocked-slots/me?includeInactive=${includeInactive}`, {
    method: 'GET',
  });
}

export async function createMyStaffBlockedSlot(
  payload: CreateStaffBlockedSlotPayload,
): Promise<StaffBlockedSlotItem> {
  return apiFetch('/staff-blocked-slots/me', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMyStaffBlockedSlot(
  id: string,
  payload: Partial<CreateStaffBlockedSlotPayload> & { isActive?: boolean },
): Promise<StaffBlockedSlotItem> {
  return apiFetch(`/staff-blocked-slots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMyStaffBlockedSlot(id: string): Promise<StaffBlockedSlotItem> {
  return apiFetch(`/staff-blocked-slots/${id}`, {
    method: 'DELETE',
  });
}

export async function getOwnerStaffBlockedSlots(
  tenantId: string,
  userId: string,
  includeInactive = true,
): Promise<StaffBlockedSlotItem[]> {
  return apiFetch(
    `/staff-blocked-slots?tenantId=${tenantId}&userId=${userId}&includeInactive=${includeInactive}`,
    {
      method: 'GET',
    },
  );
}
