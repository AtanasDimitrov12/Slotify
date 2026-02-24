import React, { useMemo, useState } from 'react';
import { ArrowForwardIosRounded, CloseRounded, MenuRounded } from '@mui/icons-material';
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

type NavItem = {
  label: string;
  to: string;
  kind?: 'primary';
};

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Home', to: '/' },
      { label: 'Explore', to: '/places', kind: 'primary' },
      { label: 'For partners', to: '/partner' },
      // keep login later if you want:
      // { label: 'Login (later)', to: '/login' },
    ],
    [],
  );

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        elevation={0}
        position="sticky"
        sx={{
          bgcolor: (t) => alpha(t.palette.background.paper, 0.72),
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: 68 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Brand -> Home */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <ButtonBase
                onClick={() => go('/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                  minWidth: 0,
                  '&:hover': { bgcolor: (t) => alpha(t.palette.text.primary, 0.06) },
                }}
                aria-label="Go to home"
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: 'primary.main',
                    fontWeight: 1000,
                    letterSpacing: -0.8,
                    flex: '0 0 auto',
                  }}
                >
                  S
                </Box>

                <Typography
                  noWrap
                  sx={{
                    fontWeight: 1000,
                    letterSpacing: -0.8,
                    color: 'text.primary',
                    lineHeight: 1,
                  }}
                >
                  Slotify
                </Typography>
              </ButtonBase>
            </Stack>

            {/* Desktop nav (ONE pair: Explore + For partners) */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button
                onClick={() => go('/places')}
                variant="text"
                sx={{
                  fontWeight: 800,
                  color: isActive('/places') ? 'text.primary' : 'text.secondary',
                }}
              >
                Explore
              </Button>

              <Button
                onClick={() => go('/partner')}
                variant="text"
                sx={{
                  fontWeight: 800,
                  color: isActive('/partner') ? 'text.primary' : 'text.secondary',
                }}
              >
                For partners
              </Button>
            </Stack>

            {/* Desktop action: keep ONLY ONE CTA (Explore) */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                onClick={() => go('/places')}
                sx={{
                  borderRadius: 999,
                  height: 40,
                  px: 2.2,
                  display: { xs: 'none', md: 'inline-flex' },
                }}
                endIcon={<ArrowForwardIosRounded />}
              >
                Login
              </Button>

              {/* Mobile menu */}
              <IconButton
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                aria-label="open menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuRounded />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                color: 'primary.main',
                fontWeight: 1000,
                letterSpacing: -0.8,
              }}
            >
              T
            </Box>
            <Typography noWrap sx={{ fontWeight: 1000, letterSpacing: -0.8 }}>
              Slotify
            </Typography>
          </Stack>

          <IconButton aria-label="close menu" onClick={() => setMobileOpen(false)}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ p: 1 }}>
          {navItems
            .filter((x) => x.label !== 'Explore') // we’ll show Explore as primary at the bottom
            .map((item) => (
              <ListItemButton
                key={item.to}
                selected={isActive(item.to)}
                onClick={() => go(item.to)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {/* simple dot indicator */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      bgcolor: isActive(item.to) ? 'primary.main' : 'divider',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 800 }}
                />
              </ListItemButton>
            ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => go('/places')}
            sx={{ borderRadius: 999, height: 44 }}
            endIcon={<ArrowForwardIosRounded />}
          >
            Explore
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => go('/partner')}
            sx={{ borderRadius: 999, height: 44, mt: 1 }}
          >
            For partners
          </Button>
        </Box>
      </Drawer>

      <Outlet />
    </Box>
  );
}