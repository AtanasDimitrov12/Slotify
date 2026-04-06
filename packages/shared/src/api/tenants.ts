import { apiFetch } from './http';

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

export type CreateTenantPayload = {
  name: string;
  slug: string;
  timezone: string;
  ownerEmail?: string;
  plan?: string;
  isPublished?: boolean;
};

export type UpdateTenantPayload = Partial<CreateTenantPayload> & {
  status?: Tenant['status'];
};

/* -------------------- ADMIN TENANTS -------------------- */

export async function listTenants(): Promise<Tenant[]> {
  return apiFetch<Tenant[]>('/admin/tenants', {
    method: 'GET',
  });
}

export async function updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
  return apiFetch<Tenant>(`/admin/tenants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTenant(id: string): Promise<void> {
  return apiFetch(`/admin/tenants/${id}`, {
    method: 'DELETE',
  });
}

/* -------------------- TENANT SELF-SERVICE -------------------- */

export async function getTenant(id: string): Promise<Tenant> {
  return apiFetch<Tenant>(`/tenants/${id}`, {
    method: 'GET',
  });
}

export async function getMyTenant(): Promise<Tenant> {
  return apiFetch<Tenant>('/tenants/me', {
    method: 'GET',
  });
}
