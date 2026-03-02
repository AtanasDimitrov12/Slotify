import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as AuthApi from '../api/auth';
import type { Tenant } from '../api/tenants';

type LoginResult =
  | { kind: 'pickTenant'; tenants: Array<Pick<Tenant, '_id' | 'name'>> }
  | { kind: 'loggedIn'; account: AuthApi.AuthUser };

type AuthState = {
  user: AuthApi.AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<LoginResult>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthApi.AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    AuthApi.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      login: async (email, password, tenantId) => {
        const res = await AuthApi.login(email, password, tenantId);

        // multi-tenant -> choose
        if (res?.tenants?.length) {
          return {
            kind: 'pickTenant',
            tenants: res.tenants.map((t: any) => ({ _id: String(t._id), name: t.name })),
          };
        }

        // normal login
        if (!res?.accessToken || !res?.account) {
          throw new Error('Login failed: Invalid response from server.');
        }

        localStorage.setItem('accessToken', res.accessToken);
        setUser(res.account);

        return { kind: 'loggedIn', account: res.account };
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}