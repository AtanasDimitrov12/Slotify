import * as React from 'react';
import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Snackbar,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import AddStaffDialog, { type AddStaffPayload } from './components/AddStaffDialog';
import ManageStaffTimeOffDialog from './components/ManageStaffTimeOffDialog';
import { createStaff, listStaff } from '../../api/staff';
import { getOwnerPendingTimeOffCounts } from '../../api/staffTimeOff';

type StaffMember = {
    id: string;
    name: string;
    email: string;
    role: 'staff' | 'manager';
    pendingTimeOffCount: number;
};

export default function OwnerTeamPage() {
    const [items, setItems] = React.useState<StaffMember[]>([]);
    const [open, setOpen] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

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
            const message =
                err instanceof Error ? err.message : 'Failed to load staff members';
            setError(message);
        }
    }, []);

    React.useEffect(() => {
        void loadStaff();
    }, [loadStaff]);

    async function handleCreateStaff(payload: AddStaffPayload) {
        setCreating(true);
        setError('');

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
            setSuccess('Staff member created successfully.');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to create staff member';
            setError(message);
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
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" fontWeight={900}>
                            Team
                        </Typography>
                        <Typography sx={{ opacity: 0.7 }}>
                            Add staff accounts and manage roles.
                        </Typography>
                    </Box>

                    <Button variant="contained" onClick={() => setOpen(true)}>
                        Add staff
                    </Button>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Box sx={{ maxWidth: 1100 }}>
                    <Grid container spacing={2.5}>
                        {items.length === 0 ? (
                            <Grid item xs={12}>
                                <Card variant="outlined" sx={{ borderRadius: 4, maxWidth: 720 }}>
                                    <CardContent>
                                        <Typography fontWeight={800}>No staff members yet</Typography>
                                        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
                                            Create your first team member to start managing bookings and schedules.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) : (
                            items.map((m) => (
                                <Grid item xs={12} lg={6} key={m.id}>
                                    <Card
                                        variant="outlined"
                                        sx={(theme) => ({
                                            borderRadius: 5,
                                            overflow: 'hidden',
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                                            backgroundColor: theme.palette.background.paper,
                                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
                                                borderColor: alpha(theme.palette.primary.main, 0.24),
                                            },
                                            '&:hover .request-btn': {
                                                borderColor: alpha(theme.palette.primary.main, 0.45),
                                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            },
                                        })}
                                    >
                                        <CardContent sx={{ p: 0 }}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 220px' },
                                                    alignItems: 'stretch',
                                                }}
                                            >
                                                <Box sx={{ p: 2.5 }}>
                                                    <Stack direction="row" spacing={1.75} alignItems="center">
                                                        <Avatar
                                                            sx={{
                                                                width: 56,
                                                                height: 56,
                                                                fontWeight: 900,
                                                                fontSize: 28,
                                                                bgcolor: alpha('#000', 0.08),
                                                                color: 'text.primary',
                                                            }}
                                                        >
                                                            {m.name.charAt(0).toUpperCase()}
                                                        </Avatar>

                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography
                                                                fontWeight={900}
                                                                sx={{
                                                                    lineHeight: 1.15,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                {m.name}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    mt: 0.4,
                                                                    color: 'text.secondary',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                {m.email}
                                                            </Typography>

                                                            <Chip
                                                                label={m.role === 'manager' ? 'Manager' : 'Staff'}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    mt: 1.1,
                                                                    borderRadius: 2,
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        </Box>
                                                    </Stack>
                                                </Box>

                                                <Box
                                                    sx={(theme) => ({
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        px: 2.5,
                                                        py: 2.5,
                                                        borderLeft: {
                                                            xs: 'none',
                                                            sm: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                                        },
                                                        borderTop: {
                                                            xs: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                                                            sm: 'none',
                                                        },
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.015),
                                                    })}
                                                >
                                                    <Button
                                                        className="request-btn"
                                                        variant="outlined"
                                                        endIcon={<EastRoundedIcon />}
                                                        onClick={() => handleOpenTimeOffDialog(m)}
                                                        sx={{
                                                            minWidth: 190,
                                                            borderRadius: 3,
                                                            px: 2.25,
                                                            py: 1.1,
                                                            fontWeight: 800,
                                                            textTransform: 'none',
                                                            transition: 'all 0.18s ease',
                                                        }}
                                                    >
                                                        Review requests
                                                    </Button>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mt: 1,
                                                            fontWeight: 600,
                                                            color: m.pendingTimeOffCount > 0 ? 'warning.main' : 'text.secondary',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {m.pendingTimeOffCount > 0
                                                            ? `${m.pendingTimeOffCount} pending ${m.pendingTimeOffCount === 1 ? 'request' : 'requests'}`
                                                            : 'No pending requests'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>

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

            <Snackbar
                open={Boolean(success)}
                autoHideDuration={3000}
                onClose={() => setSuccess('')}
            >
                <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
                    {success}
                </Alert>
            </Snackbar>

            {creating ? (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.18)',
                        zIndex: 1400,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : null}
        </>
    );
}