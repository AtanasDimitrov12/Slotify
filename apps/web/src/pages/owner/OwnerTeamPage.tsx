import * as React from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import AddStaffDialog, { type AddStaffPayload } from './components/AddStaffDialog';

type StaffMember = {
    id: string;
    name: string;
    email: string;
    role: 'staff' | 'manager';
};

const seed: StaffMember[] = [
    { id: '1', name: 'John Barber', email: 'john@fadedistrict.com', role: 'manager' },
    { id: '2', name: 'Mila Cuts', email: 'mila@fadedistrict.com', role: 'staff' },
];

export default function OwnerTeamPage() {
    const [items, setItems] = React.useState<StaffMember[]>(seed);
    const [open, setOpen] = React.useState(false);

    async function handleCreateStaff(payload: AddStaffPayload) {
        const newItem: StaffMember = {
            id: String(Date.now()),
            name: payload.name,
            email: payload.email,
            role: 'staff',
        };

        // TODO later:
        // await api.createStaff(payload)

        setItems((p) => [newItem, ...p]);
    }

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={900}>
                        Team
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>Add staff accounts and manage roles.</Typography>
                </Box>

                <Button variant="contained" onClick={() => setOpen(true)}>
                    Add staff
                </Button>
            </Box>

            <Grid container spacing={2}>
                {items.map((m) => (
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
                ))}
            </Grid>

            <AddStaffDialog
                open={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreateStaff}
            />
        </Stack>
    );
}