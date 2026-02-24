import { Box, Card, CardContent, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { premium } from './constants';
import { SectionTitle } from './SectionTitle';
import { SoftImage } from './SoftImage';

export function HowItWorks() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box>
      <SectionTitle
        kicker="How it works"
        title="Pick a service. Choose a slot. You’re done."
        desc="Simple flow for customers, predictable scheduling for salons."
        align="center"
      />
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {[
          { step: '1', title: 'Discover', desc: 'Browse salons and services in your city.' },
          { step: '2', title: 'Choose', desc: 'See available slots and recommended times.' },
          { step: '3', title: 'Reserve', desc: 'Book instantly (guest supported in MVP).' },
        ].map((s) => (
          <Grid item xs={12} md={4} key={s.step}>
            <Card
              data-reveal="1"
              variant="outlined"
              sx={{ borderRadius: premium.rMd, height: '100%', boxShadow: premium.cardShadow }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                        color: 'primary.main',
                        fontWeight: 1200,
                      }}
                    >
                      {s.step}
                    </Box>
                    <Typography sx={{ fontWeight: 1200, letterSpacing: -0.4 }}>{s.title}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                    {s.desc}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2.2 }}>
        {/* IMPORTANT: use 5b.png (not 5.png) */}
        <SoftImage
          src="/landing/5b.png"
          label="How it works collage"
          ratio={mdUp ? '16 / 6' : '16 / 9'}
        />
      </Box>
    </Box>
  );
}
