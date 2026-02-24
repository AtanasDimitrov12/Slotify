import { Box, Button, Grid, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { premium } from './constants';

export function FinalCTA() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      data-reveal="1"
      sx={{
        borderRadius: premium.rMd,
        p: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.1)}, transparent 70%)`,
        boxShadow: '0 32px 130px rgba(0,0,0,0.10)',
      }}
    >
      <Grid container spacing={2.5} alignItems="center">
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontWeight: 1250, letterSpacing: -1.0, fontSize: { xs: 22, md: 30 } }}>
            Ready to book — or ready to grow?
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.7, maxWidth: 780, lineHeight: 1.75 }}>
            Customers: find a salon and reserve instantly. Partners: manage your schedule and get discovered in your
            city.
          </Typography>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack
            direction={{ xs: 'column', sm: 'row', md: 'column' }}
            spacing={1.2}
            sx={{ alignItems: { md: 'flex-end' } }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/places')}
              sx={{ ...premium.btn, width: { xs: '100%', sm: 'auto', md: 'fit-content' } }}
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Explore salons
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/partner')}
              sx={{
                ...premium.btn,
                width: { xs: '100%', sm: 'auto', md: 'fit-content' },
                bgcolor: alpha(theme.palette.background.paper, 0.55),
              }}
            >
              Become a partner
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
