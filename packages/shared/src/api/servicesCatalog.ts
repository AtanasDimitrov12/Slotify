import { apiFetch } from './http';

export type CatalogServiceItem = {
  id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

function mapService(raw: any): CatalogServiceItem {
  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    durationMin: raw.durationMin,
    priceEUR: raw.priceEUR,
    description: raw.description ?? '',
  };
}

export type CatalogServicePayload = {
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

export async function extractServicesFromAI(file: File): Promise<CatalogServicePayload[]> {
  const formData = new FormData();
  formData.append('file', file);

  const data: unknown = await apiFetch('/services/extract-ai', {
    method: 'POST',
    body: formData,
  });

  if (
    !data ||
    typeof data !== 'object' ||
    !Array.isArray((data as { services?: unknown }).services)
  ) {
    throw new Error('Invalid AI extraction response');
  }

  return (data as { services: CatalogServicePayload[] }).services;
}

export async function createBulkCatalogServices(
  payloads: CatalogServicePayload[],
): Promise<CatalogServiceItem[]> {
  const data = await apiFetch<any[]>('/services/bulk', {
    method: 'POST',
    body: JSON.stringify(payloads),
  });

  return (data ?? []).map(mapService);
}

export async function getCatalogServices(): Promise<CatalogServiceItem[]> {
  const data = await apiFetch<any[]>('/services/catalog', {
    method: 'GET',
  });

  return (data ?? []).map(mapService);
}

export async function createCatalogService(payload: {
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
}): Promise<CatalogServiceItem> {
  const data = await apiFetch<any>('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapService(data);
}

export async function updateCatalogService(
  id: string,
  payload: {
    name?: string;
    durationMin?: number;
    priceEUR?: number;
    description?: string;
  },
): Promise<CatalogServiceItem> {
  const data = await apiFetch<any>(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapService(data);
}

export async function deleteCatalogService(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/services/${id}`, {
    method: 'DELETE',
  });
}
