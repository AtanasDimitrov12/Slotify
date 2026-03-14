import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

const drawerWidth = 264;

type NavItem = { label: string; to: string; icon: React.ReactNode };

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { label: 'Dashboard', to: '/staff/dashboard', icon: <DashboardRoundedIcon /> },
    { label: 'Profile', to: '/staff/profile', icon: <PersonRoundedIcon /> },
    { label: 'Availability', to: '/staff/availability', icon: <ScheduleRoundedIcon /> },
    { label: 'Time off', to: '/staff/time-off', icon: <BeachAccessRoundedIcon /> },
    { label: 'Services & prices', to: '/staff/services', icon: <LocalOfferRoundedIcon /> },
    {label: 'Booking rules', to: '/staff/booking-rules', icon: <TuneRoundedIcon /> },
  ];

  const sidebar = (
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
          const active =
            location.pathname === it.to ||
            (it.to.endsWith('/dashboard') && location.pathname === '/staff');

          return (
            <ListItemButton
              key={it.to}
              selected={active}
              onClick={() => navigate(it.to)}
              sx={{ borderRadius: 2, mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <Drawer
        variant="permanent"
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: 'auto',
          },
        }}
      >
        {sidebar}
      </Drawer>

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}