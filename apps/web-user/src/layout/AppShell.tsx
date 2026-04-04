import { useAuth } from '@barber/shared';
import {
  AccountCircleRounded,
  CalendarMonthRounded,
  CloseRounded,
  ExitToAppRounded,
  HomeRounded,
  LoginRounded,
  LogoutRounded,
  MenuRounded,
  PersonAddRounded,
  SettingsRounded,
  StorefrontRounded,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const shellColors = {
  pageBg: '#F7F8FC',
  pageBg2: '#EEF2FF',
  navBg: 'rgba(255,255,255,0.85)',
  navBorder: 'rgba(15,23,42,0.06)',
  navHover: 'rgba(15,23,42,0.04)',
  text: '#111827',
  textSoft: '#475569',
  textMuted: '#64748B',
  purple: '#7C6CFF',
  white: '#FFFFFF',
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorOpen] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorOpen(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorOpen(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
    handleMenuClose();
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: shellColors.pageBg }}>
      <AppBar
        elevation={0}
        position="sticky"
        sx={{
          bgcolor: shellColors.navBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${shellColors.navBorder}`,
          color: shellColors.text,
        }}
      >
        <Toolbar sx={{ height: 74 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* LOGO */}
            <ButtonBase
              onClick={() => go('/')}
              sx={{ borderRadius: 2, px: 1, py: 0.5, gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: '#10162B',
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                S
              </Box>
              <Typography sx={{ fontWeight: 1000, fontSize: 22, letterSpacing: -0.5 }}>
                Slotify
              </Typography>
            </ButtonBase>

            {/* DESKTOP NAV */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <NavButton active={isActive('/')} onClick={() => go('/')} icon={<HomeRounded fontSize="small" />}>Home</NavButton>
              <NavButton active={isActive('/salons')} onClick={() => go('/salons')} icon={<StorefrontRounded fontSize="small" />}>Salons</NavButton>
            </Stack>

            {/* ACTIONS */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {user ? (
                <>
                  <Button
                    onClick={handleMenuOpen}
                    sx={{
                      textTransform: 'none',
                      color: shellColors.text,
                      fontWeight: 800,
                      borderRadius: 99,
                      pl: 0.5,
                      pr: 2,
                      py: 0.5,
                      bgcolor: alpha(shellColors.purple, 0.05),
                      '&:hover': { bgcolor: alpha(shellColors.purple, 0.1) },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: 14,
                        fontWeight: 800,
                        bgcolor: shellColors.purple,
                      }}
                    >
                      {user.name?.[0]}
                    </Avatar>
                    {user.name?.split(' ')[0] || 'User'}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        width: 220,
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: `1px solid ${shellColors.navBorder}`,
                        p: 1,
                      },
                    }}
                  >
                    <Typography sx={{ px: 2, py: 1, fontSize: 12, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Account
                    </Typography>
                    <UserMenuItem icon={<AccountCircleRounded fontSize="small" />} onClick={() => go('/profile')}>Profile</UserMenuItem>
                    <UserMenuItem icon={<CalendarMonthRounded fontSize="small" />} onClick={() => go('/profile')}>My Bookings</UserMenuItem>
                    <Divider sx={{ my: 1, opacity: 0.5 }} />
                    <UserMenuItem icon={<LogoutRounded fontSize="small" />} onClick={handleLogout} color="#ef4444">Logout</UserMenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => go('/login')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      color: shellColors.textSoft,
                      px: 2,
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => go('/register')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 900,
                      bgcolor: shellColors.purple,
                      borderRadius: 99,
                      px: 3,
                      boxShadow: `0 8px 24px ${alpha(shellColors.purple, 0.3)}`,
                      '&:hover': { bgcolor: '#6B5CFA' },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              <IconButton
                sx={{ display: { xs: 'flex', md: 'none' }, border: `1px solid ${shellColors.navBorder}` }}
                onClick={() => setMobileOpen(true)}
              >
                <MenuRounded />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 20 }}>Menu</Typography>
          <IconButton onClick={() => setMobileOpen(false)}><CloseRounded /></IconButton>
        </Box>
        <List spacing={1}>
          <MobileNavItem active={isActive('/')} icon={<HomeRounded />} label="Home" onClick={() => go('/')} />
          <MobileNavItem active={isActive('/salons')} icon={<StorefrontRounded />} label="Salons" onClick={() => go('/salons')} />
          {user && <MobileNavItem active={isActive('/profile')} icon={<AccountCircleRounded />} label="Profile" onClick={() => go('/profile')} />}
        </List>
        <Box sx={{ mt: 'auto', pt: 2 }}>
          {user ? (
            <Button
              fullWidth
              startIcon={<ExitToAppRounded />}
              onClick={handleLogout}
              sx={{ color: '#ef4444', fontWeight: 800, textTransform: 'none' }}
            >
              Logout
            </Button>
          ) : (
            <Stack spacing={1.5}>
              <Button fullWidth variant="outlined" onClick={() => go('/login')} sx={{ borderRadius: 99, fontWeight: 800, textTransform: 'none' }}>Login</Button>
              <Button fullWidth variant="contained" onClick={() => go('/register')} sx={{ borderRadius: 99, fontWeight: 800, textTransform: 'none', bgcolor: shellColors.purple }}>Sign Up</Button>
            </Stack>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

function NavButton({ children, active, onClick, icon }: { children: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <Button
      startIcon={icon}
      onClick={onClick}
      sx={{
        textTransform: 'none',
        fontWeight: 850,
        px: 2,
        borderRadius: 99,
        color: active ? shellColors.purple : shellColors.textSoft,
        bgcolor: active ? alpha(shellColors.purple, 0.08) : 'transparent',
        '&:hover': { bgcolor: alpha(shellColors.purple, 0.04) },
      }}
    >
      {children}
    </Button>
  );
}

function UserMenuItem({ children, icon, onClick, color }: { children: string; icon: React.ReactNode; onClick: () => void; color?: string }) {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        borderRadius: 2,
        fontWeight: 700,
        fontSize: 14,
        color: color || shellColors.textSoft,
        gap: 1.5,
        my: 0.5,
        '&:hover': { bgcolor: alpha(shellColors.purple, 0.05) },
      }}
    >
      <Box sx={{ display: 'flex', color: 'inherit' }}>{icon}</Box>
      {children}
    </MenuItem>
  );
}

function MobileNavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 1,
        bgcolor: active ? alpha(shellColors.purple, 0.08) : 'transparent',
        color: active ? shellColors.purple : 'inherit',
      }}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 800 }} />
    </ListItemButton>
  );
}
