import {
  createStaff,
  getOwnerPendingTimeOffCounts,
  landingColors,
  listStaff,
  premium,
  useToast,
} from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import {
  Alert,
  Avatar,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import * as React from 'react';
import AddStaffDialog, { type AddStaffPayload } from './components/AddStaffDialog';
import ManageStaffTimeOffDialog from './components/ManageStaffTimeOffDialog';

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: 'staff';
  pendingTimeOffCount: number;
};

type StaffListItem = {
  userId: string;
  name: string;
  email: string;
  role?: string;
};

type PendingTimeOffCount = {
  userId: string;
  pendingCount: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function OwnerTeamPage() {
  const { showError } = useToast();
  const [items, setItems] = React.useState<StaffMember[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [timeOffDialogOpen, setTimeOffDialogOpen] = React.useState(false);
  const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);
  const [selectedStaffName, setSelectedStaffName] = React.useState('');

  const loadStaff = React.useCallback(async () => {
    try {
      setError(null);

      const [staff, pendingCounts] = await Promise.all([
        listStaff() as Promise<StaffListItem[]>,
        getOwnerPendingTimeOffCounts() as Promise<PendingTimeOffCount[]>,
      ]);

      const pendingMap = new Map(
        pendingCounts.map((item) => [item.userId, item.pendingCount] as const),
      );

      const mapped: StaffMember[] = staff.map((member) => ({
        id: member.userId,
        name: member.name,
        email: member.email,
        role: 'staff',
        pendingTimeOffCount: pendingMap.get(member.userId) ?? 0,
      }));

      setItems(mapped);
    } catch (caughtError: unknown) {
      const message = getErrorMessage(caughtError);
      setError(message);
      showError(caughtError);
    }
  }, [showError]);

  React.useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  async function handleCreateStaff(payload: AddStaffPayload) {
    setCreating(true);

    try {
      setError(null);

      const result = await createStaff({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      const newItem: StaffMember = {
        id: result.account.userId,
        name: result.account.name,
        email: result.account.email,
        role: 'staff',
        pendingTimeOffCount: 0,
      };

      setItems((prev) => [newItem, ...prev]);
      setOpen(false);
    } catch (caughtError: unknown) {
      const message = getErrorMessage(caughtError);
      setError(message);
      showError(caughtError);
      throw caughtError;
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          spacing={3}
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 1000,
                fontSize: { xs: 32, sm: 36 },
                letterSpacing: -1.5,
                color: '#0F172A',
              }}
            >
              Team
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}>
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
              width: { xs: '100%', sm: 'auto' },
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: landingColors.purple,
              boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            }}
          >
            Add Staff
          </Button>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          {items.length === 0 ? (
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: `${premium.rLg * 4}px`,
                  border: '1px dashed',
                  borderColor: '#CBD5E1',
                  bgcolor: 'transparent',
                }}
              >
                <CardContent sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: '#64748B' }}>
                    No staff members yet
                  </Typography>
                  <Typography sx={{ color: '#94A3B8', mt: 1 }}>
                    Start by adding your first team member to manage their schedule.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            items.map((member) => (
              <Grid item xs={12} lg={6} key={member.id}>
                <Card
                  sx={{
                    borderRadius: `${premium.rLg * 3}px`,
                    border: '1px solid',
                    borderColor: 'rgba(15,23,42,0.06)',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 8px 30px rgba(15,23,42,0.03)',
                    transition: 'all 0.2s ease',
                    maxWidth: { xs: 340, sm: 'none' },
                    mx: 'auto',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 16px 48px rgba(15,23,42,0.08)',
                      borderColor: alpha(landingColors.purple, 0.1),
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box
                        sx={{
                          p: { xs: 2, sm: 3 },
                          flex: 1,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'center',
                          textAlign: { xs: 'center', sm: 'left' },
                          gap: { xs: 1.5, sm: 2.5 },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 48, sm: 64 },
                            height: { xs: 48, sm: 64 },
                            fontWeight: 1000,
                            fontSize: { xs: 18, sm: 24 },
                            bgcolor: alpha(landingColors.purple, 0.08),
                            color: landingColors.purple,
                            border: `1px solid ${alpha(landingColors.purple, 0.15)}`,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 1000,
                              fontSize: { xs: 16, sm: 18 },
                              color: '#0F172A',
                              lineHeight: 1.2,
                            }}
                          >
                            {member.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: '#64748B',
                              fontWeight: 600,
                              fontSize: { xs: 12, sm: 14 },
                              mt: 0.25,
                              wordBreak: 'break-word',
                            }}
                          >
                            {member.email}
                          </Typography>
                          <Chip
                            label={member.role.toUpperCase()}
                            size="small"
                            sx={{
                              mt: 1,
                              height: 20,
                              fontSize: 9,
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
                          p: { xs: 2, sm: 3 },
                          bgcolor: alpha(landingColors.purple, 0.01),
                          borderLeft: { sm: '1px solid rgba(15,23,42,0.04)' },
                          borderTop: { xs: '1px solid rgba(15,23,42,0.04)', sm: 'none' },
                          display: 'flex',
                          flexDirection: { xs: 'row', sm: 'column' },
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: { xs: 2, sm: 0 },
                          minWidth: { sm: 180 },
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<EastRoundedIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleOpenTimeOffDialog(member)}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            fontSize: { xs: 12, sm: 14 },
                            borderColor: 'rgba(15,23,42,0.12)',
                            color: '#475569',
                            px: { xs: 2, sm: 3 },
                            '&:hover': {
                              bgcolor: '#FFF',
                              borderColor: landingColors.purple,
                            },
                          }}
                        >
                          Requests
                        </Button>

                        <Typography
                          sx={{
                            mt: { xs: 0, sm: 1.5 },
                            fontWeight: 800,
                            fontSize: { xs: 10, sm: 12 },
                            color:
                              member.pendingTimeOffCount > 0 ? landingColors.warning : '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {member.pendingTimeOffCount > 0
                            ? `${member.pendingTimeOffCount} pending`
                            : 'None'}
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
            if (!creating) {
              setOpen(false);
            }
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
