import * as React from 'react';
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';

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
    <Stack spacing={2} sx={{ px: 2 }}>
      <Typography sx={{ opacity: 0.7 }}>
        Update the core business information shown across your salon profile and reservation flow.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Salon name"
            value={value.salonName}
            onChange={(e) => updateField('salonName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact person"
            value={value.contactPersonName}
            onChange={(e) => updateField('contactPersonName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            value={value.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Business email"
            type="email"
            value={value.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Timezone"
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
            label="Website"
            value={value.websiteUrl}
            onChange={(e) => updateField('websiteUrl', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Street"
            value={value.street}
            onChange={(e) => updateField('street', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="House number"
            value={value.houseNumber}
            onChange={(e) => updateField('houseNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Postal code"
            value={value.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            value={value.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Country"
            value={value.country}
            onChange={(e) => updateField('country', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Instagram"
            value={value.instagram}
            onChange={(e) => updateField('instagram', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Facebook"
            value={value.facebook}
            onChange={(e) => updateField('facebook', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="TikTok"
            value={value.tiktok}
            onChange={(e) => updateField('tiktok', e.target.value)}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}