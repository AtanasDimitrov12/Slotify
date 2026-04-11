import { landingColors, premium } from '@barber/shared';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import { Avatar, alpha, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import * as React from 'react';

type Props = {
  name: string;
  photoUrl?: string;
  onChangePhoto?: (file: File) => void;
};

export default function ProfilePhotoCard({ name, photoUrl, onChangePhoto }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" textAlign="center">
          <Typography sx={{ fontWeight: 1000, fontSize: 20, color: '#0F172A' }}>
            Profile Photo
          </Typography>

          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={photoUrl}
              sx={{
                width: { xs: 120, md: 140 },
                height: { xs: 120, md: 140 },
                fontSize: 48,
                fontWeight: 1000,
                bgcolor: alpha(landingColors.purple, 0.08),
                color: landingColors.purple,
                border: `4px solid #FFFFFF`,
                boxShadow: `0 12px 30px rgba(15,23,42,0.1)`,
              }}
            >
              {name?.trim()?.[0]?.toUpperCase() ?? 'S'}
            </Avatar>

            <Box
              onClick={() => inputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 40,
                height: 40,
                borderRadius: 999,
                bgcolor: landingColors.purple,
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124,108,255,0.3)',
                '&:hover': { transform: 'scale(1.1)', bgcolor: '#6B5CFA' },
                transition: 'all 0.2s ease',
              }}
            >
              <CameraAltRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Box sx={{ maxWidth: 280 }}>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14, mb: 2.5 }}>
              Make sure your face is clearly visible. This photo will be shown during booking.
            </Typography>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onChangePhoto) onChangePhoto(file);
              }}
            />

            <Button
              variant="outlined"
              onClick={() => inputRef.current?.click()}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                px: 4,
                height: 44,
                borderColor: 'rgba(15,23,42,0.1)',
                color: '#475569',
                textTransform: 'none',
                '&:hover': { borderColor: landingColors.purple, color: landingColors.purple },
              }}
            >
              Upload New
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
