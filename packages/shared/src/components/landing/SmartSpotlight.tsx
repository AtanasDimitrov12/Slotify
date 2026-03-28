import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import QueueRoundedIcon from '@mui/icons-material/QueueRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { landingColors, premium } from './constants';
import { SectionTitle } from './SectionTitle';

function WaitlistVisual() {
  return (
    <Box
      data-reveal="1"
      sx={{
        borderRadius: `${premium.rXl * 4}px`,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        bgcolor: 'rgba(11,16,35,0.9)',
        boxShadow: premium.glowPurple,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={1.5}>
        <Typography sx={{ color: landingColors.muted, fontSize: 11, fontWeight: 850, letterSpacing: 1.2 }}>
          SMART WAITLIST
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 5,
            bgcolor: alpha(landingColors.purple, 0.12),
            border: `1px solid ${alpha(landingColors.purple, 0.18)}`,
          }}
        >
          <Typography sx={{ color: landingColors.purpleSoft, fontWeight: 850, fontSize: 12, letterSpacing: 1.2 }}>
            DAY FULL • AUTO-RECOVERY ACTIVE
          </Typography>
          <Typography sx={{ mt: 0.7, color: landingColors.text, fontWeight: 1000, fontSize: 22 }}>
            3 customers waiting for the next opening
          </Typography>
        </Box>

        {[
          { name: 'Martin D.', service: 'Haircut', state: 'Best match', accent: landingColors.success },
          { name: 'Alex P.', service: 'Fade + Beard', state: 'Flexible time', accent: landingColors.blue },
          { name: 'Chris N.', service: 'Buzz Cut', state: 'Queued', accent: landingColors.purpleSoft },
        ].map((item) => (
          <Stack
            key={item.name}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              minHeight: 60,
              px: 1.5,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              bgcolor: 'rgba(255,255,255,0.03)',
            }}
          >
            <Stack spacing={0.25}>
              <Typography sx={{ color: landingColors.text, fontWeight: 900, fontSize: 15 }}>
                {item.name}
              </Typography>
              <Typography sx={{ color: landingColors.mutedSoft, fontSize: 13.5 }}>
                {item.service}
              </Typography>
            </Stack>

            <Box
              sx={{
                px: 1.2,
                py: 0.8,
                borderRadius: 999,
                bgcolor: alpha(item.accent, 0.12),
                border: `1px solid ${alpha(item.accent, 0.18)}`,
              }}
            >
              <Typography sx={{ color: item.accent, fontWeight: 900, fontSize: 12 }}>
                {item.state}
              </Typography>
            </Box>
          </Stack>
        ))}

        <Box
          sx={{
            p: 2,
            borderRadius: 5,
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(16,22,43,0.75)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleRoundedIcon sx={{ color: landingColors.success, fontSize: 20 }} />
            <Typography sx={{ color: landingColors.text, fontWeight: 900, fontSize: 14.5 }}>
              If a slot opens, the best-fit customer can be notified immediately.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export function SmartSpotlight() {
  return (
    <Box
      sx={{
        py: premium.sectionPy,
        bgcolor: '#F6F7FB',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <SectionTitle
              eyebrow="Demand recovery"
              title="Don’t lose demand when the day is full"
              desc="If no slot is available, customers can join the waitlist and stay in the flow instead of leaving the platform."
            />

            <Stack spacing={2.1} sx={{ mt: 3 }}>
              {[
                {
                  icon: <QueueRoundedIcon />,
                  title: 'Keep customers interested',
                  desc: 'A full schedule does not have to mean a lost booking.',
                  accent: landingColors.purple,
                },
                {
                  icon: <NotificationsActiveRoundedIcon />,
                  title: 'Fast reactivation',
                  desc: 'When a time opens up, the next best customer can be matched quickly.',
                  accent: landingColors.blue,
                },
                {
                  icon: <AutoFixHighRoundedIcon />,
                  title: 'Cleaner recovery flow',
                  desc: 'Waitlist logic makes the system feel smarter and more complete.',
                  accent: landingColors.success,
                },
              ].map((item) => (
                <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      mt: 0.2,
                      width: 44,
                      height: 44,
                      borderRadius: 3.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(item.accent, 0.12),
                      border: `1px solid ${alpha(item.accent, 0.18)}`,
                      color: item.accent,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Stack spacing={0.4}>
                    <Typography sx={{ fontWeight: 950, letterSpacing: -0.3, fontSize: 18 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.68 }}>
                      {item.desc}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <WaitlistVisual />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}