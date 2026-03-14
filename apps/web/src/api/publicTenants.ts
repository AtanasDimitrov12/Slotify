const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type OpeningTimeRange = {
  start: string;
  end: string;
};

export type WeeklyOpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', OpeningTimeRange[]>
>;

export type TenantAddress = {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

export type TenantDetails = {
  _id: string;
  tenantId: string;
  address?: TenantAddress;
  openingHours?: WeeklyOpeningHours;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone?: string;
  locale?: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  logoUrl?: string;
  coverImageUrl?: string;
  geo?: {
    lat?: number;
    lng?: number;
  };
  isPublished?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tenant = {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  isPublished: boolean;
  timezone: string;
  ownerEmail?: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicTenantListItem = {
  _id: string;
  name: string;
  slug: string;
  timezone: string;
  details?: TenantDetails | null;
};

export type PublicTenantResponse = {
  tenant: Tenant;
  details: TenantDetails | null;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Request failed';

    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // ignore
    }

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return res.json();
}

export async function listPublicTenants(): Promise<PublicTenantListItem[]> {
  const res = await fetch(`${API_BASE_URL}/public/tenants`);
  return handleResponse<PublicTenantListItem[]>(res);
}

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenantResponse> {
  const res = await fetch(`${API_BASE_URL}/public/tenants/${slug}`);
  return handleResponse<PublicTenantResponse>(res);
}