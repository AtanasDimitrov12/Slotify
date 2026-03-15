import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';

import {
  cancelStaffAppointment,
  createStaffAppointment,
  listStaffAppointments,
  listStaffServices,
  updateStaffAppointment,
  updateStaffAppointmentStatus,
  type StaffAppointment,
} from '../../api/staffAppointments';

import ScheduleCalendar from './components/ScheduleCalendar';
import DayOverviewCard from './components/DayOverviewCard';
import SelectedAppointmentCard from './components/SelectedAppointmentCard';
import AddAppointmentDialog from './components/AddAppointmentDialog';
import EditAppointmentDialog from './components/EditAppointmentDialog';

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

export default function StaffDashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<string>(formatDateInput(new Date()));
  const [appointments, setAppointments] = React.useState<StaffAppointment[]>([]);
  const [services, setServices] = React.useState<
    { id: string; serviceId: string; name: string; durationMin: number; priceEUR: number; description?: string }[]
  >([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [moveError, setMoveError] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const selectedAppointment =
    appointments.find((item) => item.id === selectedAppointmentId) ?? null;

  const loadAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await listStaffAppointments(selectedDate);
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
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Schedule
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>
              Manage your appointments and review your day.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<TodayRoundedIcon />} onClick={goToToday}>
              Today
            </Button>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1,
                py: 0.5,
              }}
            >
              <IconButton size="small" onClick={goToPreviousDay}>
                <ChevronLeftRoundedIcon />
              </IconButton>

              <Typography minWidth={170} textAlign="center" fontWeight={700}>
                {formatHumanDate(selectedDate)}
              </Typography>

              <IconButton size="small" onClick={goToNextDay}>
                <ChevronRightRoundedIcon />
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add appointment
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {moveError ? <Alert severity="warning">{moveError}</Alert> : null}

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <ScheduleCalendar
              selectedDate={selectedDate}
              appointments={appointments}
              loading={loading}
              selectedAppointmentId={selectedAppointmentId}
              onSelectAppointment={setSelectedAppointmentId}
              onMoveAppointment={handleMoveAppointment}
            />
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <DayOverviewCard appointments={appointments} />

              <SelectedAppointmentCard
                selectedAppointment={selectedAppointment}
                onEdit={() => setEditOpen(true)}
                onCancel={handleCancel}
                onMarkDone={handleMarkDone}
                onMarkNoShow={handleMarkNoShow}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <AddAppointmentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        creating={creating}
        services={services}
        onSubmit={async (payload) => {
          try {
            setCreating(true);
            await createStaffAppointment({
              ...payload,
              startTime: new Date(`${selectedDate}T${payload.startTime}:00`).toISOString(),
            });
            setAddOpen(false);
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