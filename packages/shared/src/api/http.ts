const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // for 204
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
