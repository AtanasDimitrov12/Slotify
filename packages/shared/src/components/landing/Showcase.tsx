import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarViewWeekRoundedIcon from '@mui/icons-material/CalendarViewWeekRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { landingColors, premium } from './constants';
import { SectionTitle } from './SectionTitle';

function ShowcaseVisual() {
  return (
    <Box
      data-reveal="1"
      sx={{
        position: 'relative',
        borderRadius: `${premium.rXl * 4}px`,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: landingColors.line,
        bgcolor: landingColors.bgSoft,
        boxShadow: premium.glowBlue,
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 22%, rgba(124,108,255,0.18), transparent 28%),
            radial-gradient(circle at 85% 80%, rgba(125,211,252,0.16), transparent 26%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={2.2} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{ color: landingColors.text, fontWeight: 950, letterSpacing: -0.5, fontSize: 22 }}
          >
            SLOTIFY FLOW ENGINE
          </Typography>
          <Box
            sx={{
              px: 1.3,
              py: 0.8,
              borderRadius: 999,
              bgcolor: alpha(landingColors.blue, 0.12),
              border: `1px solid ${alpha(landingColors.blue, 0.22)}`,
            }}
          >
            <Typography sx={{ color: landingColors.blue, fontWeight: 900, fontSize: 12 }}>
              ACTIVE
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.03)',
          }}
        >
          <Typography
            sx={{ color: landingColors.muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}
          >
            GAP OPPORTUNITY DETECTED
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Stack spacing={0.25}>
              <Typography sx={{ color: landingColors.text, fontWeight: 950, fontSize: 17 }}>
                18:45 → 19:15
              </Typography>
              <Typography sx={{ color: landingColors.mutedSoft, fontSize: 14 }}>
                30-minute gap between two reservations
              </Typography>
            </Stack>

            <Typography sx={{ color: landingColors.success, fontWeight: 1000, fontSize: 13 }}>
              RECOVERABLE
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={1.2}>
          {[
            { label: 'Recommend adjacent slot', width: '84%', color: landingColors.purple },
            { label: 'Prioritize waitlist match', width: '66%', color: landingColors.blue },
            { label: 'Reduce dead calendar time', width: '92%', color: landingColors.success },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                width: item.width,
                minHeight: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                px: 1.6,
                background: `linear-gradient(90deg, ${alpha(item.color, 0.22)}, ${alpha(item.color, 0.08)})`,
                border: `1px solid ${alpha(item.color, 0.18)}`,
              }}
            >
              <Typography sx={{ color: landingColors.text, fontWeight: 900, fontSize: 14 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(16,22,43,0.75)',
          }}
        >
          <Typography
            sx={{ color: landingColors.muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}
          >
            RESERVATION LANE
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1.3 }}>
            {[
              { w: '18%', c: landingColors.purpleSoft },
              { w: '10%', c: alpha(landingColors.white, 0.07) },
              { w: '24%', c: landingColors.purple },
              { w: '14%', c: landingColors.blue },
              { w: '18%', c: landingColors.success },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  width: item.w,
                  height: 18,
                  borderRadius: 999,
                  bgcolor: item.c,
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export function Showcase() {
  return (
    <Box
      sx={{
        bgcolor: landingColors.bg,
        py: premium.sectionPy,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <ShowcaseVisual />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <SectionTitle
                eyebrow="Smart scheduling"
                title="Turn busy hours into better flow"
                desc="Slotify generates slots from your real schedule, prevents conflicts, and pushes bookings into positions that make the day cleaner."
                light
              />

              <Stack spacing={2}>
                {[
                  {
                    icon: <AutoAwesomeRoundedIcon />,
                    title: 'Intelligent slot generation',
                    desc: 'Availability is created from real schedule logic, duration, and existing reservations.',
                  },
                  {
                    icon: <CalendarViewWeekRoundedIcon />,
                    title: 'Less dead time',
                    desc: 'Recommended slots sit next to existing bookings to reduce empty gaps.',
                  },
                  {
                    icon: <TrendingUpRoundedIcon />,
                    title: 'Sharper operations',
                    desc: 'A cleaner day means less admin work and a better booking flow for the business.',
                  },
                ].map((item) => (
                  <Stack key={item.title} direction="row" spacing={1.6} alignItems="flex-start">
                    <Box
                      sx={{
                        mt: 0.2,
                        width: 44,
                        height: 44,
                        borderRadius: 3.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(landingColors.purple, 0.12),
                        border: `1px solid ${alpha(landingColors.purple, 0.18)}`,
                        color: landingColors.purpleSoft,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Stack spacing={0.5}>
                      <Typography sx={{ color: landingColors.text, fontWeight: 950, fontSize: 18 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: landingColors.mutedSoft, lineHeight: 1.68 }}>
                        {item.desc}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
