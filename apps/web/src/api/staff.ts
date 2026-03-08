export type CreateStaffPayload = {
  name: string;
  email: string;
  password: string;
};

export async function createStaff(payload: CreateStaffPayload) {
  const token = localStorage.getItem('accessToken');

  const res = await fetch('/api/staff/onboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to create staff member';

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

export async function listStaff() {
  const token = localStorage.getItem('accessToken');

  const res = await fetch('/api/staff', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let message = 'Failed to load staff members';

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}