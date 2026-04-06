import { apiFetch } from './http';
import type { TenantAddress } from './types';

export type OpeningHoursDay = {
  // 0..6 (Sun..Sat) OR use 'mon'...'sun' if you prefer
  day: number;
  open: string; // "09:00"
  close: string; // "18:00"
  closed?: boolean;
};

export type TenantDetails = {
  _id: string;
  tenantId: string;

  // Contact / identity
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Location
  address?: TenantAddress;

  // Public profile (optional but useful)
  description?: string;
  websiteUrl?: string;
  instagramUrl?: string;

  // Hours
  openingHours?: OpeningHoursDay[];

  createdAt?: string;
  updatedAt?: string;
};

export type CreateTenantDetailsPayload = {
  tenantId: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: TenantAddress;
  description?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  openingHours?: OpeningHoursDay[];
};

export type UpdateTenantDetailsPayload = Partial<Omit<CreateTenantDetailsPayload, 'tenantId'>> & {
  tenantId?: never; // prevent accidental change
};

export async function getTenantDetailsByTenantId(tenantId: string): Promise<TenantDetails> {
  return apiFetch(`/tenant-details/${tenantId}`);
}

export async function createTenantDetails(
  payload: CreateTenantDetailsPayload,
): Promise<TenantDetails> {
  return apiFetch('/tenant-details', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  return apiFetch(`/tenant-details/${tenantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// Upsert is very convenient for FE profile screens
export async function upsertTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  return apiFetch(`/tenant-details/${tenantId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
