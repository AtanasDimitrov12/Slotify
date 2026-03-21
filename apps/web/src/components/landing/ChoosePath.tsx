import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import CalendarViewDayRoundedIcon from '@mui/icons-material/CalendarViewDayRounded';
import { useNavigate } from 'react-router-dom';
import { landingColors, premium } from './constants';
import { SectionTitle } from './SectionTitle';

function AudienceCard({
  eyebrow,
  title,
  desc,
  points,
  cta,
  onClick,
  accent,
  icon,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  points: { label: string; icon: React.ReactNode }[];
  cta: string;
  onClick: () => void;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      data-reveal="1"
      sx={{
        height: '100%',
        borderRadius: `${premium.rXl * 4}px`,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.08)',
        bgcolor: landingColors.bgSoft2,
        color: landingColors.text,
        boxShadow: premium.cardShadow,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.6}>
              <Typography sx={{ color: landingColors.muted, fontWeight: 850, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                {eyebrow}
              </Typography>
              <Typography sx={{ fontWeight: 1000, fontSize: 28, letterSpacing: -1 }}>
                {title}
              </Typography>
            </Stack>

            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(accent, 0.14),
                border: `1px solid ${alpha(accent, 0.20)}`,
                color: accent,
              }}
            >
              {icon}
            </Box>
          </Stack>

          <Typography sx={{ color: landingColors.mutedSoft, lineHeight: 1.72, fontSize: 15.5 }}>
            {desc}
          </Typography>

          <Stack spacing={1.1}>
            {points.map((point) => (
              <Stack
                key={point.label}
                direction="row"
                spacing={1.1}
                alignItems="center"
                sx={{
                  minHeight: 46,
                  px: 1.3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.03)',
                }}
              >
                <Box sx={{ color: accent, display: 'grid', placeItems: 'center' }}>{point.icon}</Box>
                <Typography sx={{ color: landingColors.text, fontWeight: 850, fontSize: 14.5 }}>
                  {point.label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="contained"
            onClick={onClick}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              mt: 0.8,
              alignSelf: 'flex-start',
              minHeight: 48,
              px: 2.2,
              borderRadius: 999,
              fontWeight: 900,
              textTransform: 'none',
              bgcolor: accent,
              boxShadow: `0 16px 40px ${alpha(accent, 0.24)}`,
              '&:hover': {
                bgcolor: accent,
                filter: 'brightness(0.96)',
              },
            }}
          >
            {cta}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ChoosePath() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: premium.sectionPy,
        bgcolor: landingColors.bg,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <SectionTitle
          eyebrow="Built for both sides"
          title="For customers. For partners. One sharper booking flow."
          desc="Customers get a faster, cleaner reservation experience. Partners get more control, better structure, and less wasted time."
          align="center"
          light
        />

        <Grid container spacing={2.4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <AudienceCard
              eyebrow="For customers"
              title="Book without friction"
              desc="Find a salon, check live availability, and reserve quickly without digging through outdated calendars."
              cta="Explore salons"
              onClick={() => navigate('/salons')}
              accent={landingColors.purple}
              icon={<PersonSearchRoundedIcon />}
              points={[
                { label: 'Search by city and service', icon: <StorefrontRoundedIcon fontSize="small" /> },
                { label: 'See live available slots', icon: <CalendarViewDayRoundedIcon fontSize="small" /> },
                { label: 'Simple booking experience', icon: <TuneRoundedIcon fontSize="small" /> },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AudienceCard
              eyebrow="For partners"
              title="Run a cleaner day"
              desc="Manage bookings, apply reservation rules, and use smarter slot placement to reduce empty gaps."
              cta="Become a partner"
              onClick={() => navigate('/partner')}
              accent={landingColors.blue}
              icon={<QueryStatsRoundedIcon />}
              points={[
                { label: 'Calendar and rule control', icon: <TuneRoundedIcon fontSize="small" /> },
                { label: 'Better schedule structure', icon: <CalendarViewDayRoundedIcon fontSize="small" /> },
                { label: 'Less admin work manually', icon: <StorefrontRoundedIcon fontSize="small" /> },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}