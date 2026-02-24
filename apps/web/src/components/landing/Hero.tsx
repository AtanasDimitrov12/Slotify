import * as React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import TimelapseRoundedIcon from '@mui/icons-material/TimelapseRounded';

import { premium } from './constants';
import { SoftImage } from './SoftImage';

function StatPill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card
      data-reveal="1"
      variant="outlined"
      sx={{
        borderRadius: 999,
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        bgcolor: (t) => alpha(t.palette.background.paper, 0.55),
        backdropFilter: 'blur(12px)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.08)',
        borderColor: (t) => alpha(t.palette.divider, 0.8),
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: { md: 'translateY(-3px)' },
          boxShadow: { md: '0 26px 86px rgba(0,0,0,0.12)' },
        },

        // premium gradient edge (very subtle)
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          padding: '1px',
          borderRadius: 999,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.35)}, ${alpha(
              t.palette.success.main,
              0.20,
            )}, ${alpha(t.palette.background.paper, 0.0)})`,
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          px: 2.1,
          py: 1.7,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.10),
            color: 'primary.main',
            flex: '0 0 auto',
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 1200,
              letterSpacing: -0.6,
              lineHeight: 1.05,
              fontSize: 15.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.4,
              fontSize: 13.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {desc}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  // hover glow on hero only (nice + premium)
  const [glow, setGlow] = React.useState({ x: 70, y: 20 });
  const onHeroMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!mdUp) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGlow({ x, y });
    },
    [mdUp],
  );

  return (
    <Box
      onMouseMove={onHeroMove}
      sx={{
        pt: { xs: 4.5, md: 7.5 },
        pb: { xs: 3.5, md: 6 },
        background: (t) =>
          [
            `radial-gradient(1100px circle at ${glow.x}% ${glow.y}%, ${alpha(
              t.palette.primary.main,
              0.12,
            )}, transparent 52%)`,
            `radial-gradient(1000px circle at 92% 14%, ${alpha(
              t.palette.success.main,
              0.08,
            )}, transparent 56%)`,
            `linear-gradient(180deg, ${alpha(
              t.palette.background.paper,
              0,
            )} 0%, ${alpha(t.palette.background.paper, 1)} 72%)`,
          ].join(','),
        transition: mdUp ? 'background 120ms linear' : undefined,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3.5, md: 6 }} alignItems="center">
          {/* LEFT */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2.2}>
              {/* Keep ONE set of value chips (top) */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  { icon: <BoltRoundedIcon fontSize="small" />, label: 'Instant booking' },
                  { icon: <AutoAwesomeRoundedIcon fontSize="small" />, label: 'Recommended slots' },
                  { icon: <GroupsRoundedIcon fontSize="small" />, label: 'Waitlist built-in' },
                ].map((c) => (
                  <Chip
                    key={c.label}
                    icon={c.icon}
                    label={c.label}
                    variant="outlined"
                    sx={{
                      height: premium.chip.height,
                      borderRadius: premium.chip.r,
                      bgcolor: (t) => alpha(t.palette.background.paper, 0.55),
                      backdropFilter: 'blur(10px)',
                      '& .MuiChip-label': { fontWeight: premium.chip.fw },
                    }}
                  />
                ))}
              </Stack>

              <Typography
                data-reveal="1"
                sx={{
                  fontWeight: 1250,
                  letterSpacing: -2.2,
                  lineHeight: 0.96,
                  fontSize: { xs: 44, sm: 58, md: 72 },
                }}
              >
                Book a haircut{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  in minutes
                </Box>
                .
              </Typography>

              <Typography
                data-reveal="1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: 16.5, md: 18 },
                  lineHeight: 1.75,
                  maxWidth: 640,
                }}
              >
                New city? No problem. Discover salons, compare services & prices, see real availability, and reserve a
                slot — without calls.
              </Typography>

              <Stack
                data-reveal="1"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                sx={{ pt: 0.4 }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate('/places')}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ ...premium.btn, '& .MuiButton-endIcon': { ml: 1 } }}
                >
                  Explore salons
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/partner')}
                  sx={{
                    ...premium.btn,
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.5),
                    '&:hover': { bgcolor: (t) => alpha(t.palette.background.paper, 0.75) },
                  }}
                >
                  Become a partner
                </Button>
              </Stack>

              {/* Removed the duplicate strip entirely ✅ */}
            </Stack>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2.1}>
              <SoftImage src="/landing/1.png" ratio={mdUp ? '16 / 11' : '16 / 10'} label="Hero screenshot" />

              {/* Replace boring cards with premium metric pills ✅ */}
              <Grid container spacing={1.3}>
                <Grid item xs={12} sm={4}>
                  <StatPill
                    icon={<TimelapseRoundedIcon fontSize="small" />}
                    title="2–3 clicks"
                    desc="Book a slot fast, no calls."
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StatPill
                    icon={<HubRoundedIcon fontSize="small" />}
                    title="Multi-tenant"
                    desc="Many salons, one platform."
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StatPill
                    icon={<FlashOnRoundedIcon fontSize="small" />}
                    title="Recommended"
                    desc="Slots that reduce gaps."
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}