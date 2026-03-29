export type StaffServiceItem = {
  id: string;
  serviceId: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyStaffServices(): Promise<StaffServiceItem[]> {
  const res = await fetch('/api/staff/me/services', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load staff services';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function createMyStaffService(payload: {
  serviceId: string;
  durationMin?: number;
  priceEUR?: number;
}): Promise<StaffServiceItem> {
  const res = await fetch('/api/staff/me/services', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to add service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateMyStaffService(
  id: string,
  payload: { durationMin?: number; priceEUR?: number },
): Promise<StaffServiceItem> {
  const res = await fetch(`/api/staff/me/services/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to update service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function deleteMyStaffService(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/staff/me/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to delete service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
