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

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyStaffTimeOff(): Promise<StaffTimeOffItem[]> {
  const res = await fetch('/api/staff/me/time-off', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load time off requests';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function createMyStaffTimeOff(
  payload: CreateStaffTimeOffPayload,
): Promise<StaffTimeOffItem> {
  const res = await fetch('/api/staff/me/time-off', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to create time off request';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function deleteMyStaffTimeOff(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/staff/me/time-off/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to delete time off request';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function getOwnerPendingTimeOffCounts(): Promise<PendingTimeOffCount[]> {
  const res = await fetch('/api/staff-time-off/owner/pending-counts', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load pending time off counts';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function getOwnerStaffTimeOffRequests(
  userId: string,
): Promise<OwnerStaffTimeOffItem[]> {
  const res = await fetch(`/api/staff-time-off/owner/staff/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load staff time off requests';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function reviewOwnerStaffTimeOffRequest(
  requestId: string,
  status: 'approved' | 'denied',
) {
  const res = await fetch(`/api/staff-time-off/owner/${requestId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    let message = 'Failed to review time off request';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
