import * as React from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import ProfilePhotoCard from './components/ProfilePhotoCard';
import ExpertiseChipsInput from './components/ExpertiseChipsInput';
import type { StaffProfile } from './components/types';

const initial: StaffProfile = {
  name: 'Mila Cuts',
  email: 'mila@fadedistrict.com',
  photoUrl: '',
  bio: 'Specialized in modern fades and clean beard lines.',
  experienceYears: 4,
  expertiseTags: ['Fade', 'Beard', 'Skin fade'],
};

export default function StaffProfilePage() {
  const [profile, setProfile] = React.useState<StaffProfile>(initial);

  function handleSave() {
    // TODO: PUT /staff/me
    // TODO: upload photo separately
    // For now just a mock action
    // eslint-disable-next-line no-console
    console.log('Save profile:', profile);
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={900}>
          Profile
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Your info is visible to customers when they choose a staff member.
        </Typography>
      </Box>

      <ProfilePhotoCard
        name={profile.name}
        photoUrl={profile.photoUrl}
        onChangePhoto={(file) => {
          // TODO: upload to backend/cloud and store URL
          const url = URL.createObjectURL(file);
          setProfile((p) => ({ ...p, photoUrl: url }));
        }}
      />

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                disabled
                helperText="Email is managed by the salon owner"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={profile.experienceYears ?? 0}
                onChange={(e) => setProfile((p) => ({ ...p, experienceYears: Number(e.target.value) }))}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <ExpertiseChipsInput
                value={profile.expertiseTags}
                onChange={(next) => setProfile((p) => ({ ...p, expertiseTags: next }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={profile.bio ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={handleSave}>
              Save changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}