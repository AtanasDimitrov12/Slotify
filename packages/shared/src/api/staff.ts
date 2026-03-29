export type CreateStaffPayload = {
  name: string;
  email: string;
  password: string;
};

export type StaffProfileResponse = {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  expertiseTags: string[];
  isBookable: boolean;
  isActive: boolean;
};

export type UpdateMyStaffProfilePayload = {
  displayName: string;
  bio?: string;
  experienceYears?: number;
  expertise?: string[];
  avatarUrl?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

export async function getMyStaffProfile(): Promise<StaffProfileResponse> {
  const res = await fetch('/api/staff/me/profile', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load staff profile';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateMyStaffProfile(
  payload: UpdateMyStaffProfilePayload,
): Promise<StaffProfileResponse> {
  const res = await fetch('/api/staff/me/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to update staff profile';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
