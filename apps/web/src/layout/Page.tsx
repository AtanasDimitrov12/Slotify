import { Box, Container, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import React from 'react';
import { useScrollMotion } from '../hooks/useScrollMotion';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { Footer } from '../components/landing/Footer';

export function Page({
  children,
  hero,
  sx,
  showFooter,
}: {
  children: React.ReactNode;
  hero?: React.ReactNode;
  sx?: SxProps;
  showFooter?: boolean;
}) {
  useRevealOnScroll();
  const scrollY = useScrollMotion();

  // scroll-reactive barber pole position (very subtle)
  const poleShift = Math.round(scrollY * 0.15);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        background: (t) =>
          `linear-gradient(180deg, ${alpha(t.palette.background.paper, 0)} 0%, ${alpha(
            t.palette.background.paper,
            1,
          )} 60%)`,
        ...sx,
      }}
    >
      {/* PREMIUM BACKGROUND LAYER */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,

          // 7.png is your subtle texture background
          backgroundImage: `url('/landing/7.png')`,
          backgroundSize: 'cover',
          backgroundPosition: `center calc(50% + ${poleShift}px)`,
          backgroundRepeat: 'no-repeat',
          opacity: 0.55,

          // barber pole overlay (extremely subtle)
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,0,0,0.25) 0 10px, rgba(255,255,255,0.25) 10px 20px, rgba(0,80,255,0.22) 20px 30px, rgba(255,255,255,0.25) 30px 40px)',
            backgroundSize: '200% 200%',
            backgroundPosition: `${poleShift}px ${poleShift}px`,
            mixBlendMode: 'normal',
            opacity: 0.0,
          },

          // vignette
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(1200px circle at 50% 20%, rgba(255,255,255,0.0), rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.06) 100%)',
          },
        }}
      />

      {/* CONTENT WRAPPER */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* HERO BAND (full width) */}
        {hero}

        {/* MAIN CONTENT */}
        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          <Stack spacing={{ xs: 6, md: 9 }}>
            {children}
            {showFooter && <Footer />}
          </Stack>
        </Container>

        {/* Reveal animation styles */}
        <Box
          sx={{
            '[data-reveal="1"]': {
              opacity: 0,
              transform: 'translateY(14px)',
              filter: 'blur(6px)',
              transition: 'opacity 520ms ease, transform 520ms ease, filter 520ms ease',
            },
            '[data-reveal-state="in"]': {
              opacity: 1,
              transform: 'translateY(0px)',
              filter: 'blur(0px)',
            },
          }}
        />
      </Box>
      .
    </Box>
  );
}
