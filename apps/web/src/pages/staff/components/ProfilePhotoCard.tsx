import * as React from 'react';
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

type Props = {
  name: string;
  photoUrl?: string;
  onChangePhoto?: (file: File) => void;
};

export default function ProfilePhotoCard({ name, photoUrl, onChangePhoto }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={photoUrl} sx={{ width: 72, height: 72 }}>
            {name?.trim()?.[0]?.toUpperCase() ?? 'S'}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={900}>Profile photo</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Upload a clear photo. It will be visible to customers.
            </Typography>
          </Box>

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

          <Button variant="outlined" onClick={() => inputRef.current?.click()}>
            Upload
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}