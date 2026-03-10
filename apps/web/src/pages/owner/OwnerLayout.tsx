import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
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
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';

const drawerWidth = 264;

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
  { label: 'Business settings', to: '/owner/settings', icon: <SettingsRoundedIcon /> },
];

  const drawer = (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          Salon Console
        </Typography>
        <Typography variant="h6" fontWeight={800}>
          Owner
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Manage your salon
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {items.map((it) => {
          const active =
            location.pathname === it.to ||
            (it.to.endsWith('/overview') && location.pathname === '/owner');

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

      
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 68px)' }}>
      {isDesktop ? (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {drawer}
        </Box>
      ) : (
        <>
          <Box sx={{ p: 2, pb: 0 }}>
            <IconButton onClick={() => setOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          </Box>

          <Drawer open={open} onClose={() => setOpen(false)}>
            <Box sx={{ width: drawerWidth }}>{drawer}</Box>
          </Drawer>
        </>
      )}

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}