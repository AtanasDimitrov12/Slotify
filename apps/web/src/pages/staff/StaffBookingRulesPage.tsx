import * as React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControlLabel,
    Snackbar,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import StaffBookingRulesForm, {
    type StaffBookingRulesValues,
} from './components/StaffBookingRulesForm';
import {
    getMyStaffBookingRules,
    updateMyStaffBookingRules,
} from '../../api/bookingRules';

const defaultRules: StaffBookingRulesValues = {
    bufferBefore: { enabled: false, minutes: 0 },
    bufferAfter: { enabled: true, minutes: 5 },
    minimumNoticeMinutes: 60,
    maximumDaysInAdvance: 30,
    autoConfirmReservations: true,
    allowBookingToEndAfterWorkingHours: false,
    allowCustomerChooseSpecificStaff: true,
};

export default function StaffBookingRulesPage() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [userId, setUserId] = React.useState('');
    const [useGlobalSettings, setUseGlobalSettings] = React.useState(true);
    const [rules, setRules] = React.useState<StaffBookingRulesValues>(defaultRules);
    const [globalRules, setGlobalRules] =
        React.useState<StaffBookingRulesValues>(defaultRules);

    const loadRules = React.useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getMyStaffBookingRules();

            setUserId(data.staffSettings?.userId ?? '');
            setUseGlobalSettings(data.staffSettings?.useGlobalSettings ?? true);
            setGlobalRules(data.globalSettings ?? defaultRules);
            setRules(data.effectiveSettings ?? defaultRules);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load booking rules');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void loadRules();
    }, [loadRules]);

    function handleToggleUseGlobal(checked: boolean) {
        setUseGlobalSettings(checked);

        if (checked) {
            setRules(globalRules);
        }
    }

    async function handleSave() {
        if (!userId) {
            setError('Missing staff user id.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await updateMyStaffBookingRules({
                useGlobalSettings,
                overrides: useGlobalSettings ? undefined : rules,
            });

            setSuccess('Booking rules saved successfully.');
            await loadRules();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save booking rules');
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
                        Booking rules
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                        Choose whether to use the salon booking rules or apply your own custom ones.
                    </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Stack spacing={3}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useGlobalSettings}
                                        onChange={(e) => handleToggleUseGlobal(e.target.checked)}
                                    />
                                }
                                label="Use salon default booking rules"
                            />

                            {useGlobalSettings ? (
                                <Alert severity="info">
                                    Your current schedule follows the salon-wide booking rules.
                                </Alert>
                            ) : null}

                            <StaffBookingRulesForm
                                value={rules}
                                onChange={setRules}
                                disabled={useGlobalSettings}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" onClick={handleSave} disabled={saving}>
                                    Save changes
                                </Button>
                            </Box>
                        </Stack>
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