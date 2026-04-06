import { landingColors } from '@barber/shared';
import type { SvgIconComponent } from '@mui/icons-material';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  AppBar,
  Avatar,
  Box,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 280;

type NavItem = { label: string; to: string; icon: SvgIconComponent };

export default function StaffLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { label: 'Dashboard', to: '/staff/dashboard', icon: DashboardRoundedIcon },
    { label: 'Schedule', to: '/staff/schedule', icon: ScheduleRoundedIcon },
    { label: 'Profile', to: '/staff/profile', icon: PersonRoundedIcon },
    { label: 'Availability', to: '/staff/availability', icon: ScheduleRoundedIcon },
    { label: 'Time off', to: '/staff/time-off', icon: BeachAccessRoundedIcon },
    { label: 'Services & prices', to: '/staff/services', icon: LocalOfferRoundedIcon },
    { label: 'Booking rules', to: '/staff/booking-rules', icon: TuneRoundedIcon },
  ];

  const sidebar = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 3 }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            fontSize: 18,
            fontWeight: 1000,
            bgcolor: alpha(landingColors.purple, 0.12),
            color: landingColors.purple,
            border: `1px solid ${alpha(landingColors.purple, 0.2)}`,
            boxShadow: `0 8px 24px ${alpha(landingColors.purple, 0.16)}`,
          }}
        >
          S
        </Avatar>

        <Box>
          <Typography
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.4,
              lineHeight: 1,
              fontSize: 18,
              color: '#0F172A',
            }}
          >
            Staff Console
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, mt: 0.4 }}>
            My Workspace
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mx: 2, borderColor: 'rgba(15,23,42,0.04)' }} />

      <List sx={{ p: 2 }}>
        {items.map((it) => {
          const active =
            location.pathname === it.to ||
            (it.to.endsWith('/dashboard') &&
              (location.pathname === '/staff' || location.pathname === '/staff/'));

          const Icon = it.icon;

          return (
            <ListItemButton
              key={it.to}
              selected={active}
              onClick={() => {
                navigate(it.to);
                setOpen(false);
              }}
              sx={{
                borderRadius: 4,
                mb: 1,
                px: 2,
                py: 1.5,
                border: '1px solid',
                borderColor: active ? alpha(landingColors.purple, 0.12) : 'transparent',
                bgcolor: active ? alpha(landingColors.purple, 0.08) : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: active
                    ? alpha(landingColors.purple, 0.12)
                    : alpha(landingColors.purple, 0.04),
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: alpha(landingColors.purple, 0.08),
                },
                '&.Mui-selected:hover': {
                  bgcolor: alpha(landingColors.purple, 0.12),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? landingColors.purple : '#94A3B8' }}>
                <Icon fontSize="medium" />
              </ListItemIcon>
              <ListItemText
                primary={it.label}
                primaryTypographyProps={{
                  fontWeight: active ? 900 : 700,
                  fontSize: 15,
                  color: active ? landingColors.purple : '#475569',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(900px 480px at 18% -10%, ${alpha(landingColors.purple, 0.06)} 0%, transparent 60%),
          radial-gradient(900px 520px at 110% 0%, ${alpha(landingColors.blue, 0.05)} 0%, transparent 55%)
        `,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: alpha('#FFFFFF', 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(15,23,42,0.06)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: 74, px: { xs: 2, md: 4 } }}>
          {!isDesktop && (
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                mr: 2,
                bgcolor: alpha(landingColors.purple, 0.08),
                color: landingColors.purple,
                '&:hover': { bgcolor: alpha(landingColors.purple, 0.12) },
              }}
              aria-label="Open staff menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontWeight: 1000, fontSize: 20, letterSpacing: -0.8, color: '#0F172A' }}
            >
              Barber Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              Personal Workspace
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{ display: 'grid', gridTemplateColumns: isDesktop ? `${drawerWidth}px 1fr` : '1fr' }}
      >
        {isDesktop ? (
          <Box
            sx={{
              borderRight: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              bgcolor: alpha('#FFFFFF', 0.4),
              backdropFilter: 'blur(10px)',
            }}
          >
            {sidebar}
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
              sx: {
                width: drawerWidth,
                borderTopRightRadius: 32,
                borderBottomRightRadius: 32,
                overflow: 'hidden',
                bgcolor: alpha('#FFFFFF', 0.95),
                backdropFilter: 'blur(20px)',
              },
            }}
          >
            {sidebar}
          </Drawer>
        )}

        <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
