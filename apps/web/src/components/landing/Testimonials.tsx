import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { premium } from './constants';
import { SectionTitle } from './SectionTitle';

export function Testimonials() {
  return (
    <>
      <SectionTitle
        kicker="Social proof"
        title="Real reviews will live here"
        desc="Layout is ready — later we’ll plug in verified reviews and ratings."
        align="center"
      />
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {[
          {
            quote: '“I landed in a new city and booked a slot instantly. No calls, no stress.”',
            name: 'Customer • New in town',
          },
          {
            quote: '“Scheduling is clean and predictable. The booking rules save me time.”',
            name: 'Partner • Barbershop owner',
          },
          { quote: '“When the day is full, the waitlist keeps customers engaged.”', name: 'Partner • Busy salon' },
        ].map((t) => (
          <Grid item xs={12} md={4} key={t.name}>
            <Card
              data-reveal="1"
              variant="outlined"
              sx={{ borderRadius: premium.rMd, height: '100%', boxShadow: premium.cardShadow }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={1.4}>
                  <Stack direction="row" spacing={0.4}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarRoundedIcon key={i} fontSize="small" sx={{ color: 'warning.main' }} />
                    ))}
                  </Stack>
                  <Typography sx={{ fontWeight: 1000, letterSpacing: -0.3, lineHeight: 1.45 }}>{t.quote}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t.name}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
