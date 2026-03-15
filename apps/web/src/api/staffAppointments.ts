const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type StaffAppointment = {
  id: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  serviceId: string;
  staffServiceAssignmentId: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
};

export type StaffServiceOption = {
  id: string; // assignment id
  serviceId: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      //
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function listStaffServices(): Promise<StaffServiceOption[]> {
  const res = await fetch(`${API_BASE_URL}/staff/me/appointments/services`, {
    headers: getAuthHeaders(),
  });

  return parseJson<StaffServiceOption[]>(res);
}

export async function listStaffAppointments(date: string): Promise<StaffAppointment[]> {
  const res = await fetch(
    `${API_BASE_URL}/staff/me/appointments?date=${encodeURIComponent(
      new Date(`${date}T12:00:00`).toISOString(),
    )}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseJson<StaffAppointment[]>(res);
}

export async function createStaffAppointment(payload: {
  staffServiceAssignmentId: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/staff/me/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJson<{ id: string }>(res);
}

export async function updateStaffAppointment(
  id: string,
  payload: Partial<{
    staffServiceAssignmentId: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }>,
) {
  const res = await fetch(`${API_BASE_URL}/staff/me/appointments/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJson<{ success: true }>(res);
}

export async function updateStaffAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show',
) {
  const res = await fetch(`${API_BASE_URL}/staff/me/appointments/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return parseJson<{ success: true }>(res);
}

export async function cancelStaffAppointment(id: string) {
  const res = await fetch(`${API_BASE_URL}/staff/me/appointments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return parseJson<{ success: true }>(res);
}