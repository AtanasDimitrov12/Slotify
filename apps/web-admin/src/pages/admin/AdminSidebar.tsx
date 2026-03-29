import { landingColors } from '@barber/shared';
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
import * as React from 'react';

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
            Admin
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, mt: 0.4 }}>
            Slotify OS Control
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mx: 2, borderColor: 'rgba(15,23,42,0.04)' }} />

      <List sx={{ p: 2 }}>
        {items.map((it) => {
          const active = isActive(it.to);

          return (
            <ListItemButton
              key={it.to}
              selected={active}
              onClick={() => onNavigate(it.to)}
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
}
