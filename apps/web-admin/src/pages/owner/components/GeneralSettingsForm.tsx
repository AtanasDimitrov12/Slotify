import * as React from 'react';
import { Grid, MenuItem, Stack, TextField, Typography, Box, alpha, Divider } from '@mui/material';
import { landingColors } from '../../../components/landing/constants';

export type GeneralSettingsValues = {
  salonName: string;
  contactPersonName: string;
  phone: string;
  email: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
  websiteUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

type Props = {
  value: GeneralSettingsValues;
  onChange: (next: GeneralSettingsValues) => void;
};

const timezoneOptions = ['Europe/Amsterdam', 'Europe/Sofia', 'Europe/London'];

export default function GeneralSettingsForm({ value, onChange }: Props) {
  function updateField<K extends keyof GeneralSettingsValues>(
    field: K,
    fieldValue: GeneralSettingsValues[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <Stack spacing={4}>
      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(landingColors.purple, 0.04), border: `1px solid ${alpha(landingColors.purple, 0.1)}` }}>
        <Typography sx={{ color: landingColors.purple, fontWeight: 700, fontSize: 15 }}>
          This information is public and will be displayed on your salon's booking page.
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>Business Identity</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Salon Name"
              value={value.salonName}
              onChange={(e) => updateField('salonName', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Contact Person"
              value={value.contactPersonName}
              onChange={(e) => updateField('contactPersonName', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Phone Number"
              value={value.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Public Email Address"
              type="email"
              value={value.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Operational Timezone"
              value={value.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
            >
              {timezoneOptions.map((timezone) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Official Website URL"
              value={value.websiteUrl}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
            />
          </Grid>
        </Grid>
      </Stack>

      <Divider sx={{ opacity: 0.5 }} />

      <Stack spacing={3}>
        <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>Location Details</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Street Name"
              value={value.street}
              onChange={(e) => updateField('street', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="House #"
              value={value.houseNumber}
              onChange={(e) => updateField('houseNumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Postal Code"
              value={value.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              value={value.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Country"
              value={value.country}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </Grid>
        </Grid>
      </Stack>

      <Divider sx={{ opacity: 0.5 }} />

      <Stack spacing={3}>
        <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>Social Presence</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Instagram Username"
              value={value.instagram}
              onChange={(e) => updateField('instagram', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Facebook Page URL"
              value={value.facebook}
              onChange={(e) => updateField('facebook', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="TikTok Username"
              value={value.tiktok}
              onChange={(e) => updateField('tiktok', e.target.value)}
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
