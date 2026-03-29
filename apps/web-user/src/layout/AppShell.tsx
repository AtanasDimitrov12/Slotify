import {
  CloseRounded,
  HomeRounded,
  LoginRounded,
  LogoutRounded,
  MenuRounded,
  PersonAddRounded,
  StorefrontRounded,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
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
    () => [
      { label: 'Home', to: '/', icon: <HomeRounded fontSize="small" /> },
      { label: 'Salons', to: '/salons', icon: <StorefrontRounded fontSize="small" /> },
    ],
    [],
  );

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
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
                        border: `1px solid ${alpha(shellColors.purple, 0.2)}`,
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
                        USER
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
                    Find and book your next appointment
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
                <>
                  <Typography
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontWeight: 800,
                      fontSize: 14,
                      color: shellColors.textSoft,
                      mr: 1,
                    }}
                  >
                    Hi, {user.name}
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 999,
                      height: 44,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 900,
                      color: shellColors.textSoft,
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => go('/login')}
                    sx={{
                      borderRadius: 999,
                      height: 44,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 900,
                      color: shellColors.textSoft,
                      display: { xs: 'none', sm: 'inline-flex' },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => go('/register')}
                    sx={{
                      borderRadius: 999,
                      height: 44,
                      px: 2.4,
                      textTransform: 'none',
                      fontWeight: 900,
                      borderColor: shellColors.purple,
                      color: shellColors.purple,
                      display: { xs: 'none', sm: 'inline-flex' },
                      '&:hover': {
                        borderColor: '#6B5CFA',
                        bgcolor: alpha(shellColors.purple, 0.04),
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              <Button
                variant="contained"
                onClick={() => go('/salons')}
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
              >
                Book Now
              </Button>

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
                User App
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

          <Divider sx={{ my: 1.5, borderColor: shellColors.drawerBorder }} />

          {user ? (
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 52,
                borderRadius: 4,
                mb: 0.8,
                color: shellColors.textSoft,
                '&:hover': { bgcolor: alpha('#ef4444', 0.08), color: '#ef4444' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Logout (${user.name})`}
                primaryTypographyProps={{ fontWeight: 850, fontSize: 15 }}
              />
            </ListItemButton>
          ) : (
            <>
              <ListItemButton
                onClick={() => go('/login')}
                sx={{
                  minHeight: 52,
                  borderRadius: 4,
                  mb: 0.8,
                  color: shellColors.textSoft,
                  '&:hover': { bgcolor: shellColors.navHover },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                  <LoginRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Login"
                  primaryTypographyProps={{ fontWeight: 850, fontSize: 15 }}
                />
              </ListItemButton>
              <ListItemButton
                onClick={() => go('/register')}
                sx={{
                  minHeight: 52,
                  borderRadius: 4,
                  mb: 0.8,
                  color: shellColors.purple,
                  bgcolor: alpha(shellColors.purple, 0.05),
                  '&:hover': { bgcolor: alpha(shellColors.purple, 0.1) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                  <PersonAddRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Up"
                  primaryTypographyProps={{ fontWeight: 850, fontSize: 15 }}
                />
              </ListItemButton>
            </>
          )}
        </List>

        <Box sx={{ px: 2, pb: 2, pt: 0.5, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => go('/salons')}
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
            Book Now
          </Button>
        </Box>
      </Drawer>

      <Outlet />
    </Box>
  );
}
