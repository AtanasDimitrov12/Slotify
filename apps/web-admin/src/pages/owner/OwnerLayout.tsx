import { getMyTenants, landingColors, useAuth, useToast } from '@barber/shared';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UnifiedSidebar, { type AvailableTenant, type NavItem } from '../../layout/UnifiedSidebar';

type TenantResponse = {
  _id?: string;
  name?: string;
  slug?: string;
};

export default function OwnerLayout() {
  const { user, switchTenant } = useAuth();
  const { showSuccess, showError } = useToast();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const [availableTenants, setAvailableTenants] = React.useState<AvailableTenant[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    getMyTenants()
      .then((tenants: TenantResponse[]) => {
        const mappedTenants: AvailableTenant[] = tenants
          .filter(
            (tenant): tenant is Required<Pick<TenantResponse, '_id' | 'name'>> & TenantResponse => {
              return typeof tenant._id === 'string' && typeof tenant.name === 'string';
            },
          )
          .map((tenant) => ({
            _id: tenant._id,
            name: tenant.name,
            slug: tenant.slug,
          }));

        setAvailableTenants(mappedTenants);
      })
      .catch((err) => {
        console.error('Failed to fetch tenants', err);
      });
  }, []);

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      showSuccess('Switched salon successfully');
      window.location.reload();
    } catch (err) {
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

  const items: NavItem[] = [
    { label: 'Overview', to: '/owner/overview', icon: DashboardRoundedIcon },
    { label: 'Team', to: '/owner/team', icon: GroupsRoundedIcon },
    { label: 'Services', to: '/owner/services', icon: ContentCutRoundedIcon },
    { label: 'Booking rules', to: '/owner/booking-rules', icon: EventAvailableRoundedIcon },
    { label: 'Business settings', to: '/owner/settings', icon: SettingsRoundedIcon },
  ];

  const isActive = (to: string) =>
    location.pathname === to ||
    (to.endsWith('/overview') &&
      (location.pathname === '/owner' || location.pathname === '/owner/'));

  const onNavigate = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  const currentDrawerWidth = collapsed && isDesktop ? 88 : 280;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 74px)',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(900px 480px at 18% -10%, ${alpha(landingColors.purple, 0.06)} 0%, transparent 60%),
          radial-gradient(900px 520px at 110% 0%, ${alpha(landingColors.blue, 0.05)} 0%, transparent 55%)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? `${currentDrawerWidth}px 1fr` : '1fr',
          transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flex: 1,
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
              userRole="owner"
              title="Salon Console"
              userName={user?.name}
              userEmail={user?.email}
              availableTenants={availableTenants}
              currentTenantId={user?.tenantId}
              onSwitchTenant={handleSwitchTenant}
              onAddTenant={() => navigate('/owner/settings')}
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
                userRole="owner"
                title="Salon Console"
                userName={user?.name}
                userEmail={user?.email}
                availableTenants={availableTenants}
                currentTenantId={user?.tenantId}
                onSwitchTenant={handleSwitchTenant}
                onAddTenant={() => navigate('/owner/settings')}
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
