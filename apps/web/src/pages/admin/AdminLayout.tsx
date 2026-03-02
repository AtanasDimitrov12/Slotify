import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { alpha } from '@mui/material/styles';

import { AdminSidebar, type AdminNavItem } from './AdminSidebar';

const drawerWidth = 264;

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

  const isActive = (to: string) => location.pathname === to || location.pathname === to.replace(/\/$/, '');

  const onNavigate = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        bgcolor: '#F6F8FC',
        backgroundImage: `
          radial-gradient(900px 480px at 18% -10%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 60%),
          radial-gradient(900px 520px at 110% 0%, ${alpha('#7C3AED', 0.12)} 0%, transparent 55%),
          linear-gradient(180deg, ${alpha('#FFFFFF', 1)} 0%, ${alpha('#F6F8FC', 1)} 60%)
        `,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha('#FFFFFF', 0.75),
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: alpha('#000', 0.08),
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          {!isDesktop && (
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                mr: 1.2,
                border: '1px solid',
                borderColor: alpha('#000', 0.10),
                bgcolor: alpha('#FFF', 0.8),
                '&:hover': { bgcolor: '#FFF' },
              }}
              aria-label="Open admin menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={1000} letterSpacing={-0.4}>
              Admin Console
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              Platform operations & tenants
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? `${drawerWidth}px 1fr` : '1fr' }}>
        {isDesktop ? (
          <Box
            sx={{
              position: 'sticky',
              top: 64,
              height: 'calc(100vh - 64px - 68px)',
              borderRight: '1px solid',
              borderColor: alpha('#000', 0.08),
              bgcolor: alpha('#FFFFFF', 0.55),
              backdropFilter: 'blur(14px)',
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
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                overflow: 'hidden',
                bgcolor: alpha('#FFFFFF', 0.92),
              },
            }}
          >
            <AdminSidebar items={items} isActive={isActive} onNavigate={onNavigate} />
          </Drawer>
        )}

        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 3 } }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}