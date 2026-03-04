import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';

const drawerWidth = 264;

type NavItem = { label: string; to: string; icon: React.ReactNode };

export default function StaffLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { label: 'Dashboard', to: '/staff/dashboard', icon: <DashboardRoundedIcon /> },
    { label: 'Profile', to: '/staff/profile', icon: <PersonRoundedIcon /> },
    { label: 'Availability', to: '/staff/availability', icon: <ScheduleRoundedIcon /> },
    { label: 'Time off', to: '/staff/time-off', icon: <BeachAccessRoundedIcon /> },
    { label: 'Services & prices', to: '/staff/services', icon: <LocalOfferRoundedIcon /> },
  ];

  const drawer = (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          Staff Console
        </Typography>
        <Typography variant="h6" fontWeight={900}>
          My workspace
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Manage your profile & schedule
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {items.map((it) => {
          const active = location.pathname === it.to || (it.to.endsWith('/dashboard') && location.pathname === '/staff');
          return (
            <ListItemButton
              key={it.to}
              selected={active}
              onClick={() => {
                navigate(it.to);
                setOpen(false);
              }}
              sx={{ borderRadius: 2, mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ p: 2, opacity: 0.75 }}>
        <Typography variant="caption">Tip</Typography>
        <Typography variant="body2">
          Keep your availability updated so Slotify can generate accurate booking slots.
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} color="transparent">
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton onClick={() => setOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={900}>
            Slotify
          </Typography>
          <Box sx={{ flex: 1 }} />
          {/* Later: profile chip / salon name */}
        </Toolbar>
      </AppBar>

      <Toolbar />

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer open={open} onClose={() => setOpen(false)}>
          <Box sx={{ width: drawerWidth }}>{drawer}</Box>
        </Drawer>
      )}

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}