import { landingColors, useAuth } from '@barber/shared';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UnifiedSidebar, { type NavItem } from '../../layout/UnifiedSidebar';

export default function AdminLayout() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const items: NavItem[] = [
    { label: 'Dashboard', to: '/admin', icon: DashboardRoundedIcon },
    { label: 'Tenants', to: '/admin/tenants', icon: StorefrontRoundedIcon },
  ];

  const isActive = (to: string) =>
    location.pathname === to || location.pathname === to.replace(/\/$/, '');

  const onNavigate = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  const currentDrawerWidth = collapsed && isDesktop ? 88 : 280;

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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? `${currentDrawerWidth}px 1fr` : '1fr',
          transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isDesktop ? (
          <Box
            sx={{
              position: 'sticky',
              top: 74,
              height: 'calc(100vh - 74px)',
              borderRight: '1px solid',
              borderColor: 'rgba(15,23,42,0.06)',
              bgcolor: alpha('#FFFFFF', 0.4),
              backdropFilter: 'blur(10px)',
              zIndex: (theme) => theme.zIndex.appBar - 1,
            }}
          >
            <UnifiedSidebar
              items={items}
              isActive={isActive}
              onNavigate={onNavigate}
              collapsed={collapsed}
              onToggleCollapse={handleToggleCollapse}
              role="admin"
              title="Admin Console"
              userName={user?.name}
              userEmail={user?.email}
            />
          </Box>
        ) : (
          <>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1100,
                width: 56,
                height: 56,
                bgcolor: landingColors.purple,
                color: 'white',
                boxShadow: `0 12px 24px ${alpha(landingColors.purple, 0.4)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: landingColors.purple,
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 16px 32px ${alpha(landingColors.purple, 0.5)}`,
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Drawer
              anchor="left"
              open={open}
              onClose={() => setOpen(false)}
              PaperProps={{
                sx: {
                  width: 280,
                  borderTopRightRadius: 32,
                  borderBottomRightRadius: 32,
                  overflow: 'hidden',
                  bgcolor: alpha('#FFFFFF', 0.95),
                  backdropFilter: 'blur(20px)',
                },
              }}
            >
              <UnifiedSidebar
                items={items}
                isActive={isActive}
                onNavigate={onNavigate}
                collapsed={false}
                onToggleCollapse={() => {}}
                role="admin"
                title="Admin Console"
                userName={user?.name}
                userEmail={user?.email}
              />
            </Drawer>
          </>
        )}

        <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, minWidth: 0 }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
