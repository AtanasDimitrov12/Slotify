import { landingColors } from '@barber/shared';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { type AdminNavItem, AdminSidebar } from './AdminSidebar';

const drawerWidth = 280;

export default function AdminLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const items: AdminNavItem[] = [
    { label: 'System overview', to: '/admin/overview', icon: <DashboardRoundedIcon /> },
    { label: 'Tenants', to: '/admin/tenants', icon: <StorefrontRoundedIcon /> },
  ];

  const isActive = (to: string) =>
    location.pathname === to || location.pathname === to.replace(/\/$/, '');

  const onNavigate = (to: string) => {
    navigate(to);
    setOpen(false);
  };

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
              aria-label="Open admin menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontWeight: 1000, fontSize: 20, letterSpacing: -0.8, color: '#0F172A' }}
            >
              Admin Console
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              Slotify Platform Operations
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
              position: 'sticky',
              top: 148,
              height: 'calc(100vh - 148px)',
              borderRight: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              bgcolor: alpha('#FFFFFF', 0.4),
              backdropFilter: 'blur(10px)',
            }}
          >
            <AdminSidebar items={items} isActive={isActive} onNavigate={onNavigate} />
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
            <AdminSidebar items={items} isActive={isActive} onNavigate={onNavigate} />
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
