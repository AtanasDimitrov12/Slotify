import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Fade,
  Typography,
  Stack,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import CustomerInsightsCard from './CustomerInsightsCard';
import { type CustomerInsights } from '@barber/shared';

interface CustomerInsightsPopupProps {
  open: boolean;
  onClose: () => void;
  insights: CustomerInsights | null;
  loading?: boolean;
}

export default function CustomerInsightsPopup({
  open,
  onClose,
  insights,
  loading,
}: CustomerInsightsPopupProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 6,
          bgcolor: '#F8FAFC',
          backgroundImage: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1',
            }}
          >
            <ShieldRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#0F172A', letterSpacing: -0.5 }}>
            Customer DNA Profile
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748B',
            '&:hover': { bgcolor: 'rgba(15,23,42,0.05)', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#F8FAFC' }}>
        {insights ? (
          <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
            <CustomerInsightsCard insights={insights} />
          </Box>
        ) : loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
              Analyzing Customer DNA...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: '#EF4444', fontWeight: 600 }}>
              Failed to load insights.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Dialog>
  );
}
