import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { premium } from './constants';

export function SoftImage({
  src,
  ratio = '16 / 9',
  label = 'Image',
  hint,
}: {
  src?: string;
  ratio?: string;
  label?: string;
  hint?: string;
}) {

  return (
    <Box
      data-reveal="1"
      sx={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: premium.rMd,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
        boxShadow: '0 34px 110px rgba(0,0,0,0.12)',
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={label}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: (t) =>
              [
                `radial-gradient(900px circle at 20% 20%, ${alpha(t.palette.primary.main, 0.18)}, transparent 44%)`,
                `radial-gradient(900px circle at 85% 0%, ${alpha(t.palette.success.main, 0.12)}, transparent 48%)`,
                `linear-gradient(180deg, ${alpha(t.palette.background.paper, 0.10)}, ${alpha(t.palette.background.paper, 0.03)})`,
              ].join(','),
          }}
        >
          <Stack sx={{ position: 'absolute', inset: 0, p: { xs: 2.5, md: 3 } }} justifyContent="space-between">
            <Stack spacing={0.7}>
              <Chip
                size="small"
                variant="outlined"
                label="Placeholder"
                sx={{
                  width: 'fit-content',
                  bgcolor: 'background.paper',
                  height: premium.chip.height,
                  borderRadius: premium.chip.r,
                  '& .MuiChip-label': { fontWeight: premium.chip.fw },
                }}
              />
              <Typography sx={{ fontWeight: 1050, letterSpacing: -0.6 }}>{label}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 520, lineHeight: 1.6 }}>
                {hint ?? 'Add your screenshot in /public/landing and set the src.'}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
