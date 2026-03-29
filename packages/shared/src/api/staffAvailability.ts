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

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyStaffAvailability(): Promise<StaffAvailabilityResponse> {
  const res = await fetch('/api/staff/me/availability', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load staff availability';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateMyStaffAvailability(
  payload: UpdateMyAvailabilityPayload,
): Promise<StaffAvailabilityResponse> {
  const res = await fetch('/api/staff/me/availability', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to update staff availability';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
