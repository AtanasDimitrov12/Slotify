import { apiFetch } from './http';

export type StaffServiceItem = {
  id: string;
  serviceId: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

export async function getMyStaffServices(): Promise<StaffServiceItem[]> {
  return apiFetch('/staff/me/services', {
    method: 'GET',
  });
}

export async function createMyStaffService(payload: {
  serviceId: string;
  durationMin?: number;
  priceEUR?: number;
}): Promise<StaffServiceItem> {
  return apiFetch('/staff/me/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMyStaffService(
  id: string,
  payload: { durationMin?: number; priceEUR?: number },
): Promise<StaffServiceItem> {
  return apiFetch(`/staff/me/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteMyStaffService(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/staff/me/services/${id}`, {
    method: 'DELETE',
  });
}
