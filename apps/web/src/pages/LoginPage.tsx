import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import type { Tenant } from '../api/tenants';
import type { Membership } from '../api/memberships';

function routeForRole(role?: string) {
  switch (role) {
    case 'owner':
      return '/partner/dashboard';
    case 'manager':
      return '/partner/dashboard';
    case 'staff':
      return '/partner/dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

type LoginResult =
  | { accessToken: string; account: { role?: string } }
  | { tenants: Array<Partial<Tenant> & { _id: string; name?: string }> };

function isTenantPickResult(result: any): result is { tenants: Array<any> } {
  return result && Array.isArray(result.tenants);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tenants, setTenants] = useState<Array<Partial<Tenant> & { _id: string; name?: string }> | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  const handleLogin = async (tenantId?: string) => {
    setError(null);
    setSubmitting(true);

    try {
      const result = await login(email.trim(), password, tenantId);

      if (result.kind === 'pickTenant') {
        setTenants(result.tenants);
        return;
      }

      navigate(routeForRole(result.account.role), { replace: true });

      // If API returns multiple memberships -> user must pick tenant
      if (isTenantPickResult(result)) {
        const list = (result.tenants ?? [])
          .filter((t: any) => t && t._id)
          .map((t: any) => ({ _id: String(t._id), name: t.name }));

        if (list.length === 0) {
          setError('No tenants found for this account.');
          setTenants(null);
          return;
        }

        setTenants(list);
        return;
      }

      // Normal login -> navigate by role
      const role = result?.account?.role;
      navigate(routeForRole(role), { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleLogin();
  };

  const onSelectTenant = (tenant: { _id: string }) => {
    void handleLogin(tenant._id);
  };

  const onBackToCredentials = () => {
    setTenants(null);
    setError(null);
  };

  // ----------------------------
  // Tenant pick screen
  // ----------------------------
  if (tenants) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={900}>
                  Select a tenant
                </Typography>
                <Typography color="text.secondary" fontWeight={600}>
                  This account has access to multiple tenants.
                </Typography>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}

              <Stack spacing={1.25}>
                {tenants.map((tenant) => (
                  <Button
                    key={tenant._id}
                    variant="outlined"
                    onClick={() => onSelectTenant(tenant)}
                    disabled={submitting}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2, py: 1.2, fontWeight: 800 }}
                  >
                    {tenant.name ?? tenant._id}
                  </Button>
                ))}
              </Stack>

              <Button
                variant="text"
                onClick={onBackToCredentials}
                disabled={submitting}
                sx={{ borderRadius: 999, height: 44, fontWeight: 900 }}
              >
                Back
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ----------------------------
  // Credentials screen
  // ----------------------------
  return (
    <Box sx={{ py: { xs: 5, md: 8 } }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={1000} letterSpacing={-0.6}>
                  Partner login
                </Typography>
                <Typography color="text.secondary" fontWeight={600}>
                  Sign in with your tenant account.
                </Typography>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    fullWidth
                    required
                  />

                  <TextField
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!canSubmit}
                    sx={{ borderRadius: 999, height: 44, fontWeight: 900 }}
                  >
                    {submitting ? 'Signing in…' : 'Login'}
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => navigate('/partner')}
                    sx={{ borderRadius: 999, height: 44, fontWeight: 900 }}
                  >
                    Back to partners page
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}