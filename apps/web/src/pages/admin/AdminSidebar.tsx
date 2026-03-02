import * as React from 'react';
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

export type AdminNavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

type Props = {
  items: AdminNavItem[];
  isActive: (to: string) => boolean;
  onNavigate: (to: string) => void;
};

export function AdminSidebar({ items, isActive, onNavigate }: Props) {
  return (
    <Box
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: alpha('#FFFFFF', 0.72),
        backdropFilter: 'blur(14px)',
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ p: 2 }}>
        <Avatar
          sx={(theme) => ({
            width: 34,
            height: 34,
            fontSize: 14,
            fontWeight: 900,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          })}
        >
          S
        </Avatar>

        <Box>
          <Typography fontWeight={1000} letterSpacing={-0.4} sx={{ lineHeight: 1.1 }}>
            Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={650}>
            Slotify platform control
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <List sx={{ p: 1.25 }}>
        {items.map((it) => {
          const active = isActive(it.to);

          return (
            <ListItemButton
              key={it.to}
              selected={active}
              onClick={() => onNavigate(it.to)}
              sx={(theme) => ({
                borderRadius: 2.5,
                mb: 1,
                px: 1.4,
                py: 1.1,
                border: '1px solid',
                borderColor: active ? alpha(theme.palette.primary.main, 0.25) : alpha('#000', 0.06),
                bgcolor: active ? alpha(theme.palette.primary.main, 0.10) : alpha('#FFF', 0.6),
                transition: 'transform .15s ease, background-color .15s ease, border-color .15s ease',
                '&:hover': {
                  bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.06),
                  borderColor: active ? alpha(theme.palette.primary.main, 0.30) : alpha(theme.palette.primary.main, 0.18),
                  transform: 'translateY(-1px)',
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 42, color: active ? 'primary.main' : 'text.secondary' }}>
                {it.icon}
              </ListItemIcon>
              <ListItemText primary={it.label} primaryTypographyProps={{ fontWeight: 900 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ p: 1.5 }}>
        <Box
          sx={(theme) => ({
            p: 1.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#000', 0.08),
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          })}
        >
          <Typography variant="body2" fontWeight={900}>
            Tip
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={650}>
            Later: audits, billing, support tools, tenant impersonation.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}