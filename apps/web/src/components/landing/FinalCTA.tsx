import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import { landingColors, premium } from './constants';

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: premium.sectionPy,
        bgcolor: landingColors.bg,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <Box
          data-reveal="1"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: `${premium.rXl * 4}px`,
            p: { xs: 3, md: 5 },
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
            bgcolor: landingColors.bgSoft,
            boxShadow: premium.glowPurple,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(circle at 20% 20%, rgba(124,108,255,0.22), transparent 30%),
                radial-gradient(circle at 80% 80%, rgba(125,211,252,0.12), transparent 28%)
              `,
              pointerEvents: 'none',
            }}
          />

          <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={8}>
              <Stack spacing={1.3}>
                <Typography
                  sx={{
                    color: landingColors.text,
                    fontWeight: 1000,
                    letterSpacing: { xs: -1.2, md: -2.2 },
                    lineHeight: 0.96,
                    fontSize: { xs: 32, md: 56 },
                    maxWidth: 800,
                  }}
                >
                  Book better. Run smarter.
                </Typography>

                <Typography
                  sx={{
                    color: landingColors.mutedSoft,
                    fontSize: { xs: 15.5, md: 18 },
                    lineHeight: 1.72,
                    maxWidth: 680,
                  }}
                >
                  One modern platform for cleaner reservations, stronger partner control, and a better booking experience.
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack
                spacing={1.2}
                direction={{ xs: 'column', sm: 'row', md: 'column' }}
                sx={{ alignItems: { md: 'flex-end' } }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate('/salons')}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    minHeight: 52,
                    px: 2.6,
                    borderRadius: 999,
                    fontWeight: 900,
                    textTransform: 'none',
                    bgcolor: landingColors.purple,
                    color: landingColors.white,
                    width: { xs: '100%', sm: 'auto' },
                    boxShadow: '0 18px 44px rgba(124,108,255,0.30)',
                    '&:hover': { bgcolor: '#6B5CFA' },
                  }}
                >
                  Explore salons
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/partner')}
                  sx={{
                    minHeight: 52,
                    px: 2.6,
                    borderRadius: 999,
                    fontWeight: 900,
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    color: landingColors.text,
                    borderColor: 'rgba(255,255,255,0.12)',
                    bgcolor: alpha(landingColors.white, 0.03),
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.18)',
                      bgcolor: alpha(landingColors.white, 0.05),
                    },
                  }}
                >
                  Become a partner
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}