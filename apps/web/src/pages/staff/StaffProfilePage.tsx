import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ProfilePhotoCard from './components/ProfilePhotoCard';
import ExpertiseChipsInput from './components/ExpertiseChipsInput';
import type { StaffProfile } from './components/types';
import { getMyStaffProfile, updateMyStaffProfile } from '../../api/staff';

const emptyProfile: StaffProfile = {
  name: '',
  email: '',
  photoUrl: '',
  bio: '',
  experienceYears: 0,
  expertiseTags: [],
};

export default function StaffProfilePage() {
  const [profile, setProfile] = React.useState<StaffProfile>(emptyProfile);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadProfile = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyStaffProfile();
      setProfile({
        name: data.name ?? '',
        email: data.email ?? '',
        photoUrl: data.photoUrl ?? '',
        bio: data.bio ?? '',
        experienceYears: data.experienceYears ?? 0,
        expertiseTags: data.expertiseTags ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      await updateMyStaffProfile({
        displayName: profile.name,
        bio: profile.bio ?? '',
        experienceYears: profile.experienceYears ?? 0,
        expertise: profile.expertiseTags ?? [],
        avatarUrl: profile.photoUrl ?? '',
      });

      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Profile
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            Your info is visible to customers when they choose a staff member.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <ProfilePhotoCard
          name={profile.name}
          photoUrl={profile.photoUrl}
          onChangePhoto={(file) => {
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
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      experienceYears: Number(e.target.value),
                    }))
                  }
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
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                Save changes
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}