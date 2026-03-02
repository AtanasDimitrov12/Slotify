import { apiFetch } from './http';
import type { Membership } from './memberships';
import type { Tenant } from './tenants';

export type AuthUser = Membership;

export type LoginResponse =
  | {
      accessToken: string;
      account: AuthUser;
      tenants?: never;
    }
  | {
      accessToken?: never;
      account?: never;
      tenants: Partial<Tenant>[];
    };

export async function login(email: string, password: string, tenantId?: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, tenantId }),
  });
}

export async function me() {
  return apiFetch<AuthUser>('/auth/me', { method: 'GET' });
}