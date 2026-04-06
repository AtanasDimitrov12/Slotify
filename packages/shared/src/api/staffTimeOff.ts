import { apiFetch } from './http';

export type StaffTimeOffItem = {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'requested' | 'approved' | 'denied';
};

export type CreateStaffTimeOffPayload = {
  startDate: string;
  endDate: string;
  reason?: string;
};

export type OwnerStaffTimeOffItem = {
  _id: string;
  userId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'requested' | 'approved' | 'denied';
};

export type PendingTimeOffCount = {
  userId: string;
  pendingCount: number;
};

export async function getMyStaffTimeOff(): Promise<StaffTimeOffItem[]> {
  return apiFetch('/staff/me/time-off', {
    method: 'GET',
  });
}

export async function createMyStaffTimeOff(
  payload: CreateStaffTimeOffPayload,
): Promise<StaffTimeOffItem> {
  return apiFetch('/staff/me/time-off', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteMyStaffTimeOff(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/staff/me/time-off/${id}`, {
    method: 'DELETE',
  });
}

export async function getOwnerPendingTimeOffCounts(): Promise<PendingTimeOffCount[]> {
  return apiFetch('/staff-time-off/owner/pending-counts', {
    method: 'GET',
  });
}

export async function getOwnerStaffTimeOffRequests(
  userId: string,
): Promise<OwnerStaffTimeOffItem[]> {
  return apiFetch(`/staff-time-off/owner/staff/${userId}`, {
    method: 'GET',
  });
}

export async function reviewOwnerStaffTimeOffRequest(
  requestId: string,
  status: 'approved' | 'denied',
) {
  return apiFetch(`/staff-time-off/owner/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
