import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import { alpha, Box, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import type * as React from 'react';
import { landingColors } from '../../landing/constants';

interface DetailsStepProps {
  customerName: string;
  onNameChange: (val: string) => void;
  customerPhone: string;
  onPhoneChange: (val: string) => void;
  customerEmail: string;
  onEmailChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  isLoggedIn: boolean;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  customerName,
  onNameChange,
  customerPhone,
  onPhoneChange,
  customerEmail,
  onEmailChange,
  notes,
  onNotesChange,
  isLoggedIn,
}) => {
  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <Box>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 20,
            color: '#0F172A',
            letterSpacing: -0.5,
          }}
        >
          Contact Information
        </Typography>
        <Typography
          sx={{
            color: '#64748B',
            fontWeight: 500,
            fontSize: 13.5,
            lineHeight: 1.4,
            mt: 0.5,
          }}
        >
          Provide your details below to finalize your booking.
        </Typography>
      </Box>

      {isLoggedIn && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(landingColors.purple, 0.04),
            border: `1px solid ${alpha(landingColors.purple, 0.1)}`,
          }}
        >
          <AccountCircleRoundedIcon sx={{ color: landingColors.purple }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Pre-filled from your Slotify profile
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 8px 30px rgba(15,23,42,0.03)',
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            label="Full Name"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            required
            disabled={isLoggedIn}
            placeholder="e.g. John Doe"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: 'rgba(15,23,42,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(15,23,42,0.15) !important' },
                '&.Mui-focused fieldset': { borderColor: `${landingColors.purple} !important` },
              },
            }}
          />
          <TextField
            label="Phone Number"
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            fullWidth
            required
            placeholder="e.g. +31 6 12345678"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: 'rgba(15,23,42,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(15,23,42,0.15) !important' },
                '&.Mui-focused fieldset': { borderColor: `${landingColors.purple} !important` },
              },
            }}
          />
          <TextField
            label="Email Address"
            value={customerEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            fullWidth
            disabled={isLoggedIn}
            placeholder="e.g. john@example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: 'rgba(15,23,42,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(15,23,42,0.15) !important' },
                '&.Mui-focused fieldset': { borderColor: `${landingColors.purple} !important` },
              },
            }}
          />
          <TextField
            label="Special Requests (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Any details you'd like to share with the expert..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: 'rgba(15,23,42,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(15,23,42,0.15) !important' },
                '&.Mui-focused fieldset': { borderColor: `${landingColors.purple} !important` },
              },
            }}
          />
        </Stack>
      </Box>
    </Stack>
  );
};
