const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function buildUrl(path: string) {
  // If the path starts with /api/, remove it as the backend doesn't have it
  let cleanPath = path.startsWith('/api/') ? path.slice(4) : path;

  // Also handle /api (without trailing slash)
  if (cleanPath === '/api' || cleanPath === 'api') {
    cleanPath = '/';
  } else if (cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.slice(3);
  }

  // Ensure cleanPath starts with a slash for consistent joining
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // If API_BASE has a trailing slash, remove it to avoid doubles
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

  return `${base}${cleanPath}`;
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const isFormData = init.body instanceof FormData;

  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // for 204
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getApiUrl(path: string) {
  return buildUrl(path);
}
