import { Stack, Typography } from '@mui/material';

export function SectionTitle({
  kicker,
  title,
  desc,
  align = 'center',
}: {
  kicker?: string;
  title: string;
  desc?: string;
  align?: 'left' | 'center';
}) {
  const isCenter = align === 'center';

  return (
    <Stack
      data-reveal="1"
      spacing={1}
      sx={{
        textAlign: align,
        alignItems: isCenter ? 'center' : 'flex-start', // ✅ centers the children block-wise
        width: '100%',
      }}
    >
      {kicker ? (
        <Typography
          sx={{
            fontWeight: 950,
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: 1.6,
            fontSize: 12,
          }}
        >
          {kicker}
        </Typography>
      ) : null}

      <Typography
        sx={{
          fontWeight: 1200,
          letterSpacing: -1.2,
          fontSize: { xs: 28, md: 40 },
          lineHeight: 1.05,

          // ✅ make the title a centered block with a max width
          maxWidth: isCenter ? 900 : 760,
          width: '100%',
        }}
      >
        {title}
      </Typography>

      {desc ? (
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 15.5, md: 16.5 },
            lineHeight: 1.75,

            // ✅ same logic for subtitle
            maxWidth: isCenter ? 720 : 760,
            width: '100%',
          }}
        >
          {desc}
        </Typography>
      ) : null}
    </Stack>
  );
}