import * as React from 'react';
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';

export type GeneralSettingsValues = {
    salonName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    timezone: string;
};

type Props = {
    value: GeneralSettingsValues;
    onChange: (next: GeneralSettingsValues) => void;
};

const timezoneOptions = ['Europe/Amsterdam', 'Europe/Sofia', 'Europe/London'];

export default function GeneralSettingsForm({ value, onChange }: Props) {
    function updateField<K extends keyof GeneralSettingsValues>(field: K, fieldValue: GeneralSettingsValues[K]) {
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
                        label="Address"
                        value={value.address}
                        onChange={(e) => updateField('address', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="City"
                        value={value.city}
                        onChange={(e) => updateField('city', e.target.value)}
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
            </Grid>
        </Stack>
    );
}