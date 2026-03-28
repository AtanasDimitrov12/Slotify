import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowForwardIosRounded,
  CloseRounded,
  LoginRounded,
  LogoutRounded,
  MenuRounded,
  HomeRounded,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@barber/shared';

type NavItem = {
  label: string;
  to: string;
  icon?: ReactNode;
};

const shellColors = {
  pageBg: '#F7F8FC',
  pageBg2: '#EEF2FF',
  navBg: 'rgba(255,255,255,0.72)',
  navBorder: 'rgba(15,23,42,0.08)',
  navHover: 'rgba(15,23,42,0.04)',
  navActive: 'rgba(124,108,255,0.10)',
  text: '#111827',
  textSoft: '#475569',
  textMuted: '#64748B',
  purple: '#7C6CFF',
  purpleSoft: '#A79BFF',
  blue: '#7DD3FC',
  white: '#FFFFFF',
  drawerBg: '#FFFFFF',
  drawerBorder: 'rgba(15,23,42,0.08)',
  cardBg: 'rgba(255,255,255,0.72)',
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems: NavItem[] = useMemo(
    () => [{ label: 'Home', to: '/', icon: <HomeRounded fontSize="small" /> }],
    [],
  );

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/', { replace: true });
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const getUserHomePath = () => {
    if (!user) return '/login';

    const role = user.role;

    if (role === 'staff') return '/staff';
    if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';

    return '/';
  };

  const handleUserHomeClick = () => {
    go(getUserHomePath());
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: shellColors.pageBg,
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(124,108,255,0.08), transparent 22%),
          radial-gradient(circle at 100% 0%, rgba(125,211,252,0.08), transparent 18%),
          linear-gradient(180deg, ${shellColors.pageBg2} 0%, ${shellColors.pageBg} 28%, ${shellColors.pageBg} 100%)
        `,
      }}
    >
      <AppBar
        elevation={0}
        position="sticky"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: shellColors.navBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${shellColors.navBorder}`,
          boxShadow: '0 10px 30px rgba(15,23,42,0.04)',
          color: shellColors.text,
        }}
      >
        <Toolbar sx={{ minHeight: 74 }}>
          <Container
            maxWidth={false}
            sx={{
              maxWidth: 1280,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ flex: 1, minWidth: 0 }}
            >
              <ButtonBase
                onClick={() => go('/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  borderRadius: 999,
                  px: 1.1,
                  py: 0.7,
                  minWidth: 0,
                  transition: 'background-color 160ms ease, transform 160ms ease',
                  '&:hover': {
                    bgcolor: shellColors.navHover,
                    transform: 'translateY(-1px)',
                  },
                }}
                aria-label="Go to home"
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#10162B',
                    color: shellColors.white,
                    fontWeight: 1000,
                    fontSize: 19,
                    letterSpacing: -1,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.16)',
                    flex: '0 0 auto',
                  }}
                >
                  S
                </Box>

                <Stack spacing={0.15} sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Typography
                      noWrap
                      sx={{
                        fontWeight: 1000,
                        letterSpacing: -0.9,
                        color: shellColors.text,
                        lineHeight: 1,
                        fontSize: 22,
                      }}
                    >
                      Slotify
                    </Typography>

                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.22,
                        borderRadius: 999,
                        bgcolor: alpha(shellColors.purple, 0.12),
                        border: `1px solid ${alpha(shellColors.purple, 0.20)}`,
                        display: { xs: 'none', sm: 'inline-flex' },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 900,
                          color: '#5B4DDB',
                          letterSpacing: 0.8,
                          lineHeight: 1,
                        }}
                      >
                        OS
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    noWrap
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      color: shellColors.textMuted,
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      lineHeight: 1,
                    }}
                  >
                    Smart reservations for modern salons
                  </Typography>
                </Stack>
              </ButtonBase>
            </Stack>

            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {navItems.map((item) => {
                const active = isActive(item.to);

                return (
                  <Button
                    key={item.to}
                    onClick={() => go(item.to)}
                    startIcon={item.icon}
                    sx={{
                      minHeight: 42,
                      px: 1.7,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 850,
                      color: active ? shellColors.text : shellColors.textSoft,
                      bgcolor: active ? shellColors.navActive : 'transparent',
                      border: active
                        ? `1px solid ${alpha(shellColors.purple, 0.18)}`
                        : '1px solid transparent',
                      '&:hover': {
                        bgcolor: shellColors.navHover,
                        color: shellColors.text,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={user.email}
                    size="small"
                    onClick={handleUserHomeClick}
                    clickable
                    sx={{
                      display: { xs: 'none', md: 'inline-flex' },
                      height: 34,
                      borderRadius: 999,
                      color: shellColors.textSoft,
                      bgcolor: 'rgba(255,255,255,0.70)',
                      border: `1px solid ${shellColors.navBorder}`,
                      cursor: 'pointer',
                      '& .MuiChip-label': {
                        px: 1.2,
                        fontWeight: 800,
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.90)',
                      },
                    }}
                  />

                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    startIcon={<LogoutRounded />}
                    sx={{
                      borderRadius: 999,
                      height: 42,
                      px: 2.1,
                      display: { xs: 'none', md: 'inline-flex' },
                      textTransform: 'none',
                      fontWeight: 850,
                      color: shellColors.text,
                      borderColor: shellColors.navBorder,
                      bgcolor: 'rgba(255,255,255,0.64)',
                      '&:hover': {
                        borderColor: alpha('#0F172A', 0.16),
                        bgcolor: 'rgba(255,255,255,0.88)',
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => go('/login')}
                  sx={{
                    borderRadius: 999,
                    height: 44,
                    px: 2.4,
                    display: { xs: 'none', md: 'inline-flex' },
                    textTransform: 'none',
                    fontWeight: 900,
                    bgcolor: shellColors.purple,
                    color: shellColors.white,
                    boxShadow: '0 14px 32px rgba(124,108,255,0.22)',
                    '&:hover': {
                      bgcolor: '#6B5CFA',
                    },
                  }}
                  endIcon={<ArrowForwardIosRounded sx={{ fontSize: 16 }} />}
                >
                  Login
                </Button>
              )}

              <IconButton
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  width: 42,
                  height: 42,
                  color: shellColors.text,
                  border: `1px solid ${shellColors.navBorder}`,
                  bgcolor: 'rgba(255,255,255,0.72)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.90)',
                  },
                }}
                aria-label="open menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuRounded />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            bgcolor: shellColors.drawerBg,
            color: shellColors.text,
            borderLeft: `1px solid ${shellColors.drawerBorder}`,
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            backgroundImage: `
              radial-gradient(circle at 20% 10%, rgba(124,108,255,0.07), transparent 24%),
              radial-gradient(circle at 100% 100%, rgba(125,211,252,0.06), transparent 22%)
            `,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#10162B',
                color: shellColors.white,
                fontWeight: 1000,
                fontSize: 18,
                letterSpacing: -1,
                boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
              }}
            >
              S
            </Box>

            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 1000,
                  letterSpacing: -0.8,
                  color: shellColors.text,
                  fontSize: 22,
                  lineHeight: 1,
                }}
              >
                Slotify
              </Typography>
              <Typography
                noWrap
                sx={{
                  color: shellColors.textMuted,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                Smart reservations
              </Typography>
            </Stack>
          </Stack>

          <IconButton
            aria-label="close menu"
            onClick={() => setMobileOpen(false)}
            sx={{
              color: shellColors.text,
              border: `1px solid ${shellColors.navBorder}`,
              bgcolor: 'rgba(255,255,255,0.80)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.96)',
              },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: shellColors.drawerBorder }} />

        <List sx={{ p: 1.5 }}>
          {navItems.map((item) => {
            const active = isActive(item.to);

            return (
              <ListItemButton
                key={item.to}
                selected={active}
                onClick={() => go(item.to)}
                sx={{
                  minHeight: 52,
                  borderRadius: 4,
                  mb: 0.8,
                  color: active ? shellColors.text : shellColors.textSoft,
                  bgcolor: active ? alpha(shellColors.purple, 0.09) : 'transparent',
                  border: active
                    ? `1px solid ${alpha(shellColors.purple, 0.16)}`
                    : '1px solid transparent',
                  '&.Mui-selected': {
                    bgcolor: alpha(shellColors.purple, 0.09),
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: alpha(shellColors.purple, 0.13),
                  },
                  '&:hover': {
                    bgcolor: 'rgba(15,23,42,0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: active ? '#5B4DDB' : shellColors.textMuted,
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 850,
                    fontSize: 15,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ px: 2, pb: 2, pt: 0.5, mt: 'auto' }}>
          {user ? (
            <Stack spacing={1.2}>
              <Box
                onClick={handleUserHomeClick}
                sx={{
                  px: 1.5,
                  py: 1.3,
                  borderRadius: 4,
                  border: `1px solid ${shellColors.drawerBorder}`,
                  bgcolor: 'rgba(248,250,252,0.92)',
                  cursor: 'pointer',
                  transition: 'background-color 160ms ease, transform 160ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.98)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: shellColors.textMuted,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  Signed in as
                </Typography>
                <Typography
                  sx={{
                    mt: 0.4,
                    color: shellColors.text,
                    fontWeight: 850,
                    fontSize: 14.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {user.email}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutRounded />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 999,
                  height: 46,
                  textTransform: 'none',
                  fontWeight: 850,
                  color: shellColors.text,
                  borderColor: shellColors.navBorder,
                  bgcolor: 'rgba(255,255,255,0.76)',
                  '&:hover': {
                    borderColor: alpha('#0F172A', 0.16),
                    bgcolor: 'rgba(255,255,255,0.96)',
                  },
                }}
              >
                Logout
              </Button>
            </Stack>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<LoginRounded />}
              onClick={() => go('/login')}
              sx={{
                borderRadius: 999,
                height: 46,
                textTransform: 'none',
                fontWeight: 900,
                bgcolor: shellColors.purple,
                color: shellColors.white,
                boxShadow: '0 14px 32px rgba(124,108,255,0.22)',
                '&:hover': {
                  bgcolor: '#6B5CFA',
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>

      <Outlet />
    </Box>
  );
}