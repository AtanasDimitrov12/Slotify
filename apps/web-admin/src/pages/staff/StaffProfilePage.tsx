import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import ProfilePhotoCard from './components/ProfilePhotoCard';
import ExpertiseChipsInput from './components/ExpertiseChipsInput';
import type { StaffProfile } from './components/types';
import { getMyStaffProfile, updateMyStaffProfile } from '@barber/shared'; 
import { landingColors, premium } from '@barber/shared'; 
import { useToast } from '@barber/shared'; 

const emptyProfile: StaffProfile = {
  name: '',
  email: '',
  photoUrl: '',
  bio: '',
  experienceYears: 0,
  expertiseTags: [],
};

export default function StaffProfilePage() {
  const { showError, showSuccess } = useToast();
  const [profile, setProfile] = React.useState<StaffProfile>(emptyProfile);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

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

    try {
      await updateMyStaffProfile({
        displayName: profile.name,
        bio: profile.bio ?? '',
        experienceYears: profile.experienceYears ?? 0,
        expertise: profile.expertiseTags ?? [],
        avatarUrl: profile.photoUrl ?? '',
      });

      showSuccess('Profile updated successfully.');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={4}>
        <Box>
          <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
            Profile
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Tell customers about your skills and experience.
          </Typography>
        </Box>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProfilePhotoCard
              name={profile.name}
              photoUrl={profile.photoUrl}
              onChangePhoto={(file) => {
                const url = URL.createObjectURL(file);
                setProfile((p) => ({ ...p, photoUrl: url }));
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: `${premium.rLg * 4}px`,
                border: '1px solid',
                borderColor: 'rgba(15,23,42,0.06)',
                bgcolor: '#FFFFFF',
                boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profile.email}
                      disabled
                      helperText="Managed by salon owner"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
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

                  <Grid item xs={12} sm={8}>
                    <ExpertiseChipsInput
                      value={profile.expertiseTags}
                      onChange={(next) => setProfile((p) => ({ ...p, expertiseTags: next }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Biography"
                      placeholder="Write a short intro for your customers..."
                      value={profile.bio ?? ''}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      multiline
                      minRows={5}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      minHeight: 52,
                      px: 4,
                      borderRadius: 999,
                      fontWeight: 900,
                      bgcolor: landingColors.purple,
                      boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
