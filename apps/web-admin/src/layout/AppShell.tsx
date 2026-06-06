import { type AvailableTenant, getMyTenants, useAuth, useToast } from '@barber/shared';
import { ArrowForwardIosRounded, MenuRounded } from '@mui/icons-material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UnifiedSidebar, { type NavItem } from './UnifiedSidebar';

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, switchTenant } = useAuth();
  const { showSuccess, showError } = useToast();

  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const [availableTenants, setAvailableTenants] = React.useState<AvailableTenant[]>([]);

  React.useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'staff')) {
      getMyTenants()
        .then((tenants) => {
          const mapped: AvailableTenant[] = tenants
            .filter((t): t is { _id: string; name: string; slug?: string } => !!t._id && !!t.name)
            .map((t) => ({ _id: t._id, name: t.name, slug: t.slug }));
          setAvailableTenants(mapped);
        })
        .catch((err) => console.error('Failed to fetch tenants', err));
    } else {
      setAvailableTenants([]);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/', { replace: true });
  };

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      showSuccess('Switched salon successfully');
      window.location.reload();
    } catch (_err) {
      showError('Failed to switch salon');
    }
  };

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const consoleItems = useMemo<NavItem[]>(() => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', to: '/admin', icon: DashboardRoundedIcon },
        { label: 'Tenants', to: '/admin/tenants', icon: StorefrontRoundedIcon },
        { label: 'Backlog', to: '/admin/tickets', icon: AssignmentRoundedIcon },
        { label: 'System Quality', to: '/admin/quality', icon: InsightsRoundedIcon },
      ];
    }
    if (user.role === 'owner') {
      return [
        { label: 'Overview', to: '/owner/overview', icon: DashboardRoundedIcon },
        { label: 'Team', to: '/owner/team', icon: GroupsRoundedIcon },
        { label: 'Services', to: '/owner/services', icon: ContentCutRoundedIcon },
        { label: 'Booking rules', to: '/owner/booking-rules', icon: EventAvailableRoundedIcon },
        { label: 'Business settings', to: '/owner/settings', icon: SettingsRoundedIcon },
      ];
    }
    if (user.role === 'staff') {
      return [
        { label: 'Dashboard', to: '/staff/dashboard', icon: DashboardRoundedIcon },
        { label: 'Schedule', to: '/staff/schedule', icon: ScheduleRoundedIcon },
        { label: 'Profile', to: '/staff/profile', icon: PersonRoundedIcon },
        { label: 'Availability', to: '/staff/availability', icon: ScheduleRoundedIcon },
        { label: 'Time off', to: '/staff/time-off', icon: BeachAccessRoundedIcon },
        { label: 'Blocked slots', to: '/staff/blocked-slots', icon: BlockRoundedIcon },
        { label: 'Services & prices', to: '/staff/services', icon: LocalOfferRoundedIcon },
        { label: 'Booking rules', to: '/staff/booking-rules', icon: TuneRoundedIcon },
      ];
    }
    return [];
  }, [user]);

  const sidebarTitle =
    user?.role === 'admin'
      ? 'Admin Console'
      : user?.role === 'owner'
        ? 'Salon Console'
        : 'Staff Console';

  const showSidebar = user && consoleItems.length > 0;
  const currentDrawerWidth = showSidebar && isDesktop ? (collapsed ? 88 : 280) : 0;

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
              maxWidth: 1400,
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

            <Stack direction="row" spacing={1} alignItems="center">
              {user ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  <Typography
                    sx={{ color: shellColors.textSoft, fontWeight: 800, fontSize: 13, mr: 1 }}
                  >
                    {user.email}
                  </Typography>
                  {!showSidebar && (
                    <Button
                      variant="outlined"
                      onClick={handleLogout}
                      sx={{
                        borderRadius: 999,
                        height: 40,
                        px: 2.5,
                        textTransform: 'none',
                        fontWeight: 850,
                        color: shellColors.text,
                        borderColor: shellColors.navBorder,
                      }}
                    >
                      Logout
                    </Button>
                  )}
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
                    '&:hover': { bgcolor: '#6B5CFA' },
                  }}
                  endIcon={<ArrowForwardIosRounded sx={{ fontSize: 16 }} />}
                >
                  Login
                </Button>
              )}

              <IconButton
                sx={{
                  display: { xs: 'inline-flex', md: showSidebar ? 'none' : 'inline-flex' },
                  width: 42,
                  height: 42,
                  color: shellColors.text,
                  border: `1px solid ${shellColors.navBorder}`,
                  bgcolor: 'rgba(255,255,255,0.72)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.90)' },
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

      <Box
        sx={{
          display: 'flex',
          minHeight: 'calc(100vh - 74px)',
        }}
      >
        {showSidebar && isDesktop && (
          <Box
            sx={{
              width: currentDrawerWidth,
              flexShrink: 0,
              position: 'sticky',
              top: 74,
              height: 'calc(100vh - 74px)',
              borderRight: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              bgcolor: alpha('#FFFFFF', 0.4),
              backdropFilter: 'blur(10px)',
              zIndex: (theme) => theme.zIndex.drawer,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
          >
            <UnifiedSidebar
              items={consoleItems}
              isActive={isActive}
              onNavigate={go}
              collapsed={collapsed}
              onToggleCollapse={handleToggleCollapse}
              userRole={user?.role as any}
              title={sidebarTitle}
              userName={user?.name}
              userEmail={user?.email}
              availableTenants={availableTenants}
              currentTenantId={user?.tenantId}
              onSwitchTenant={handleSwitchTenant}
              onAddTenant={user?.role === 'owner' ? () => go('/owner/settings') : undefined}
              onLogout={user ? handleLogout : undefined}
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: shellColors.drawerBg,
            color: shellColors.text,
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ pt: '74px', height: '100%', boxSizing: 'border-box' }}>
          <UnifiedSidebar
            items={consoleItems}
            isActive={isActive}
            onNavigate={go}
            collapsed={false}
            onToggleCollapse={() => {}}
            userRole={user?.role as any}
            title={sidebarTitle}
            userName={user?.name}
            userEmail={user?.email}
            availableTenants={availableTenants}
            currentTenantId={user?.tenantId}
            onSwitchTenant={handleSwitchTenant}
            onAddTenant={user?.role === 'owner' ? () => go('/owner/settings') : undefined}
            onLogout={user ? handleLogout : undefined}
          />
        </Box>
      </Drawer>
    </Box>
  );
}
