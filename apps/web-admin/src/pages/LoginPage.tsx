import { landingColors, premium, type Tenant, useAuth, useToast } from '@barber/shared';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function routeForRole(role?: string) {
  switch (role) {
    case 'owner':
      return '/owner';
    case 'staff':
      return '/staff';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

function getErrorMessage(error: unknown): string {
  const fallback = 'We could not sign you in. Please check your details and try again.';

  if (!error) return fallback;

  if (typeof error === 'string') {
    return mapFriendlyError(error);
  }

  if (error instanceof Error) {
    return mapFriendlyError(error.message);
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      message?: unknown;
      error?: unknown;
      statusCode?: unknown;
      response?: {
        message?: unknown;
        error?: unknown;
        statusCode?: unknown;
      };
    };

    if (typeof maybeError.response?.message === 'string') {
      return mapFriendlyError(maybeError.response.message);
    }

    if (Array.isArray(maybeError.response?.message) && maybeError.response.message.length > 0) {
      return mapFriendlyError(String(maybeError.response.message[0]));
    }

    if (typeof maybeError.message === 'string') {
      return mapFriendlyError(maybeError.message);
    }

    if (Array.isArray(maybeError.message) && maybeError.message.length > 0) {
      return mapFriendlyError(String(maybeError.message[0]));
    }
  }

  return fallback;
}

function mapFriendlyError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('password must be longer than or equal to 8 characters') ||
    normalized.includes('password must be longer than or equal to')
  ) {
    return 'Your password must be at least 8 characters long.';
  }

  if (
    normalized.includes('invalid credentials') ||
    normalized.includes('unauthorized') ||
    normalized.includes('invalid email or password')
  ) {
    return 'Incorrect email or password.';
  }

  if (normalized.includes('user not found')) {
    return 'We could not find an account with that email.';
  }

  if (normalized.includes('too many requests')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.';
  }

  if (normalized.includes('network error') || normalized.includes('failed to fetch')) {
    return 'Unable to connect right now. Please check your internet connection and try again.';
  }

  return 'We could not sign you in. Please check your details and try again.';
}

function PageWrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: landingColors.bg,
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 15% 15%, rgba(124,108,255,0.12), transparent 26%),
            radial-gradient(circle at 85% 85%, rgba(125,211,252,0.10), transparent 22%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} alignItems="center">
          <Button
            onClick={onBack}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              color: landingColors.muted,
              fontWeight: 800,
              fontSize: 14,
              '&:hover': { color: landingColors.text, bgcolor: alpha(landingColors.white, 0.05) },
            }}
          >
            Back to home
          </Button>

          {children}

          <Typography
            sx={{ color: landingColors.muted, fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}
          >
            SLOTIFY OS — MODERN RESERVATIONS FOR SALONS
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tenants, setTenants] = useState<Array<
    Partial<Tenant> & { _id: string; name?: string }
  > | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  const handleLogin = async (tenantId?: string) => {
    setSubmitting(true);

    try {
      const result = await login(email.trim().toLowerCase(), password, tenantId);

      if (result.kind === 'pickTenant') {
        setTenants(result.tenants);
        return;
      }

      navigate(routeForRole(result.account.role), { replace: true });
    } catch (err: unknown) {
      showError(getErrorMessage(err));
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
  };

  if (tenants) {
    return (
      <PageWrapper onBack={() => navigate('/')}>
        <Card
          sx={{
            width: '100%',
            borderRadius: `${premium.rXl * 4}px`,
            bgcolor: landingColors.bgSoft2,
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: premium.cardShadow,
            color: landingColors.text,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography
                  sx={{ fontWeight: 1000, fontSize: 32, letterSpacing: -1, lineHeight: 1.1 }}
                >
                  Select a salon
                </Typography>
                <Typography sx={{ color: landingColors.muted, fontWeight: 600, fontSize: 16 }}>
                  This account has access to multiple locations.
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {tenants.map((tenant) => (
                  <Button
                    key={tenant._id}
                    variant="outlined"
                    fullWidth
                    onClick={() => onSelectTenant(tenant)}
                    disabled={submitting}
                  >
                    {tenant.name ?? tenant._id}
                  </Button>
                ))}
              </Stack>

              <Button variant="text" onClick={onBackToCredentials} disabled={submitting}>
                Go back to login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper onBack={() => navigate('/')}>
      <Card
        sx={{
          width: '100%',
          borderRadius: `${premium.rXl * 4}px`,
          bgcolor: landingColors.bgSoft2,
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: premium.cardShadow,
          color: landingColors.text,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography
                sx={{ fontWeight: 1000, fontSize: 40, letterSpacing: -1.5, lineHeight: 1 }}
              >
                Partner login
              </Typography>
              <Typography sx={{ color: landingColors.muted, fontWeight: 600, fontSize: 16 }}>
                Manage your salon availability and bookings.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  fullWidth
                  required
                  variant="filled"
                  sx={{
                    '& .MuiFilledInput-root': {
                      bgcolor: alpha(landingColors.white, 0.04),
                      borderRadius: 3,
                      color: landingColors.text,
                      '&:before, &:after': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'rgba(255,255,255,0.12)',
                      '&.Mui-focused': { borderColor: landingColors.purple },
                    },
                    '& .MuiInputLabel-root': { color: landingColors.muted },
                  }}
                />

                <TextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  required
                  variant="filled"
                  sx={{
                    '& .MuiFilledInput-root': {
                      bgcolor: alpha(landingColors.white, 0.04),
                      borderRadius: 3,
                      color: landingColors.text,
                      '&:before, &:after': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'rgba(255,255,255,0.12)',
                      '&.Mui-focused': { borderColor: landingColors.purple },
                    },
                    '& .MuiInputLabel-root': { color: landingColors.muted },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit}
                  endIcon={!submitting && <LoginRoundedIcon />}
                  sx={{
                    minHeight: 56,
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 900,
                    bgcolor: landingColors.purple,
                    boxShadow: '0 16px 40px rgba(124,108,255,0.32)',
                    '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.1)' },
                  }}
                >
                  {submitting ? 'Authenticating...' : 'Sign in'}
                </Button>

                <Button
                  variant="text"
                  onClick={() => navigate('/partner')}
                  sx={{ color: landingColors.muted, fontWeight: 800 }}
                >
                  Not a partner yet? Learn more
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
