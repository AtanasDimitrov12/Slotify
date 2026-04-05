import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import type * as React from 'react';
import { landingColors } from '../../landing/constants';

interface SuccessStepProps {
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onClose }) => {
  return (
    <Stack spacing={4} alignItems="center" sx={{ py: 4, textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(landingColors.success, 0.1),
          display: 'grid',
          placeItems: 'center',
          color: landingColors.success,
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 900, fontSize: 28, color: '#0F172A' }}>
          Booking Confirmed!
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontWeight: 500, mt: 1 }}>
          We've sent a confirmation to your email.
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={onClose}
        sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 800, bgcolor: landingColors.purple }}
      >
        Done
      </Button>
    </Stack>
  );
};
