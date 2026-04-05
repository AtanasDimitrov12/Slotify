import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { alpha, Box, IconButton, Stack, Typography } from '@mui/material';
import type * as React from 'react';
import { landingColors } from '../../landing/constants';
import { STEP_SUCCESS } from './utils';

const STEPS = [
  { label: 'Service', icon: ContentCutRoundedIcon },
  { label: 'Time', icon: EventAvailableRoundedIcon },
  { label: 'Details', icon: PersonRoundedIcon },
  { label: 'Review', icon: CheckCircleRoundedIcon },
];

interface HeaderProps {
  salonName: string;
  step: number;
  onClose: () => void;
}

/**
 * Modern Compact Header Accent
 * Balanced for ratio and readability.
 */
export const Header: React.FC<HeaderProps> = ({ salonName, step, onClose }) => {
  const isSuccess = step === STEP_SUCCESS;

  return (
    <Box
      sx={{
        bgcolor: '#10162B',
        color: '#FFF',
        pt: { xs: 2, sm: 2.5 },
        pb: isSuccess ? 2.5 : 3.5,
        px: { xs: 3, sm: 4 },
        backgroundImage: `radial-gradient(circle at 2% 2%, rgba(124,108,255,0.15), transparent 40%)`,
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 18, sm: 22 },
                letterSpacing: -0.8,
                color: '#FFF',
                lineHeight: 1.1,
              }}
            >
              {salonName}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mt: 0.5,
              }}
            >
              Booking Concierge
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              '&:hover': { color: '#FFF', bgcolor: 'rgba(255,255,255,0.05)' },
              p: 1,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 900, mr: 0.5 }}>CLOSE</Typography>
          </IconButton>
        </Box>

        {!isSuccess && (
          <Box>
            {/* Minimalist Progress Line */}
            <Box
              sx={{
                position: 'relative',
                height: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
                mb: 2.5,
                mx: 1,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  bgcolor: landingColors.purple,
                  borderRadius: 1,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: `${((step + 1) / 4) * 100}%`,
                  boxShadow: `0 0 10px ${landingColors.purple}`,
                }}
              />
            </Box>

            {/* Restored Elite Step Indicators */}
            <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5 }}>
              {STEPS.map((s, idx) => {
                const active = step >= idx;
                const current = step === idx;
                const Icon = s.icon;

                return (
                  <Stack
                    key={s.label}
                    alignItems="center"
                    spacing={0.75}
                    sx={{
                      opacity: active ? 1 : 0.2,
                      transition: 'all 0.4s ease',
                      transform: current ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        color: active ? landingColors.purple : '#FFF',
                        display: 'flex',
                        bgcolor: active ? alpha(landingColors.purple, 0.1) : 'transparent',
                        p: 0.5,
                        borderRadius: 1.5,
                        transition: 'all 0.3s',
                      }}
                    >
                      <Icon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 8.5,
                        fontWeight: 1000,
                        textTransform: 'uppercase',
                        color: active ? '#FFF' : 'rgba(255,255,255,0.5)',
                        letterSpacing: 0.8,
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
