import { apiFetch } from './http';
import type { TenantAddress } from './types';

export type OpeningTimeRange = {
  start: string;
  end: string;
};

export type WeeklyOpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', OpeningTimeRange[]>
>;

export type PublicTenantDetails = {
  tenantId: string;
  address?: TenantAddress;
  openingHours?: WeeklyOpeningHours;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone?: string;
  locale?: string;
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  logoUrl?: string;
  coverImageUrl?: string;
  notes?: string;
};

export type PublicTenant = {
  _id: string;
  name: string;
  slug: string;
  timezone?: string;
};

export type PublicTenantBySlugResponse = {
  tenant: PublicTenant;
  details?: PublicTenantDetails;
};

export type PublicTenantListItem = {
  _id: string;
  name: string;
  slug: string;
  timezone?: string;
  plan?: string;
  details?: PublicTenantDetails;
};

export type BookingOptionService = {
  _id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

export type BookingOptionStaffService = BookingOptionService & {
  originalServiceId: string;
};

export type BookingOptionStaff = {
  _id: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  expertise?: string[];
  experienceYears?: number;
  services: BookingOptionStaffService[];
};

export type BookingOptionsResponse = {
  tenant: {
    _id: string;
    name: string;
    slug: string;
  };
  details?: PublicTenantDetails;
  services: BookingOptionService[];
  staff: BookingOptionStaff[];
  maximumDaysInAdvance: number;
};

export type AvailabilitySlot = {
  staffId: string;
  startTime: string;
  endTime: string;
  score: number;
  businessScore?: number;
};

export type AvailabilityResponse = {
  slots: AvailabilitySlot[];
  nextAvailableDate: string | null;
};

export type CreateReservationPayload = {
  serviceId: string;
  staffId: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
};

export type CreatedReservationResponse = {
  _id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  startTime: string;
  endTime: string;
  tenant: {
    _id: string;
    name: string;
    slug: string;
  };
  staff: {
    _id: string;
    displayName: string;
  };
  service: {
    _id: string;
    name: string;
    durationMin: number;
    priceEUR: number;
  };
};

export async function listPublicTenants(): Promise<PublicTenantListItem[]> {
  return apiFetch<PublicTenantListItem[]>('/public/tenants');
}

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenantBySlugResponse> {
  return apiFetch<PublicTenantBySlugResponse>(`/public/tenants/${slug}`);
}

export async function getBookingOptions(slug: string): Promise<BookingOptionsResponse> {
  return apiFetch<BookingOptionsResponse>(`/public/tenants/${slug}/booking-options`);
}

export async function getAvailability(params: {
  slug: string;
  serviceId: string;
  date: string;
  staffId?: string;
}): Promise<AvailabilityResponse> {
  const search = new URLSearchParams({
    serviceId: params.serviceId,
    date: params.date,
  });

  if (params.staffId) {
    search.set('staffId', params.staffId);
  }

  return apiFetch<AvailabilityResponse>(
    `/public/tenants/${params.slug}/availability?${search.toString()}`,
  );
}

export async function createReservation(
  slug: string,
  payload: CreateReservationPayload,
): Promise<CreatedReservationResponse> {
  return apiFetch<CreatedReservationResponse>(`/public/tenants/${slug}/reservations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
