import { apiFetch } from './http';

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

export async function getOwnerSettings(): Promise<GeneralSettingsResponse> {
  return apiFetch('/owner/settings', {
    method: 'GET',
  });
}

export async function saveGeneralSettings(payload: SaveGeneralSettingsPayload) {
  return apiFetch('/owner/settings/general', {
    method: 'PUT',
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
}

export async function saveOpeningHours(payload: SaveOpeningHoursPayload) {
  return apiFetch('/owner/settings/opening-hours', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
