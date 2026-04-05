import type { TenantAddress } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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

export async function listPublicTenants(): Promise<PublicTenantListItem[]> {
  const res = await fetch(`${API_BASE_URL}/public/tenants`);
  return parseJson<PublicTenantListItem[]>(res);
}

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenantBySlugResponse> {
  const res = await fetch(`${API_BASE_URL}/public/tenants/${slug}`);
  return parseJson<PublicTenantBySlugResponse>(res);
}

export async function getBookingOptions(slug: string): Promise<BookingOptionsResponse> {
  const res = await fetch(`${API_BASE_URL}/public/tenants/${slug}/booking-options`);
  return parseJson<BookingOptionsResponse>(res);
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

  const res = await fetch(
    `${API_BASE_URL}/public/tenants/${params.slug}/availability?${search.toString()}`,
  );

  return parseJson<AvailabilityResponse>(res);
}

export async function createReservation(
  slug: string,
  payload: CreateReservationPayload,
): Promise<CreatedReservationResponse> {
  const res = await fetch(`${API_BASE_URL}/public/tenants/${slug}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseJson<CreatedReservationResponse>(res);
}
