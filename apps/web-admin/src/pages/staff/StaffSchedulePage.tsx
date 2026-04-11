import {
  type CustomerInsights,
  cancelStaffAppointment,
  createStaffAppointment,
  getCustomerInsights,
  landingColors,
  listStaffAppointments,
  listStaffServices,
  type StaffAppointment,
  updateStaffAppointment,
  updateStaffAppointmentStatus,
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
  const [selectedDate, setSelectedDate] = React.useState<string>(formatDateInput(new Date()));
  const [appointments, setAppointments] = React.useState<StaffAppointment[]>([]);
  const [services, setServices] = React.useState<
    {
      id: string;
      serviceId: string;
      name: string;
      durationMin: number;
      priceEUR: number;
      description?: string;
    }[]
  >([]);
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
      const result = await listStaffAppointments({ date: selectedDate });
      setAppointments(result);
      setSelectedAppointmentId((prev) =>
        prev && result.some((item) => item.id === prev) ? prev : null,
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
          alignItems={{ xs: 'stretch', lg: 'center' }}
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
              Manage appointments and optimize your day.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                bgcolor: '#FFF',
                p: 0.5,
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 2px 10px rgba(15,23,42,0.02)',
                alignItems: 'center',
              }}
            >
              <IconButton
                size="small"
                onClick={goToPreviousDay}
                sx={{
                  color: '#64748B',
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.05),
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
                  borderRadius: 2,
                  fontWeight: 700,
                  color: '#475569',
                  px: 2,
                  minWidth: 'auto',
                  height: 32,
                  fontSize: 13,
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.05),
                    color: landingColors.purple,
                  },
                }}
              >
                Today
              </Button>

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  px: 1,
                  borderLeft: '1px solid rgba(15,23,42,0.08)',
                  borderRight: '1px solid rgba(15,23,42,0.08)',
                }}
              >
                {formatHumanDate(selectedDate)}
              </Typography>

              <IconButton
                size="small"
                onClick={goToNextDay}
                sx={{
                  color: '#64748B',
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.05),
                    color: landingColors.purple,
                  },
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <ToggleButtonGroup
              exclusive
              value={viewMode}
              onChange={(_, value) => {
                if (value) setViewMode(value);
              }}
              sx={{
                bgcolor: '#FFF',
                p: 0.5,
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 2px 10px rgba(15,23,42,0.02)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  height: 32,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#64748B',
                  '&.Mui-selected': {
                    bgcolor: alpha(landingColors.purple, 0.1),
                    color: landingColors.purple,
                    '&:hover': {
                      bgcolor: alpha(landingColors.purple, 0.15),
                    },
                  },
                },
              }}
            >
              <ToggleButton value="smart">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <ViewAgendaRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Smart Day</span>
                </Stack>
              </ToggleButton>
              <ToggleButton value="timeline">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <ViewStreamRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Timeline</span>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAddOpen(true)}
              sx={{
                height: 44,
                px: 3,
                borderRadius: 3,
                fontWeight: 700,
                bgcolor: landingColors.purple,
                boxShadow: `0 8px 20px ${alpha(landingColors.purple, 0.25)}`,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: alpha(landingColors.purple, 0.9),
                  boxShadow: `0 10px 25px ${alpha(landingColors.purple, 0.35)}`,
                },
              }}
            >
              Add Appointment
            </Button>
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
                selectedAppointmentId={selectedAppointmentId}
                onSelectAppointment={setSelectedAppointmentId}
                onAddAppointmentAt={handleAddAppointmentAt}
                onViewInsights={handleViewInsights}
              />
            ) : (
              <ScheduleCalendar
                selectedDate={selectedDate}
                appointments={appointments}
                loading={loading}
                selectedAppointmentId={selectedAppointmentId}
                onSelectAppointment={setSelectedAppointmentId}
                onMoveAppointment={handleMoveAppointment}
                onViewInsights={handleViewInsights}
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
        initialStartTime={prefillStartTime}
        onSubmit={async (payload) => {
          try {
            setCreating(true);
            await createStaffAppointment({
              ...payload,
              startTime: new Date(`${selectedDate}T${payload.startTime}:00`).toISOString(),
            });
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
