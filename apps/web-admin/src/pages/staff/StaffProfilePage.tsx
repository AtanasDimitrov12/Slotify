import {
  getMyStaffProfile,
  getOtherProfileSync,
  landingColors,
  updateMyStaffProfile,
  useToast,
} from '@barber/shared';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import ExpertiseChipsInput from './components/ExpertiseChipsInput';
import ProfilePhotoCard from './components/ProfilePhotoCard';
import type { StaffProfile } from './components/types';

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
  const [syncing, setSyncing] = React.useState(false);
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

  async function handleSync() {
    setSyncing(true);
    try {
      const other = await getOtherProfileSync();
      setProfile((p) => ({
        ...p,
        name: other.name ?? p.name,
        bio: other.bio ?? p.bio,
        experienceYears: other.experienceYears ?? p.experienceYears,
        expertiseTags: other.expertiseTags ?? p.expertiseTags,
        photoUrl: other.photoUrl ?? p.photoUrl,
      }));
      showSuccess("Profile information loaded from your other salon. Don't forget to save!");
    } catch (err) {
      showError("You don't have other profiles to sync from yet.");
    } finally {
      setSyncing(false);
    }
  }

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
    <Stack spacing={{ xs: 3, md: 5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 1000,
              fontSize: { xs: 28, md: 36 },
              letterSpacing: -1.5,
              color: '#0F172A',
              lineHeight: 1.1,
            }}
          >
            Public Profile
          </Typography>
          <Typography
            sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: 14, md: 18 }, mt: 1 }}
          >
            This information will be visible to customers on your booking page.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<SyncRoundedIcon />}
            onClick={handleSync}
            disabled={syncing || loading}
            sx={{
              borderRadius: 2,
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'rgba(15,23,42,0.12)',
              color: '#475569',
              '&:hover': {
                bgcolor: alpha(landingColors.purple, 0.04),
                borderColor: landingColors.purple,
              },
            }}
          >
            {syncing ? 'Syncing...' : 'Sync from other Salon'}
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={saving}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              minHeight: 48,
              px: 4,
              borderRadius: 2,
              fontWeight: 900,
              bgcolor: landingColors.purple,
              boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.2)}`,
              textTransform: 'none',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Left Column: Photo */}
        <Grid item xs={12} lg={4}>
          <ProfilePhotoCard
            name={profile.name}
            photoUrl={profile.photoUrl}
            onChangePhoto={(file) => {
              const url = URL.createObjectURL(file);
              setProfile((p) => ({ ...p, photoUrl: url }));
            }}
          />
        </Grid>

        {/* Right Column: Details */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={{ xs: 3, md: 4 }}>
            {/* Section 1: Identity */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#0F172A', mb: 3 }}>
                  Account Identity
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profile.email}
                      disabled
                      helperText="Primary contact (managed by admin)"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Professional Stats */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#0F172A', mb: 3 }}>
                  Skills & Experience
                </Typography>
                <Grid container spacing={2.5}>
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
                </Grid>
              </CardContent>
            </Card>

            {/* Section 3: Bio */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#0F172A', mb: 1 }}>
                  Biography
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 14, mb: 3, fontWeight: 500 }}>
                  Write a brief introduction that will help customers get to know you.
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Describe your style, background, or anything you'd like to share with your clients..."
                  value={profile.bio ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  multiline
                  minRows={6}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#F8FAFC',
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Mobile Save Button */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, pt: 1, pb: 4 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 900,
                  bgcolor: landingColors.purple,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.2)}`,
                  textTransform: 'none',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
