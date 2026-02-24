import { Box, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import { premium } from './constants';

export function TrustStrip() {
  return (
    <Box
      data-reveal="1"
      sx={{
        mt: { xs: 1, md: 1 },
        borderRadius: premium.rLg,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.background.paper, 0.55),
        backdropFilter: 'blur(12px)',
        boxShadow: '0 22px 80px rgba(0,0,0,0.07)',
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.8, md: 2.1 } }}>
        <Grid container spacing={2} alignItems="center" sx={{textAlign: 'center'}}>
          {[
            { icon: <StorefrontRoundedIcon fontSize="small" />, label: 'Marketplace of salons' },
            { icon: <CalendarMonthRoundedIcon fontSize="small" />, label: 'Real availability' },
            { icon: <AutoAwesomeRoundedIcon fontSize="small" />, label: 'Recommended slots' },
            { icon: <VerifiedRoundedIcon fontSize="small" />, label: 'Verified (placeholder)' },
            { icon: <StarRoundedIcon fontSize="small" />, label: 'Reviews (placeholder)' },
          ].map((x) => (
            <Grid item xs={12} sm={6} md={2.4} key={x.label}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: 'text.secondary' }}>{x.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 950 }}>
                  {x.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
