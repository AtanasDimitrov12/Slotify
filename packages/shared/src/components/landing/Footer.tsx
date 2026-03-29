import { Box, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { landingColors, premium } from './constants';

export function Footer() {
  return (
    <Box
      sx={{
        py: 4,
        bgcolor: landingColors.bg,
        borderTop: `1px solid ${alpha(landingColors.white, 0.05)}`,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: premium.maxWidth, px: premium.sectionPx }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Typography
            sx={{ color: landingColors.text, fontWeight: 1000, letterSpacing: -0.5, fontSize: 18 }}
          >
            SLOTIFY
          </Typography>

          <Typography sx={{ color: landingColors.muted, fontSize: 14.2 }}>
            Premium reservation flow for modern salons.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
