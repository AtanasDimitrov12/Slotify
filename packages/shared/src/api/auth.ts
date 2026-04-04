import { apiFetch } from './http';
import type { Membership } from './memberships';
import type { Tenant } from './tenants';

export type AuthUser = Partial<Membership> & {
  name: string;
  email: string;
  accountType: 'internal' | 'customer';
  phone?: string;
  role?: Membership['role'] | 'customer';
};

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

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  tenantName: string;
};

export type RegisterCustomerPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type RegisterResponse = {
  accessToken: string;
  account: AuthUser;
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

export async function register(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerCustomer(payload: RegisterCustomerPayload) {
  return apiFetch<RegisterResponse>('/auth/register-customer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
