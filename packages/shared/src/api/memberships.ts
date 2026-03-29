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
  const res = await fetch(`/api/memberships/tenant/${tenantId}`);
  if (!res.ok) throw new Error('Failed to load tenant memberships');
  return res.json();
}

export async function createMembership(payload: CreateMembershipPayload): Promise<Membership> {
  const res = await fetch('/api/memberships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create membership');
  return res.json();
}

export async function updateMembership(
  id: string,
  payload: UpdateMembershipPayload,
): Promise<Membership> {
  const res = await fetch(`/api/memberships/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update membership');
  return res.json();
}

// (Optional) if you later add DELETE endpoint
export async function deleteMembership(id: string): Promise<{ deleted: true; id: string }> {
  const res = await fetch(`/api/memberships/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete membership');
  return res.json();
}
