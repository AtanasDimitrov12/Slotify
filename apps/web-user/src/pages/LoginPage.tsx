import { landingColors, premium, useAuth, useToast } from '@barber/shared';
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

function getErrorMessage(error: unknown): string {
  const fallback = 'We could not sign you in. Please check your details and try again.';

  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      message?: unknown;
      response?: { message?: unknown };
    };

    const message = maybeError.response?.message || maybeError.message;

    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.length > 0) return String(message[0]);
  }

  return fallback;
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

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !submitting;
  }, [email, password, submitting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await login(email.trim().toLowerCase(), password);

      if (result.kind === 'loggedIn') {
        navigate('/', { replace: true });
      } else {
        // This shouldn't happen for customers usually as they don't have multiple tenants,
        // but if they do (e.g. if they are also internal users), the shared login handles it.
        // For now, we assume simple customer login.
        showError('Unexpected login state. Please try again.');
      }
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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
                Welcome back
              </Typography>
              <Typography sx={{ color: landingColors.muted, fontWeight: 600, fontSize: 16 }}>
                Sign in to manage your appointments and profile.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleLogin}>
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
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Button>

                <Button
                  variant="text"
                  onClick={() => navigate('/register')}
                  sx={{ color: landingColors.muted, fontWeight: 800 }}
                >
                  Don't have an account? Create one
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
