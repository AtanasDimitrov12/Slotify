import * as React from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AddStaffDialog, { type AddStaffPayload } from './components/AddStaffDialog';
import ManageStaffTimeOffDialog from './components/ManageStaffTimeOffDialog';
import { createStaff, listStaff } from '../../api/staff';
import { getOwnerPendingTimeOffCounts } from '../../api/staffTimeOff';
import { landingColors, premium } from '../../components/landing/constants';
import { useToast } from '../../components/ToastProvider';

type StaffMember = {
    id: string;
    name: string;
    email: string;
    role: 'staff' | 'manager';
    pendingTimeOffCount: number;
};

export default function OwnerTeamPage() {
    const { showError } = useToast();
    const [items, setItems] = React.useState<StaffMember[]>([]);
    const [open, setOpen] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [error, setError] = React.useState('');

    const [timeOffDialogOpen, setTimeOffDialogOpen] = React.useState(false);
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);
    const [selectedStaffName, setSelectedStaffName] = React.useState('');

    const loadStaff = React.useCallback(async () => {
        try {
            const [staff, pendingCounts] = await Promise.all([
                listStaff(),
                getOwnerPendingTimeOffCounts(),
            ]);

            const pendingMap = new Map(
                pendingCounts.map((item) => [item.userId, item.pendingCount]),
            );

            const mapped: StaffMember[] = staff.map((m: any) => ({
                id: m.userId,
                name: m.name,
                email: m.email,
                role: m.role === 'manager' ? 'manager' : 'staff',
                pendingTimeOffCount: pendingMap.get(m.userId) ?? 0,
            }));

            setItems(mapped);
        } catch (err) {
            showError(err);
        }
    }, [showError]);

    React.useEffect(() => {
        void loadStaff();
    }, [loadStaff]);

    async function handleCreateStaff(payload: AddStaffPayload) {
        setCreating(true);

        try {
            const result = await createStaff({
                name: payload.name.trim(),
                email: payload.email.trim().toLowerCase(),
                password: payload.password,
            });

            const newItem: StaffMember = {
                id: result.account.userId,
                name: result.account.name,
                email: result.account.email,
                role: result.account.role === 'manager' ? 'manager' : 'staff',
                pendingTimeOffCount: 0,
            };

            setItems((prev) => [newItem, ...prev]);
            setOpen(false);
        } catch (err) {
            showError(err);
            throw err;
        } finally {
            setCreating(false);
        }
    }

    function handleOpenTimeOffDialog(staff: StaffMember) {
        setSelectedStaffId(staff.id);
        setSelectedStaffName(staff.name);
        setTimeOffDialogOpen(true);
    }

    return (
        <>
            <Stack spacing={4}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                        <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
                            Team
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
                            Manage your barbers and roles.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setOpen(true)}
                        sx={{
                            minHeight: 52,
                            px: 3,
                            borderRadius: 999,
                            fontWeight: 900,
                            bgcolor: landingColors.purple,
                            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                        }}
                    >
                        Add Staff
                    </Button>
                </Stack>

                {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

                <Grid container spacing={3}>
                    {items.length === 0 ? (
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px dashed', borderColor: '#CBD5E1', bgcolor: 'transparent' }}>
                                <CardContent sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: 800, color: '#64748B' }}>No staff members yet</Typography>
                                    <Typography sx={{ color: '#94A3B8', mt: 1 }}>
                                        Start by adding your first team member to manage their schedule.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        items.map((m) => (
                            <Grid item xs={12} lg={6} key={m.id}>
                                <Card
                                    sx={{
                                        borderRadius: `${premium.rLg * 4}px`,
                                        border: '1px solid',
                                        borderColor: 'rgba(15,23,42,0.06)',
                                        bgcolor: '#FFFFFF',
                                        boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 16px 48px rgba(15,23,42,0.08)',
                                            borderColor: alpha(landingColors.purple, 0.1),
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                                            <Box sx={{ p: 3, flex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        fontWeight: 1000,
                                                        fontSize: 24,
                                                        bgcolor: alpha(landingColors.purple, 0.08),
                                                        color: landingColors.purple,
                                                        border: `1px solid ${alpha(landingColors.purple, 0.15)}`,
                                                    }}
                                                >
                                                    {m.name.charAt(0).toUpperCase()}
                                                </Avatar>

                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A', lineHeight: 1.2 }}>
                                                        {m.name}
                                                    </Typography>
                                                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14, mt: 0.5 }}>
                                                        {m.email}
                                                    </Typography>
                                                    <Chip
                                                        label={m.role.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            mt: 1.5,
                                                            height: 22,
                                                            fontSize: 10,
                                                            fontWeight: 1000,
                                                            letterSpacing: 0.8,
                                                            bgcolor: alpha(landingColors.blue, 0.1),
                                                            color: '#0369A1',
                                                            border: `1px solid ${alpha(landingColors.blue, 0.2)}`,
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Box
                                                sx={{
                                                    p: 3,
                                                    bgcolor: alpha(landingColors.purple, 0.02),
                                                    borderLeft: { sm: '1px solid rgba(15,23,42,0.04)' },
                                                    borderTop: { xs: '1px solid rgba(15,23,42,0.04)', sm: 'none' },
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    minWidth: 200,
                                                }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    endIcon={<EastRoundedIcon />}
                                                    onClick={() => handleOpenTimeOffDialog(m)}
                                                    sx={{
                                                        borderRadius: 999,
                                                        fontWeight: 900,
                                                        borderColor: 'rgba(15,23,42,0.12)',
                                                        color: '#475569',
                                                        px: 3,
                                                        '&:hover': { bgcolor: '#FFF', borderColor: landingColors.purple },
                                                    }}
                                                >
                                                    Requests
                                                </Button>

                                                <Typography
                                                    sx={{
                                                        mt: 1.5,
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        color: m.pendingTimeOffCount > 0 ? landingColors.warning : '#94A3B8',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                    }}
                                                >
                                                    {m.pendingTimeOffCount > 0
                                                        ? `${m.pendingTimeOffCount} pending`
                                                        : 'No pending'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                <AddStaffDialog
                    open={open}
                    onClose={() => {
                        if (!creating) setOpen(false);
                    }}
                    onCreate={handleCreateStaff}
                />

                <ManageStaffTimeOffDialog
                    open={timeOffDialogOpen}
                    onClose={() => setTimeOffDialogOpen(false)}
                    staffId={selectedStaffId}
                    staffName={selectedStaffName}
                    onUpdated={loadStaff}
                />
            </Stack>

            {creating ? (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.18)',
                        zIndex: 1400,
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <CircularProgress sx={{ color: landingColors.purple }} />
                </Box>
            ) : null}
        </>
    );
}
