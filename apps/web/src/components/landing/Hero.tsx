import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useNavigate } from 'react-router-dom';
import { premium } from './constants';

export function Hero() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 18% 12%, rgba(124,108,255,0.08), transparent 26%),
          radial-gradient(circle at 82% 10%, rgba(125,211,252,0.08), transparent 22%),
          linear-gradient(180deg, #FBFCFF 0%, #F6F8FC 58%, #F7F8FC 100%)
        `,
        color: '#0F172A',
        borderBottom: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 90%)',
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          maxWidth: premium.maxWidth,
          px: premium.sectionPx,
          py: { xs: 10, md: 14 },
        }}
      >
        <Stack
          spacing={{ xs: 2.5, md: 3 }}
          alignItems="center"
          textAlign="center"
          sx={{
            maxWidth: 1180,
            mx: 'auto',
          }}
        >
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ color: '#6B5CFA !important' }} />}
            label="Slotify OS — modern reservations for salons"
            sx={{
              height: 40,
              px: 0.9,
              borderRadius: 999,
              fontWeight: 900,
              color: '#111827',
              bgcolor: 'rgba(15,23,42,0.04)',
              border: '1px solid rgba(15,23,42,0.08)',
              '& .MuiChip-label': {
                px: 0.8,
                letterSpacing: 0.2,
              },
            }}
          />

          <Typography
            sx={{
              fontWeight: 1000,
              letterSpacing: { xs: -2.2, md: -4.2 },
              lineHeight: 0.92,
              fontSize: { xs: 58, sm: 82, md: 152 },
              color: '#07112B',
            }}
          >
            SLOTIFY
          </Typography>

          <Stack spacing={0.5} sx={{ mt: { xs: -0.5, md: -1 } }}>
            <Typography
              sx={{
                fontWeight: 1000,
                letterSpacing: { xs: -1.4, md: -2.4 },
                lineHeight: 0.98,
                fontSize: { xs: 28, sm: 40, md: 68 },
                color: '#0F172A',
                maxWidth: 1200,
              }}
            >
              SMARTER BOOKING FOR SALONS
            </Typography>

            <Typography
              sx={{
                fontWeight: 1000,
                letterSpacing: { xs: -0.6, md: -1.4 },
                lineHeight: 1.02,
                fontSize: { xs: 24, sm: 34, md: 56 },
                color: '#94A3B8',
                maxWidth: 1200,
              }}
            >
              CLEANER SCHEDULES. BETTER FLOW.
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: '#64748B',
              fontSize: { xs: 16, md: 19 },
              lineHeight: 1.75,
              maxWidth: 760,
              mt: 1,
            }}
          >
            Slotify helps customers book faster and gives salons better control over availability,
            waitlists, and the flow of the day.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.6}
            sx={{ pt: 1.2 }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/salons')}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                minWidth: { xs: 240, sm: 280 },
                minHeight: 58,
                px: 3.2,
                borderRadius: 999,
                fontWeight: 900,
                fontSize: 15.5,
                letterSpacing: 0.3,
                textTransform: 'none',
                bgcolor: '#07112B',
                color: '#FFFFFF',
                boxShadow: '0 18px 40px rgba(7,17,43,0.14)',
                '&:hover': {
                  bgcolor: '#0B1637',
                },
              }}
            >
              Explore salons
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/partner')}
              sx={{
                minWidth: { xs: 240, sm: 240 },
                minHeight: 58,
                px: 3.2,
                borderRadius: 999,
                fontWeight: 900,
                fontSize: 15.5,
                letterSpacing: 0.3,
                textTransform: 'none',
                color: '#111827',
                borderColor: 'rgba(15,23,42,0.10)',
                bgcolor: 'rgba(255,255,255,0.74)',
                '&:hover': {
                  borderColor: 'rgba(15,23,42,0.16)',
                  bgcolor: 'rgba(255,255,255,0.96)',
                },
              }}
            >
              For partners
            </Button>
          </Stack>

          <Typography
            sx={{
              color: '#A0AEC0',
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: 1.1,
              textTransform: 'uppercase',
              pt: 0.8,
            }}
          >
            Live availability • Waitlist ready • Built for modern businesses
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}