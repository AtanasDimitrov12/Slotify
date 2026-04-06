import { apiFetch } from './http';

export type MembershipRole = 'owner' | 'admin' | 'staff';

export type Membership = {
  _id: string;
  tenantId: string;
  name: string;
  email: string;

  // never returned as raw password; backend stores hashed password
  isMain: boolean;
  isActive: boolean;
  role: MembershipRole;

  lastLoginAt?: string;
  emailVerified?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateMembershipPayload = {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  isMain?: boolean;
  role?: MembershipRole;
};

export type UpdateMembershipPayload = Partial<{
  name: string;
  password: string;
  isMain: boolean;
  isActive: boolean;
  role: MembershipRole;
  emailVerified: boolean;
}>;

export async function listMemberships(tenantId: string): Promise<Membership[]> {
  return apiFetch(`/memberships/tenant/${tenantId}`);
}

export async function createMembership(payload: CreateMembershipPayload): Promise<Membership> {
  return apiFetch('/memberships', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMembership(
  id: string,
  payload: UpdateMembershipPayload,
): Promise<Membership> {
  return apiFetch(`/memberships/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// (Optional) if you later add DELETE endpoint
export async function deleteMembership(id: string): Promise<{ deleted: true; id: string }> {
  return apiFetch<{ deleted: true; id: string }>(`/memberships/${id}`, { method: 'DELETE' });
}
