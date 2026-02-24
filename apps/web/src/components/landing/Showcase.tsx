import { Box, Button, Chip, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { premium } from './constants';
import { SoftImage } from './SoftImage';

export function Showcase() {
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      data-reveal="1"
      sx={{
        borderRadius: premium.rMd,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        boxShadow: '0 34px 130px rgba(0,0,0,0.10)',
        background: (t) =>
          `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.10)}, ${alpha(t.palette.success.main, 0.07)})`,
      }}
    >
      <Grid container>
        <Grid item xs={12} md={5}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              sx={{ fontWeight: 1200, letterSpacing: -0.8, fontSize: { xs: 22, md: 28 }, lineHeight: 1.1 }}
            >
              Marketplace discovery, with real availability.
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.75 }}>
              Compare services & prices, see slots that actually exist, and book without back-and-forth.
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              {['Services & prices', 'Live slots', 'Smart recommendations', 'Waitlist'].map((t) => (
                <Chip
                  key={t}
                  label={t}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: premium.chip.height,
                    borderRadius: premium.chip.r,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.45),
                    '& .MuiChip-label': { fontWeight: premium.chip.fw },
                  }}
                />
              ))}
            </Stack>

            <Button
              onClick={() => navigate('/places')}
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ ...premium.btn, mt: 2.4, '& .MuiButton-endIcon': { ml: 1 } }}
            >
              Explore salons
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}>
            {/* Use 2.png again (big wide highlight) */}
            <SoftImage
              src="/landing/2.png"
              ratio={mdUp ? '16 / 8' : '16 / 10'}
              label="Wide showcase"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
