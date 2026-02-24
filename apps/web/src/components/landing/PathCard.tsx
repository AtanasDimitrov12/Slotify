import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { SoftImage } from './SoftImage';
import { premium } from './constants';

export function PathCard({
  title,
  desc,
  chips,
  cta,
  onClick,
  imageLabel,
  imageSrc,
}: {
  title: string;
  desc: string;
  chips: string[];
  cta: string;
  onClick: () => void;
  imageLabel: string;
  imageSrc: string;
}) {
  return (
    <Card
      data-reveal="1"
      variant="outlined"
      sx={{
        borderRadius: premium.rMd,
        overflow: 'visible',
        height: '100%',
        boxShadow: premium.cardShadow,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.8}>
            <Typography sx={{ fontWeight: 1200, letterSpacing: -0.6, fontSize: { xs: 20, md: 22 } }}>{title}</Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{desc}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {chips.map((c) => (
              <Chip
                key={c}
                size="small"
                label={c}
                variant="outlined"
                sx={{
                  height: premium.chip.height,
                  borderRadius: premium.chip.r,
                  '& .MuiChip-label': { fontWeight: premium.chip.fw },
                }}
              />
            ))}
          </Stack>

          <Button
            variant="contained"
            onClick={onClick}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              ...premium.btn,
              width: { xs: '100%', sm: 'fit-content' },
              alignSelf: 'flex-start',
              '& .MuiButton-endIcon': { ml: 1 },
            }}
          >
            {cta}
          </Button>

          <SoftImage src={imageSrc} label={imageLabel} ratio="16 / 10" />
        </Stack>
      </CardContent>
    </Card>
  );
}
