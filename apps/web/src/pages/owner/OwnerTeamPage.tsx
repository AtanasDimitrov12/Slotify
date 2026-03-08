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
    Typography,
} from '@mui/material';
import AddStaffDialog, { type AddStaffPayload } from './components/AddStaffDialog';
import { createStaff, listStaff } from '../../api/staff';
import { useAuth } from '../../auth/AuthProvider';

type StaffMember = {
    id: string;
    name: string;
    email: string;
    role: 'staff' | 'manager';
};

export default function OwnerTeamPage() {
    const { user } = useAuth();

    const [items, setItems] = React.useState<StaffMember[]>([]);
    const [open, setOpen] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

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

    React.useEffect(() => {
        async function loadStaff() {
            try {
                const data = await listStaff();

                const mapped: StaffMember[] = data.map((m: any) => ({
                    id: m.userId,
                    name: m.name,
                    email: m.email,
                    role: m.role === 'manager' ? 'manager' : 'staff',
                }));

                setItems(mapped);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Failed to load staff members';
                setError(message);
            }
        }

        loadStaff();
    }, []);

    return (
        <>
            <Stack spacing={2.5}>
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

                <Grid container spacing={2}>
                    {items.length === 0 ? (
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
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
                            <Grid item xs={12} md={6} key={m.id}>
                                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                    <CardContent>
                                        <Typography fontWeight={900}>{m.name}</Typography>
                                        <Typography sx={{ opacity: 0.7 }}>{m.email}</Typography>
                                        <Typography sx={{ mt: 1, opacity: 0.8 }}>
                                            Role: <b>{m.role}</b>
                                        </Typography>
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