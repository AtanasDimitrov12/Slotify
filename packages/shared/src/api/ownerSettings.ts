export type GeneralSettingsResponse = {
  salonName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
  websiteUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  openingHours: Record<string, { start: string; end: string }[]>;
};

export type SaveGeneralSettingsPayload = {
  salonName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
  websiteUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

export type SaveOpeningHoursPayload = {
  days: {
    key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    enabled: boolean;
    start?: string;
    end?: string;
  }[];
};

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getOwnerSettings(): Promise<GeneralSettingsResponse> {
  const res = await fetch('/api/owner/settings', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load business settings';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function saveGeneralSettings(payload: SaveGeneralSettingsPayload) {
  const res = await fetch('/api/owner/settings/general', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      salonName: payload.salonName,
      contactPersonName: payload.contactPersonName,
      contactPhone: payload.phone,
      contactEmail: payload.email,
      street: payload.street,
      houseNumber: payload.houseNumber,
      city: payload.city,
      postalCode: payload.postalCode,
      country: payload.country,
      timezone: payload.timezone,
      websiteUrl: payload.websiteUrl,
      instagram: payload.instagram,
      facebook: payload.facebook,
      tiktok: payload.tiktok,
    }),
  });

  if (!res.ok) {
    let message = 'Failed to save general settings';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function saveOpeningHours(payload: SaveOpeningHoursPayload) {
  const res = await fetch('/api/owner/settings/opening-hours', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to save opening hours';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}