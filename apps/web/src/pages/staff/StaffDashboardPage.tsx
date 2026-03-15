import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import {
  cancelStaffAppointment,
  createStaffAppointment,
  listStaffAppointments,
  listStaffServices,
  updateStaffAppointmentStatus,
  type StaffAppointment,
} from '../../api/staffAppointments';

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const SLOT_HEIGHT = 72;

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

function parseTimeToMinutes(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

function getAppointmentTop(startTime: string) {
  const startMinutes = parseTimeToMinutes(startTime);
  const startOfSchedule = 8 * 60;
  return ((startMinutes - startOfSchedule) / 60) * SLOT_HEIGHT;
}

function getAppointmentHeight(durationMin: number) {
  return Math.max((durationMin / 60) * SLOT_HEIGHT, 44);
}

function formatTimeOnly(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusChip({ status }: { status: StaffAppointment['status'] }) {
  const config =
    status === 'confirmed' || status === 'pending'
      ? { label: status === 'pending' ? 'Pending' : 'Upcoming', color: 'primary' as const }
      : status === 'completed'
        ? { label: 'Done', color: 'success' as const }
        : status === 'no-show'
          ? { label: 'No-show', color: 'error' as const }
          : { label: 'Cancelled', color: 'default' as const };

  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
}

export default function StaffDashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<string>(formatDateInput(new Date()));
  const [appointments, setAppointments] = React.useState<StaffAppointment[]>([]);
  const [services, setServices] = React.useState<
    { id: string; name: string; durationMin: number; priceEUR: number }[]
  >([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [addOpen, setAddOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const [staffServiceAssignmentId, setStaffServiceAssignmentId] = React.useState('');
  const [startTime, setStartTime] = React.useState('10:00');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const selectedAppointment =
    appointments.find((item) => item.id === selectedAppointmentId) ?? null;

  const totalBookedMinutes = appointments.reduce((sum, item) => sum + item.durationMin, 0);
  const estimatedRevenue = appointments.length * 25;

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

  function resetAddForm() {
    setStaffServiceAssignmentId('');
    setStartTime('10:00');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
  }

  async function handleCreateAppointment() {
    if (!staffServiceAssignmentId || !customerName.trim() || !customerPhone.trim() || !startTime) {
      return;
    }

    try {
      setCreating(true);

      await createStaffAppointment({
        staffServiceAssignmentId,
        startTime: new Date(`${selectedDate}T${startTime}:00`).toISOString(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setAddOpen(false);
      resetAddForm();
      await loadAppointments();
    } finally {
      setCreating(false);
    }
  }

  async function handleMarkDone() {
    if (!selectedAppointment) return;
    await updateStaffAppointmentStatus(selectedAppointment.id, 'completed');
    await loadAppointments();
  }

  async function handleMarkNoShow() {
    if (!selectedAppointment) return;
    await updateStaffAppointmentStatus(selectedAppointment.id, 'no-show');
    await loadAppointments();
  }

  async function handleCancel() {
    if (!selectedAppointment) return;
    await cancelStaffAppointment(selectedAppointment.id);
    await loadAppointments();
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

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" fontWeight={900}>
                    {formatHumanDate(selectedDate)}
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      height: HOURS.length * SLOT_HEIGHT,
                      overflow: 'auto',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {HOURS.map((hour, index) => (
                      <Box
                        key={hour}
                        sx={{
                          position: 'absolute',
                          top: index * SLOT_HEIGHT,
                          left: 0,
                          right: 0,
                          height: SLOT_HEIGHT,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 16,
                            width: 56,
                            opacity: 0.65,
                            fontWeight: 700,
                          }}
                        >
                          {`${String(hour).padStart(2, '0')}:00`}
                        </Typography>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 88,
                            right: 16,
                            bottom: 0,
                            borderLeft: '1px dashed',
                            borderColor: 'divider',
                          }}
                        />
                      </Box>
                    ))}

                    {appointments.map((appointment) => {
                      const selected = selectedAppointmentId === appointment.id;

                      return (
                        <Box
                          key={appointment.id}
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                          sx={{
                            position: 'absolute',
                            top: getAppointmentTop(appointment.startTime),
                            left: 104,
                            right: 16,
                            height: getAppointmentHeight(appointment.durationMin),
                            borderRadius: 2.5,
                            p: 1.5,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: selected ? 'primary.main' : 'divider',
                            bgcolor: selected ? 'primary.50' : 'background.paper',
                            boxShadow: selected ? '0 0 0 1px rgba(25,118,210,0.2)' : 'none',
                            overflow: 'hidden',
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography fontWeight={800}>
                                {formatTimeOnly(appointment.startTime)} · {appointment.customerName}
                              </Typography>
                              <StatusChip status={appointment.status} />
                            </Stack>

                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                              {appointment.serviceName} · {appointment.durationMin} min
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight={900} sx={{ mb: 1.5 }}>
                    Day overview
                  </Typography>

                  <Stack spacing={1}>
                    <Typography>
                      Appointments: <b>{appointments.length}</b>
                    </Typography>
                    <Typography>
                      Booked time: <b>{totalBookedMinutes} min</b>
                    </Typography>
                    <Typography>
                      Estimated revenue: <b>€{estimatedRevenue}</b>
                    </Typography>
                    <Typography>
                      No-shows:{' '}
                      <b>{appointments.filter((a) => a.status === 'no-show').length}</b>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight={900} sx={{ mb: 1.5 }}>
                    Selected appointment
                  </Typography>

                  {selectedAppointment ? (
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeRoundedIcon fontSize="small" />
                        <Typography>
                          {formatTimeOnly(selectedAppointment.startTime)} ·{' '}
                          {selectedAppointment.durationMin} min
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonRoundedIcon fontSize="small" />
                        <Typography>{selectedAppointment.customerName}</Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <ContentCutRoundedIcon fontSize="small" />
                        <Typography>{selectedAppointment.serviceName}</Typography>
                      </Stack>

                      <StatusChip status={selectedAppointment.status} />

                      <Divider sx={{ my: 1 }} />

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button variant="outlined" size="small" disabled>
                          Edit
                        </Button>
                        <Button variant="outlined" size="small" color="error" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button variant="contained" size="small" onClick={handleMarkDone}>
                          Mark done
                        </Button>
                        <Button variant="outlined" size="small" onClick={handleMarkNoShow}>
                          No-show
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography sx={{ opacity: 0.7 }}>
                      Select an appointment from the schedule to manage it.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add appointment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Service"
              value={staffServiceAssignmentId}
              onChange={(e) => setStaffServiceAssignmentId(e.target.value)}
              fullWidth
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} · {service.durationMin} min · €{service.priceEUR}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="time"
              label="Start time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Customer phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              fullWidth
            />

            <TextField
              label="Customer email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleCreateAppointment} disabled={creating}>
            {creating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}