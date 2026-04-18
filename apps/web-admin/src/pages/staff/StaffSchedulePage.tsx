import {
  type AvailableTenant,
  type CustomerInsights,
  cancelStaffAppointment,
  createStaffAppointment,
  getCustomerInsights,
  getMyStaffBlockedSlots,
  getMyTenants,
  landingColors,
  listStaffAppointments,
  listStaffServices,
  type StaffAppointment,
  type StaffBlockedSlotItem,
  type StaffServiceOption,
  updateStaffAppointment,
  updateStaffAppointmentStatus,
  useAuth,
} from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import { Alert, alpha, Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import * as React from 'react';
import AddAppointmentDialog from './components/AddAppointmentDialog';
import CustomerInsightsPopup from './components/CustomerInsightsPopup';
import DayOverviewCard from './components/DayOverviewCard';
import EditAppointmentDialog from './components/EditAppointmentDialog';
import ScheduleAgenda from './components/ScheduleAgenda';
import ScheduleCalendar from './components/ScheduleCalendar';
import SelectedAppointmentCard from './components/SelectedAppointmentCard';

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHumanDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString([], {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export default function StaffSchedulePage() {
  const { user, switchTenant } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<string>(formatDateInput(new Date()));
  const [appointments, setAppointments] = React.useState<StaffAppointment[]>([]);
  const [blockedSlots, setBlockedSlots] = React.useState<StaffBlockedSlotItem[]>([]);
  const [services, setServices] = React.useState<StaffServiceOption[]>([]);
  const [salons, setSalons] = React.useState<AvailableTenant[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [moveError, setMoveError] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);

  const [customerInsights, setCustomerInsights] = React.useState<CustomerInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insightsOpen, setInsightsOpen] = React.useState(false);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const [viewMode, setViewMode] = React.useState<'smart' | 'timeline'>('smart');
  const [prefillStartTime, setPrefillStartTime] = React.useState<string | undefined>(undefined);

  const selectedAppointment =
    appointments.find((item) => item.id === selectedAppointmentId) ?? null;

  const loadAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [appts, slots, myTenants] = await Promise.all([
        listStaffAppointments({ date: selectedDate }),
        getMyStaffBlockedSlots(false),
        getMyTenants(),
      ]);

      const mappedTenants: AvailableTenant[] = myTenants
        .filter((t: any) => t._id && t.name)
        .map((t: any) => ({ _id: t._id, name: t.name }));

      setSalons(mappedTenants);
      const activeSlotsForDay = slots.filter((s) => s.date === selectedDate && s.isActive);

      setAppointments(appts);
      setBlockedSlots(activeSlotsForDay);
      setSelectedAppointmentId((prev) =>
        prev && appts.some((item) => item.id === prev) ? prev : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  React.useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  React.useEffect(() => {
    async function fetchInsights() {
      if (!selectedAppointmentId) {
        setCustomerInsights(null);
        return;
      }

      try {
        setInsightsLoading(true);
        const insights = await getCustomerInsights(selectedAppointmentId);
        setCustomerInsights(insights);
      } catch (err) {
        console.error('Failed to load customer insights', err);
        setCustomerInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    }

    void fetchInsights();
  }, [selectedAppointmentId]);

  const handleViewInsights = React.useCallback((id: string) => {
    setSelectedAppointmentId(id);
    setInsightsOpen(true);
  }, []);

  React.useEffect(() => {
    async function loadServices() {
      try {
        const result = await listStaffServices();
        setServices(result);
      } catch (err) {
        console.error(err);
      }
    }

    void loadServices();
  }, []);

  function handleAddAppointmentAt(time: string) {
    setPrefillStartTime(time);
    setAddOpen(true);
  }

  function goToPreviousDay() {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDateInput(date));
    setSelectedAppointmentId(null);
  }

  function goToNextDay() {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDateInput(date));
    setSelectedAppointmentId(null);
  }

  function goToToday() {
    setSelectedDate(formatDateInput(new Date()));
    setSelectedAppointmentId(null);
  }

  async function handleMoveAppointment(appointment: StaffAppointment, nextStartIso: string) {
    try {
      setMoveError('');

      await updateStaffAppointment(appointment.id, {
        startTime: nextStartIso,
      });

      await loadAppointments();
    } catch (err) {
      setMoveError(
        err instanceof Error
          ? err.message
          : 'Could not move the appointment. It may overlap with another booking.',
      );
    }
  }

  async function handleEditAppointment(payload: {
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
    status: StaffAppointment['status'];
  }) {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);

      await updateStaffAppointment(selectedAppointment.id, {
        startTime: new Date(`${selectedDate}T${payload.startTime}:00`).toISOString(),
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        notes: payload.notes,
      });

      if (payload.status !== selectedAppointment.status) {
        await updateStaffAppointmentStatus(selectedAppointment.id, payload.status);
      }

      setEditOpen(false);
      await loadAppointments();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkDone() {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      await updateStaffAppointmentStatus(selectedAppointment.id, 'completed');
      await loadAppointments();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkNoShow() {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      await updateStaffAppointmentStatus(selectedAppointment.id, 'no-show');
      await loadAppointments();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!selectedAppointment) return;
    try {
      setActionLoading(true);
      await cancelStaffAppointment(selectedAppointment.id);
      await loadAppointments();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'flex-start' }}
          spacing={3}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: -1,
                color: '#0F172A',
                mb: 0.5,
              }}
            >
              Your Schedule
            </Typography>

            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: { xs: 15, md: 16 } }}>
              Manage appointments across all your salons and optimize your day.
            </Typography>
          </Box>

          <Stack
            spacing={1.5}
            sx={{
              width: { xs: '100%', lg: 'auto' },
              alignItems: { xs: 'stretch', lg: 'flex-end' },
            }}
          >
            {/* Date Navigation */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                bgcolor: '#FFF',
                p: 0.5,
                borderRadius: 999,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                alignItems: 'center',
                height: 48,
                width: { xs: '100%', sm: 'fit-content' },
                alignSelf: { xs: 'stretch', sm: 'flex-start', lg: 'flex-end' },
              }}
            >
              <IconButton
                size="small"
                onClick={goToPreviousDay}
                sx={{
                  color: '#64748B',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.08),
                    color: landingColors.purple,
                  },
                }}
              >
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>

              <Button
                variant="text"
                onClick={goToToday}
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  color: '#475569',
                  px: 2,
                  minWidth: 74,
                  height: 36,
                  fontSize: 14,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.08),
                    color: landingColors.purple,
                  },
                }}
              >
                Today
              </Button>

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 13, sm: 15 },
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  px: { xs: 1.5, sm: 2.5 },
                  borderLeft: '1px solid rgba(15,23,42,0.08)',
                  borderRight: '1px solid rgba(15,23,42,0.08)',
                  flex: { xs: 1, sm: 'unset' },
                  textAlign: 'center',
                }}
              >
                {formatHumanDate(selectedDate)}
              </Typography>

              <IconButton
                size="small"
                onClick={goToNextDay}
                sx={{
                  color: '#64748B',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.08),
                    color: landingColors.purple,
                  },
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* View Toggle + Add Button */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'flex-end',
              }}
            >
              <ToggleButtonGroup
                exclusive
                value={viewMode}
                onChange={(_, value) => {
                  if (value) setViewMode(value);
                }}
                sx={{
                  bgcolor: '#FFF',
                  p: 0.5,
                  borderRadius: 999,
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                  height: 48,
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiToggleButtonGroup-grouped': {
                    margin: 0,
                    border: 0,
                    '&:not(:first-of-type)': {
                      borderRadius: 999,
                      borderLeft: 0,
                    },
                    '&:first-of-type': {
                      borderRadius: 999,
                    },
                  },
                  '& .MuiToggleButton-root': {
                    flex: { xs: 1, sm: 'unset' },
                    border: 'none',
                    borderRadius: 999,
                    px: { xs: 1.5, md: 2.5 },
                    height: 38,
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: 14,
                    color: '#64748B',
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(landingColors.purple, 0.12),
                      color: landingColors.purple,
                      '&:hover': {
                        bgcolor: alpha(landingColors.purple, 0.16),
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="smart">
                  <ViewAgendaRoundedIcon sx={{ fontSize: 19 }} />
                  <Box component="span">Smart Day</Box>
                </ToggleButton>

                <ToggleButton value="timeline">
                  <ViewStreamRoundedIcon sx={{ fontSize: 19 }} />
                  <Box component="span">Timeline</Box>
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setAddOpen(true)}
                sx={{
                  height: 48,
                  px: 3.5,
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: 15,
                  bgcolor: landingColors.purple,
                  boxShadow: `0 12px 28px ${alpha(landingColors.purple, 0.28)}`,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minWidth: { xs: '100%', sm: 210 },
                  '&:hover': {
                    bgcolor: landingColors.purple,
                    filter: 'brightness(1.05)',
                    boxShadow: `0 14px 32px ${alpha(landingColors.purple, 0.36)}`,
                  },
                }}
              >
                Add Appointment
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}
        {moveError ? (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            {moveError}
          </Alert>
        ) : null}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8.5}>
            {viewMode === 'smart' ? (
              <ScheduleAgenda
                selectedDate={selectedDate}
                appointments={appointments}
                blockedSlots={blockedSlots}
                selectedAppointmentId={selectedAppointmentId}
                onSelectAppointment={setSelectedAppointmentId}
                onAddAppointmentAt={handleAddAppointmentAt}
                onViewInsights={handleViewInsights}
                salons={salons}
              />
            ) : (
              <ScheduleCalendar
                selectedDate={selectedDate}
                appointments={appointments}
                blockedSlots={blockedSlots}
                loading={loading}
                selectedAppointmentId={selectedAppointmentId}
                onSelectAppointment={setSelectedAppointmentId}
                onMoveAppointment={handleMoveAppointment}
                onViewInsights={handleViewInsights}
                salons={salons}
              />
            )}
          </Grid>

          <Grid item xs={12} lg={3.5}>
            <Stack spacing={3}>
              <DayOverviewCard appointments={appointments} />

              <SelectedAppointmentCard
                selectedAppointment={selectedAppointment}
                onEdit={() => setEditOpen(true)}
                onCancel={handleCancel}
                onMarkDone={handleMarkDone}
                onMarkNoShow={handleMarkNoShow}
                onViewInsights={() => setInsightsOpen(true)}
                salons={salons}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <CustomerInsightsPopup
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        insights={customerInsights}
        loading={insightsLoading}
      />

      <AddAppointmentDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setPrefillStartTime(undefined);
        }}
        creating={creating}
        services={services}
        salons={salons}
        initialStartTime={prefillStartTime}
        onSubmit={async (payload) => {
          try {
            setCreating(true);
            const originalTenantId = user?.tenantId;

            // Switch to the target salon if different
            if (payload.tenantId !== originalTenantId) {
              await switchTenant(payload.tenantId);
            }

            try {
              await createStaffAppointment({
                staffServiceAssignmentId: payload.staffServiceAssignmentId,
                startTime: new Date(`${selectedDate}T${payload.startTime}:00`).toISOString(),
                customerName: payload.customerName,
                customerPhone: payload.customerPhone,
                customerEmail: payload.customerEmail,
                notes: payload.notes,
              });
            } finally {
              // Switch back to original salon if we switched away
              if (originalTenantId && payload.tenantId !== originalTenantId) {
                await switchTenant(originalTenantId);
              }
            }

            setAddOpen(false);
            setPrefillStartTime(undefined);
            await loadAppointments();
          } finally {
            setCreating(false);
          }
        }}
      />

      <EditAppointmentDialog
        open={editOpen}
        appointment={selectedAppointment}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditAppointment}
        saving={actionLoading}
      />
    </>
  );
}
