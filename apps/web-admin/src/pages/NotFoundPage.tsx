import { Box, Button, Container, Stack, Typography, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { landingColors } from '@barber/shared';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: landingColors.bg,
        position: 'relative',
        overflow: 'hidden',
        color: landingColors.text,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 15% 15%, rgba(124,108,255,0.12), transparent 26%),
            radial-gradient(circle at 85% 85%, rgba(125,211,252,0.10), transparent 22%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Stack spacing={4} alignItems="center">
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: { xs: 120, md: 180 },
              lineHeight: 1,
              letterSpacing: -8,
              background: `linear-gradient(180deg, ${landingColors.text} 0%, ${alpha(landingColors.text, 0.4)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </Typography>

          <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 1000, fontSize: { xs: 28, md: 36 }, letterSpacing: -1 }}>
              Page not found
            </Typography>
            <Typography sx={{ color: landingColors.muted, fontSize: 18, fontWeight: 600, maxWidth: 400 }}>
              The page you are looking for might have been moved or doesn't exist.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<HomeRoundedIcon />}
            onClick={() => navigate('/')}
            sx={{
              minHeight: 56,
              px: 4,
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 900,
              bgcolor: landingColors.purple,
              boxShadow: '0 16px 40px rgba(124,108,255,0.32)',
              '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.1)' },
            }}
          >
            Back to home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}