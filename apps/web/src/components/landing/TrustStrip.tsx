import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import QueueRoundedIcon from '@mui/icons-material/QueueRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import { alpha } from '@mui/material/styles';
import { landingColors, premium } from './constants';

const items = [
  { icon: <EventAvailableRoundedIcon fontSize="small" />, label: 'Live availability' },
  { icon: <BlockRoundedIcon fontSize="small" />, label: 'No double bookings' },
  { icon: <QueueRoundedIcon fontSize="small" />, label: 'Waitlist recovery' },
  { icon: <ManageAccountsRoundedIcon fontSize="small" />, label: 'Partner control' },
];

export function TrustStrip() {
  return (
    <Box
      sx={{
        py: 2.6,
        bgcolor: landingColors.bg,
        borderBottom: `1px solid ${alpha(landingColors.white, 0.05)}`,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <Box
          data-reveal="1"
          sx={{
            borderRadius: `${premium.rLg * 4}px`,
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.07)',
            bgcolor: 'rgba(255,255,255,0.02)',
            boxShadow: premium.cardShadowSoft,
            px: { xs: 2, md: 3 },
            py: { xs: 1.7, md: 2 },
          }}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <Box sx={{ color: landingColors.purpleSoft, display: 'grid', placeItems: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ color: landingColors.text, fontWeight: 850, fontSize: 14.5 }}>
                    {item.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}