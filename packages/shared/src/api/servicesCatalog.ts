export type CatalogServiceItem = {
  id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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

  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch('/api/services/extract-ai', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = 'Failed to extract services';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  const data: unknown = await res.json();

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
  const res = await fetch('/api/services/bulk', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payloads),
  });

  if (!res.ok) {
    let message = 'Failed to create services';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await res.json();
  return (data ?? []).map(mapService);
}

export async function getCatalogServices(): Promise<CatalogServiceItem[]> {
  const res = await fetch('/api/services/catalog', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to load service catalog';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await res.json();
  return (data ?? []).map(mapService);
}

export async function createCatalogService(payload: {
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
}): Promise<CatalogServiceItem> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to create service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return mapService(await res.json());
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
  const res = await fetch(`/api/services/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Failed to update service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return mapService(await res.json());
}

export async function deleteCatalogService(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = 'Failed to delete service';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
