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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Request failed';

    try {
      const errorBody = await res.json();
      message = errorBody?.message ?? message;
    } catch {
      // ignore json parse failure
    }

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return res.json();
}

/* -------------------- ADMIN TENANTS -------------------- */

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Tenant[]>(res);
}


export async function updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<Tenant>(res);
}

export async function deleteTenant(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to delete tenant';

    try {
      const errorBody = await res.json();
      message = errorBody?.message ?? message;
    } catch {
      // ignore
    }

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
}

/* -------------------- TENANT SELF-SERVICE -------------------- */

export async function getTenant(id: string): Promise<Tenant> {
  const res = await fetch(`${API_BASE_URL}/tenants/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Tenant>(res);
}

export async function getMyTenant(): Promise<Tenant> {
  const res = await fetch(`${API_BASE_URL}/tenants/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<Tenant>(res);
}