import { type AvailableTenant, landingColors } from '@barber/shared';
import type { SvgIconComponent } from '@mui/icons-material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  keyframes,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export type NavItem = {
  label: string;
  to: string;
  icon: SvgIconComponent;
};

interface UnifiedSidebarProps {
  items: NavItem[];
  isActive: (to: string) => boolean;
  onNavigate: (to: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: 'admin' | 'owner' | 'staff';
  title: string;
  userName?: string;
  userEmail?: string;
  availableTenants?: AvailableTenant[];
  currentTenantId?: string;
  onSwitchTenant?: (tenantId: string) => void;
  onAddTenant?: () => void;
  onLogout?: () => void;
}

export default function UnifiedSidebar({
  items,
  isActive,
  onNavigate,
  collapsed,
  onToggleCollapse,
  userRole,
  title,
  userName,
  userEmail,
  availableTenants = [],
  currentTenantId,
  onSwitchTenant,
  onAddTenant,
  onLogout,
}: UnifiedSidebarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openSwitcher = Boolean(anchorEl);

  const handleOpenSwitcher = (event: React.MouseEvent<HTMLElement>) => {
    if (availableTenants.length > 0 || onAddTenant) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseSwitcher = () => {
    setAnchorEl(null);
  };

  const handleSwitch = (id: string) => {
    handleCloseSwitcher();
    onSwitchTenant?.(id);
  };

  const handleAdd = () => {
    handleCloseSwitcher();
    onAddTenant?.();
  };

  const currentTenant = availableTenants.find((t) => t._id === currentTenantId);

  const roleColor =
    userRole === 'admin'
      ? landingColors.purple
      : userRole === 'owner'
        ? landingColors.blue
        : landingColors.success;

  const displayName = userName || userEmail || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  const canSwitchTenants =
    userRole !== 'staff' && (availableTenants.length > 1 || (userRole === 'owner' && onAddTenant));

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: collapsed ? 88 : 280,
        position: 'relative',
      }}
    >
      {/* Header Area */}
      {userRole && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              p: collapsed ? 2.5 : 3,
              minHeight: 100,
              transition: 'padding 0.3s',
              overflow: 'hidden',
              cursor: canSwitchTenants ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: canSwitchTenants ? alpha('#FFFFFF', 0.5) : 'transparent',
              },
            }}
            onClick={canSwitchTenants ? handleOpenSwitcher : undefined}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  fontSize: 18,
                  fontWeight: 1000,
                  bgcolor: alpha(roleColor, 0.12),
                  color: roleColor,
                  border: `1px solid ${alpha(roleColor, 0.2)}`,
                  boxShadow: `0 8px 24px ${alpha(roleColor, 0.16)}`,
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>
              {canSwitchTenants && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#64748B',
                  }}
                >
                  <SwapHorizRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              )}
            </Box>

            {!collapsed && (
              <Box sx={{ minWidth: 0, flex: 1, animation: `${fadeIn} 0.3s ease-out` }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 1000,
                    letterSpacing: -0.4,
                    lineHeight: 1.1,
                    fontSize: 18,
                    color: '#0F172A',
                  }}
                >
                  {currentTenant?.name || title}
                </Typography>
                <Typography
                  noWrap
                  variant="body2"
                  sx={{ color: '#64748B', fontWeight: 700, mt: 0.4 }}
                >
                  {displayName}
                </Typography>
              </Box>
            )}
          </Stack>
          <Divider sx={{ mx: collapsed ? 1.5 : 2, borderColor: 'rgba(15,23,42,0.06)' }} />
        </>
      )}

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List sx={{ p: collapsed ? 1.5 : 2, pt: 2 }}>
          {/* Global items */}
          <ListItemButton
            selected={isActive('/')}
            onClick={() => onNavigate('/')}
            sx={{
              borderRadius: 3,
              mb: 1,
              px: collapsed ? 1.5 : 2,
              py: 1.25,
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha('#0F172A', 0.04),
                transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                color: isActive('/') ? roleColor : '#94A3B8',
                justifyContent: 'center',
              }}
            >
              <HomeRoundedIcon fontSize="medium" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Back to Home"
                primaryTypographyProps={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: isActive('/') ? roleColor : '#64748B',
                }}
              />
            )}
          </ListItemButton>

          <Divider sx={{ my: 2, opacity: 0.6 }} />

          {items.map((it) => {
            const active = isActive(it.to);
            const Icon = it.icon;

            const content = (
              <ListItemButton
                key={it.to}
                selected={active}
                onClick={() => onNavigate(it.to)}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  px: collapsed ? 1.5 : 2,
                  py: 1.5,
                  minHeight: 54,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  border: '1px solid',
                  borderColor: active ? alpha(roleColor, 0.12) : 'transparent',
                  bgcolor: active ? alpha(roleColor, 0.08) : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: active ? alpha(roleColor, 0.12) : alpha(roleColor, 0.04),
                    transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(roleColor, 0.08),
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: alpha(roleColor, 0.12),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: active ? roleColor : '#94A3B8',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                >
                  <Icon fontSize="medium" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 900 : 700,
                      fontSize: 15,
                      color: active ? roleColor : '#475569',
                      noWrap: true,
                    }}
                  />
                )}
              </ListItemButton>
            );

            if (collapsed) {
              return (
                <Tooltip key={it.to} title={it.label} placement="right" arrow>
                  {content}
                </Tooltip>
              );
            }

            return <React.Fragment key={it.to}>{content}</React.Fragment>;
          })}
        </List>
      </Box>

      {/* Footer Area */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          borderTop: '1px solid rgba(15,23,42,0.04)',
          bgcolor: alpha('#FFFFFF', 0.5),
        }}
      >
        {onLogout && !collapsed && (
          <Button
            variant="text"
            startIcon={<LogoutRoundedIcon />}
            onClick={onLogout}
            sx={{
              justifyContent: 'flex-start',
              color: '#64748B',
              fontWeight: 700,
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: alpha('#EF4444', 0.05), color: '#EF4444' },
            }}
          >
            Log out
          </Button>
        )}

        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0 4px 12px rgba(15,23,42,0.04)',
              color: '#64748B',
              zIndex: 10,
              '&:hover': {
                bgcolor: alpha(roleColor, 0.04),
                color: roleColor,
                borderColor: alpha(roleColor, 0.2),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
