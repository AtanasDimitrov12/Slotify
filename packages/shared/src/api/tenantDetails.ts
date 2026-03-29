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
  const res = await fetch(`/api/tenant-details/${tenantId}`);
  if (!res.ok) throw new Error('Failed to load tenant details');
  return res.json();
}

export async function createTenantDetails(
  payload: CreateTenantDetailsPayload,
): Promise<TenantDetails> {
  const res = await fetch('/api/tenant-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create tenant details');
  return res.json();
}

export async function updateTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  const res = await fetch(`/api/tenant-details/${tenantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update tenant details');
  return res.json();
}

// Upsert is very convenient for FE profile screens
export async function upsertTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  const res = await fetch(`/api/tenant-details/${tenantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to upsert tenant details');
  return res.json();
}
