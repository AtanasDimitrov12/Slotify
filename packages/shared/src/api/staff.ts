import { apiFetch } from './http';

export type CreateStaffPayload = {
  name: string;
  email: string;
  password?: string;
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

export type AvailableStaffListItem = {
  userId: string;
  name: string;
  email: string;
  photoUrl?: string;
};

export async function createStaff(payload: CreateStaffPayload) {
  return apiFetch('/staff/onboard', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAvailableStaffForOwner(): Promise<AvailableStaffListItem[]> {
  return apiFetch('/staff/available', {
    method: 'GET',
  });
}

export async function getOtherProfileSync(): Promise<Partial<StaffProfileResponse>> {
  return apiFetch('/staff/me/sync-profile', {
    method: 'GET',
  });
}

export async function getOtherAvailabilitySync(): Promise<any> {
  return apiFetch('/staff/me/sync-availability', {
    method: 'GET',
  });
}

export async function listStaff() {
  return apiFetch('/staff', {
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
