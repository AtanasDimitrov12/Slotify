import { Stack, Typography } from '@mui/material';
import { landingColors } from './constants';

type Props = {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export function SectionTitle({
  eyebrow,
  title,
  desc,
  align = 'left',
  light = false,
}: Props) {
  const centered = align === 'center';

  return (
    <Stack
      data-reveal="1"
      spacing={1.2}
      sx={{
        textAlign: align,
        alignItems: centered ? 'center' : 'flex-start',
      }}
    >
      {eyebrow ? (
        <Typography
          sx={{
            px: 1.6,
            py: 0.7,
            borderRadius: 999,
            border: '1px solid',
            borderColor: light ? 'rgba(124,108,255,0.28)' : 'divider',
            bgcolor: light ? 'rgba(124,108,255,0.08)' : 'rgba(124,108,255,0.05)',
            color: light ? landingColors.purpleSoft : 'primary.main',
            fontSize: 11.5,
            fontWeight: 900,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}

      <Typography
        sx={{
          maxWidth: centered ? 980 : 780,
          fontSize: { xs: 34, md: 62 },
          lineHeight: { xs: 0.98, md: 0.94 },
          letterSpacing: { xs: -1.6, md: -2.6 },
          fontWeight: 1000,
          color: light ? landingColors.text : 'text.primary',
        }}
      >
        {title}
      </Typography>

      {desc ? (
        <Typography
          sx={{
            maxWidth: centered ? 760 : 680,
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.72,
            color: light ? landingColors.mutedSoft : 'text.secondary',
          }}
        >
          {desc}
        </Typography>
      ) : null}
    </Stack>
  );
}