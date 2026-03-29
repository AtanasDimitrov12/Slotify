import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { landingColors, premium } from './constants';
import { SectionTitle } from './SectionTitle';

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
};

const items: FeatureItem[] = [
  {
    icon: <CalendarMonthRoundedIcon />,
    title: 'Dynamic slot generation',
    desc: 'Availability is built from schedule rules, service duration, and real reservations.',
    accent: landingColors.purple,
  },
  {
    icon: <BoltRoundedIcon />,
    title: 'No overlaps',
    desc: 'Conflict checks stop double bookings and keep the calendar reliable.',
    accent: landingColors.blue,
  },
  {
    icon: <GroupsRoundedIcon />,
    title: 'Waitlist built in',
    desc: 'When the day is full, customers can queue for the next opening instead of leaving.',
    accent: landingColors.success,
  },
  {
    icon: <AutoAwesomeRoundedIcon />,
    title: 'Recommended times',
    desc: 'Slotify prioritizes cleaner placements instead of scattering bookings randomly.',
    accent: landingColors.purpleSoft,
  },
];

export function Features() {
  return (
    <Box
      sx={{
        py: premium.sectionPy,
        bgcolor: '#F6F7FB',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <SectionTitle
          eyebrow="Core platform"
          title="Modern booking engine — not just a basic calendar"
          desc="Shorter copy. Stronger message. Clearer product story."
          align="center"
        />

        <Grid container spacing={2.2} sx={{ mt: 4 }}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card
                data-reveal="1"
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: `${premium.rLg * 4}px`,
                  borderColor: 'rgba(10,18,40,0.08)',
                  boxShadow: '0 18px 48px rgba(9,16,36,0.06)',
                  bgcolor: landingColors.white,
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 24px 60px rgba(9,16,36,0.10)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.4}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(item.accent, 0.12),
                        border: `1px solid ${alpha(item.accent, 0.18)}`,
                        color: item.accent,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography sx={{ fontWeight: 1000, letterSpacing: -0.5, fontSize: 18 }}>
                      {item.title}
                    </Typography>

                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.72, fontSize: 14.8 }}>
                      {item.desc}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
