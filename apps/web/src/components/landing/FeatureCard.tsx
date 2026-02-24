import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';
import { premium } from './constants';

export function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card
      data-reveal="1"
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: premium.rMd,
        boxShadow: premium.cardShadow,
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 34px 120px rgba(0,0,0,0.12)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.2}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.10),
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
          <Typography sx={{ fontWeight: 1100, letterSpacing: -0.3 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
            {desc}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
