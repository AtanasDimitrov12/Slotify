import {
  getMyTenants,
  landingColors,
  listStaffAppointments,
  type StaffAppointment,
} from '@barber/shared';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  Avatar,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [todayAppointments, setTodayAppointments] = React.useState<StaffAppointment[]>([]);
  const [weekAppointments, setWeekAppointments] = React.useState<StaffAppointment[]>([]);
  const [salons, setSalons] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const today = new Date();
        const todayStr = formatDateInput(today);

        const [todayRes, myTenants] = await Promise.all([
          listStaffAppointments({ date: todayStr }),
          getMyTenants(),
        ]);

        setTodayAppointments(todayRes);
        setSalons(myTenants);

        // Get this week's appointments (from Monday to Sunday)
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const monday = new Date(new Date(today).setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const weekRes = await listStaffAppointments({
          startDate: formatDateInput(monday),
          endDate: formatDateInput(sunday),
        });
        setWeekAppointments(weekRes);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  const upcoming = todayAppointments
    .filter((a) => new Date(a.startTime) > new Date() && a.status !== 'cancelled')
    .slice(0, 3);

  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;
  const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed').length;

  const nextAppointment = todayAppointments
    .filter((a) => new Date(a.startTime) > new Date() && a.status === 'confirmed')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const weeklyRevenue = weekAppointments.reduce(
    (acc, a) => acc + (a.status !== 'cancelled' ? a.priceEUR : 0),
    0,
  );

  const getSalonName = (tenantId: string) => {
    return salons.find((s) => s._id === tenantId)?.name || 'Salon';
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}
          >
            Welcome back!
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Here is what is happening across all your salons today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/staff/schedule')}
          sx={{
            borderRadius: 999,
            fontWeight: 900,
            px: 3,
            py: 1.5,
            bgcolor: landingColors.purple,
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.1)' },
          }}
        >
          View Full Schedule
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Today Summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(landingColors.purple, 0.1),
                    color: landingColors.purple,
                  }}
                >
                  <TodayRoundedIcon />
                </Avatar>
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
                  Today Summary
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Total Bookings</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{todayAppointments.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Confirmed</Typography>
                  <Typography sx={{ fontWeight: 800, color: landingColors.purple }}>
                    {confirmedToday}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>Completed</Typography>
                  <Typography sx={{ fontWeight: 800, color: landingColors.success }}>
                    {completedToday}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* This Week */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(landingColors.blue, 0.1),
                    color: landingColors.blue,
                  }}
                >
                  <CalendarMonthRoundedIcon />
                </Avatar>
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
                  This Week
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                    Weekly Appointments
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }}>{weekAppointments.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                    Revenue Estimate
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: landingColors.success }}>
                    €{weeklyRevenue}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  <TrendingUpRoundedIcon sx={{ color: landingColors.success, fontSize: 16 }} />
                  <Typography sx={{ color: landingColors.success, fontWeight: 700, fontSize: 12 }}>
                    Keep it up!
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Appointment / Free Slot */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
              bgcolor: nextAppointment ? alpha(landingColors.purple, 0.04) : '#FFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(landingColors.purple, 0.1),
                    color: landingColors.purple,
                  }}
                >
                  <AccessTimeRoundedIcon />
                </Avatar>
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
                  {nextAppointment ? 'Next Appointment' : 'Status'}
                </Typography>
              </Stack>
              {nextAppointment ? (
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 900, fontSize: 24, color: landingColors.purple }}>
                    {formatTime(nextAppointment.startTime)}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {nextAppointment.customerName}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#64748B' }}>
                    {nextAppointment.serviceName} · {getSalonName(nextAppointment.tenantId)}
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 800, fontSize: 20, color: landingColors.success }}>
                    Available Now
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontWeight: 600, mt: 1 }}>
                    You have no more confirmed bookings for today.
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Typography
            sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A', mb: 2 }}
          >
            Upcoming Today
          </Typography>

          {upcoming.length === 0 ? (
            <Card
              sx={{
                borderRadius: 4,
                border: '1px dashed rgba(15,23,42,0.12)',
                bgcolor: 'transparent',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <EventRoundedIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                  No more upcoming bookings for today.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {upcoming.map((a) => (
                <Card
                  key={a.id}
                  sx={{
                    borderRadius: 4,
                    border: '1px solid rgba(15,23,42,0.06)',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.02)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: landingColors.purple,
                      transform: 'translateX(4px)',
                    },
                  }}
                  onClick={() => navigate('/staff/schedule')}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                        <Typography
                          sx={{ fontWeight: 900, fontSize: 18, color: landingColors.purple }}
                        >
                          {formatTime(a.startTime)}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#94A3B8' }}>
                          {a.durationMin} min
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ opacity: 0.1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                          {a.customerName}
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#64748B' }}>
                          {a.serviceName} · {getSalonName(a.tenantId)}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha(landingColors.purple, 0.08),
                          color: landingColors.purple,
                        }}
                      >
                        <PersonRoundedIcon />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Typography
            sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A', mb: 2 }}
          >
            Daily Progress
          </Typography>
          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 4px 20px rgba(15,23,42,0.03)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#64748B' }}>
                      Day Completion
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                      {Math.round((completedToday / (todayAppointments.length || 1)) * 100)}%
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(landingColors.purple, 0.06),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(completedToday / (todayAppointments.length || 1)) * 100}%`,
                        bgcolor: landingColors.purple,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: alpha(landingColors.success, 0.1),
                      display: 'grid',
                      placeItems: 'center',
                      color: landingColors.success,
                    }}
                  >
                    <CheckCircleRoundedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                      {completedToday} Completed
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#64748B' }}>
                      Nice work today!
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
