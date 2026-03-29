function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getBookingRules() {
  const res = await fetch('/api/owner/settings/booking', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load booking rules';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function saveBookingRules(payload: any) {
  const res = await fetch('/api/owner/settings/booking', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to save booking rules';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export type BookingRulesPayload = {
  bufferBefore: { enabled: boolean; minutes: number };
  bufferAfter: { enabled: boolean; minutes: number };
  minimumNoticeMinutes: number;
  maximumDaysInAdvance: number;
  autoConfirmReservations: boolean;
  allowBookingToEndAfterWorkingHours: boolean;
  allowCustomerChooseSpecificStaff: boolean;
};

export type StaffBookingRulesResponse = {
  source: 'global' | 'custom';
  globalSettings: BookingRulesPayload;
  staffSettings: {
    userId: string;
    tenantId: string;
    useGlobalSettings: boolean;
    overrides?: Partial<BookingRulesPayload>;
  };
  effectiveSettings: BookingRulesPayload;
};

export async function getMyStaffBookingRules(): Promise<StaffBookingRulesResponse> {
  const res = await fetch('/api/staff-booking-settings/me/current', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load booking rules';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateMyStaffBookingRules(payload: {
  useGlobalSettings: boolean;
  overrides?: Partial<BookingRulesPayload>;
}) {
  const res = await fetch('/api/staff-booking-settings/me/current', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to save booking rules';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function updateStaffBookingRulesForOwner(
  userId: string,
  payload: {
    useGlobalSettings: boolean;
    overrides?: Partial<BookingRulesPayload>;
  },
) {
  const res = await fetch(`/api/staff-booking-settings/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to save booking rules';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
