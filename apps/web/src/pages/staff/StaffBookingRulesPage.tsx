import * as React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
    alpha,
} from '@mui/material';
import StaffBookingRulesForm, {
    type StaffBookingRulesValues,
} from './components/StaffBookingRulesForm';
import {
    getMyStaffBookingRules,
    updateMyStaffBookingRules,
} from '../../api/bookingRules';
import { landingColors, premium } from '../../components/landing/constants';
import { useToast } from '../../components/ToastProvider';

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
    const { showError, showSuccess } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
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
            showError('Missing staff user id.');
            return;
        }

        setSaving(true);

        try {
            await updateMyStaffBookingRules({
                useGlobalSettings,
                overrides: useGlobalSettings ? undefined : rules,
            });

            showSuccess('Booking rules saved successfully.');
            await loadRules();
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
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
                            Booking Rules
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
                            Use salon-wide rules or define your own personal schedule behavior.
                        </Typography>
                    </Box>

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
                            whiteSpace: 'nowrap',
                            alignSelf: { xs: 'flex-start', md: 'center' },
                            bgcolor: landingColors.purple,
                            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Rules'}
                    </Button>
                </Box>

                {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

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
                        <Stack spacing={4}>
                            <Box sx={{ p: 2.5, borderRadius: 4, bgcolor: alpha(landingColors.purple, 0.04), border: `1px solid ${alpha(landingColors.purple, 0.1)}` }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={useGlobalSettings}
                                            onChange={(e) => handleToggleUseGlobal(e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: landingColors.purple },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: landingColors.purple },
                                            }}
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Follow salon default rules</Typography>}
                                />
                            </Box>

                            {useGlobalSettings ? (
                                <Alert severity="info" sx={{ borderRadius: 3, fontWeight: 600 }}>
                                    Your personal schedule currently inherits all rules from the salon owner.
                                </Alert>
                            ) : null}

                            <StaffBookingRulesForm
                                value={rules}
                                onChange={setRules}
                                disabled={useGlobalSettings}
                            />
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </>
    );
}
