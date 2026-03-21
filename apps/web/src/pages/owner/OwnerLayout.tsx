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
  Avatar,
  Divider,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { alpha } from '@mui/material/styles';
import { landingColors, premium } from '../../components/landing/constants';

const drawerWidth = 280;

type NavItem = { label: string; to: string; icon: React.ReactNode };

export default function OwnerLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: NavItem[] = [
    { label: 'Overview', to: '/owner/overview', icon: <DashboardRoundedIcon /> },
    { label: 'Team', to: '/owner/team', icon: <GroupsRoundedIcon /> },
    { label: 'Services', to: '/owner/services', icon: <ContentCutRoundedIcon /> },
    { label: 'Booking rules', to: '/owner/booking-rules', icon: <EventAvailableRoundedIcon /> },
    { label: 'Business settings', to: '/owner/settings', icon: <SettingsRoundedIcon /> },
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
            border: `1px solid ${alpha(landingColors.purple, 0.20)}`,
            boxShadow: `0 8px 24px ${alpha(landingColors.purple, 0.16)}`,
          }}
        >
          O
        </Avatar>

        <Box>
          <Typography sx={{ fontWeight: 1000, letterSpacing: -0.4, lineHeight: 1, fontSize: 18, color: '#0F172A' }}>
            Salon Console
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, mt: 0.4 }}>
            Business Owner
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mx: 2, borderColor: 'rgba(15,23,42,0.04)' }} />

      <List sx={{ p: 2 }}>
        {items.map((it) => {
          const active =
            location.pathname === it.to ||
            (it.to.endsWith('/overview') && (location.pathname === '/owner' || location.pathname === '/owner/'));

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
                  bgcolor: active ? alpha(landingColors.purple, 0.12) : alpha(landingColors.purple, 0.04),
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
                {React.cloneElement(it.icon as React.ReactElement, { fontSize: 'medium' })}
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
              aria-label="Open management menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 1000, fontSize: 20, letterSpacing: -0.8, color: '#0F172A' }}>
              Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              Salon & Team Control
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? `${drawerWidth}px 1fr` : '1fr' }}>
        {isDesktop ? (
          <Box
            sx={{
              position: 'sticky',
              top: 148,
              height: 'calc(100vh - 148px)',
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