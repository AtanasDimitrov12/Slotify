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
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

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
            location.pathname === it.to || (it.to.endsWith('/overview') && location.pathname === '/owner');
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
      <Box sx={{ p: 2, opacity: 0.7 }}>
        <Typography variant="caption">Tip</Typography>
        <Typography variant="body2">
          Later: services catalog, staff permissions, deposits, analytics exports.
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
          <Typography variant="h6" fontWeight={800}>
            Slotify
          </Typography>
          <Box sx={{ flex: 1 }} />
          {/* put tenant switcher / profile chip here later */}
        </Toolbar>
      </AppBar>

      {/* spacer for AppBar */}
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