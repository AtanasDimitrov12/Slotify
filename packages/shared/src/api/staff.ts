import { apiFetch } from './http';

export type CreateStaffPayload = {
  name: string;
  email: string;
  password?: string;
};

export type StaffProfileResponse = {
  id: string;
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

export type AvailableStaffListItem = {
  userId: string;
  name: string;
  email: string;
  photoUrl?: string;
};

export type OnboardStaffResponse = {
  message: string;
  account: {
    userId: string;
    membershipId: string;
    staffProfileId: string;
    tenantId: string;
    role: string;
    name: string;
    email: string;
  };
};

export async function createStaff(payload: CreateStaffPayload): Promise<OnboardStaffResponse> {
  return apiFetch<OnboardStaffResponse>('/staff/onboard', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAvailableStaffForOwner(): Promise<AvailableStaffListItem[]> {
  return apiFetch<AvailableStaffListItem[]>('/staff/available', {
    method: 'GET',
  });
}

export type StaffListItem = {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  expertiseTags: string[];
  isBookable: boolean;
  isActive: boolean;
};

export async function listStaff(): Promise<StaffListItem[]> {
  return apiFetch<StaffListItem[]>('/staff', {
    method: 'GET',
  });
}

export async function getMyStaffProfile(): Promise<StaffProfileResponse> {
  return apiFetch('/staff/me/profile', {
    method: 'GET',
  });
}

export async function updateMyStaffProfile(
  payload: UpdateMyStaffProfilePayload,
): Promise<StaffProfileResponse> {
  return apiFetch('/staff/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
