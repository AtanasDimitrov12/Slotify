import { Box } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useScrollMotion } from '../hooks/useScrollMotion';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { Footer } from '../components/landing/Footer';

const pageColors = {
  bg: '#F7F8FC',
  bgSoft: '#EEF2FF',
  line: 'rgba(12, 18, 38, 0.06)',
  purple: '#7C6CFF',
  blue: '#7DD3FC',
  text: '#0F172A',
};

export function Page({
  children,
  hero,
  sx,
  showFooter,
}: {
  children: ReactNode;
  hero?: ReactNode;
  sx?: SxProps;
  showFooter?: boolean;
}) {
  useRevealOnScroll();
  const scrollY = useScrollMotion();

  const glowShift = Math.round(scrollY * 0.08);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        bgcolor: pageColors.bg,
        color: pageColors.text,
        ...sx,
      }}
    >
      {/* GLOBAL SOFT BACKGROUND */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(circle at 12% ${18 + glowShift * 0.02}%, rgba(124,108,255,0.07), transparent 24%),
            radial-gradient(circle at 88% ${8 + glowShift * 0.015}%, rgba(125,211,252,0.08), transparent 18%),
            linear-gradient(180deg, #F8FAFF 0%, #F5F7FC 45%, #F7F8FC 100%)
          `,
        }}
      />

      {/* VERY SOFT DEPTH */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.22,
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(circle at center, black 38%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 38%, transparent 88%)',
        }}
      />

      {/* CONTENT */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {hero}

        {/* IMPORTANT: no Container here */}
        <Box>
          {children}
          {showFooter ? <Footer /> : null}
        </Box>

        {/* Reveal animation styles */}
        <Box
          sx={{
            '[data-reveal="1"]': {
              opacity: 0,
              transform: 'translateY(18px)',
              filter: 'blur(8px)',
              transition: 'opacity 560ms ease, transform 560ms ease, filter 560ms ease',
              willChange: 'opacity, transform, filter',
            },
            '[data-reveal-state="in"]': {
              opacity: 1,
              transform: 'translateY(0px)',
              filter: 'blur(0px)',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '[data-reveal="1"]': {
                opacity: 1,
                transform: 'none',
                filter: 'none',
                transition: 'none',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}