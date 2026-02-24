import { Box, Chip, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { premium } from './constants';
import { SectionTitle } from './SectionTitle';
import { SoftImage } from './SoftImage';

export function SmartSpotlight() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      data-reveal="1"
      sx={{
        borderRadius: premium.rMd,
        p: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        background: (t) =>
          `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.11)}, ${alpha(t.palette.success.main, 0.08)})`,
        boxShadow: '0 32px 120px rgba(0,0,0,0.10)',
      }}
    >
      <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="center">
        <Grid item xs={12} md={6}>
          <SectionTitle
            kicker="Smart scheduling"
            title="Reduce empty gaps automatically"
            desc="Recommended slots prioritize times adjacent to existing reservations — better flow for salons, better availability for customers."
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {[
              { icon: <AutoAwesomeRoundedIcon fontSize="small" />, label: 'Recommended slots' },
              { icon: <InsightsRoundedIcon fontSize="small" />, label: 'Simple analytics' },
              { icon: <BoltRoundedIcon fontSize="small" />, label: 'Less admin work' },
            ].map((c) => (
              <Chip
                key={c.label}
                icon={c.icon}
                label={c.label}
                sx={{
                  height: premium.chip.height,
                  borderRadius: premium.chip.r,
                  fontWeight: premium.chip.fw,
                }}
              />
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Use 6.png for optimization */}
          <SoftImage
            src="/landing/6.png"
            label="Optimization / recommended slots"
            ratio={mdUp ? '16 / 10' : '16 / 10'}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
