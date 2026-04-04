import {
  type CustomerProfile,
  type CustomerReservation,
  getMyCustomerProfile,
  getMyReservations,
  listPublicTenants,
  type PublicTenantListItem,
  useAuth,
  useToast,
} from '@barber/shared';
import {
  CalendarMonthRounded,
  HistoryRounded,
  SettingsRounded,
} from '@mui/icons-material';
import {
  Avatar,
  alpha,
  Box,
  CircularProgress,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import BookingHistory from '../components/profile/BookingHistory';
import ProfileSettings from '../components/profile/ProfileSettings';
import UpcomingBookings from '../components/profile/UpcomingBookings';

const profileColors = {
  purple: '#7C6CFF',
  text: '#0F172A',
  textSoft: '#64748B',
  bgSoft: '#F8FAFC',
  border: 'rgba(15,23,42,0.08)',
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 1000, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', mt: 0.5, letterSpacing: 0.5 }}>{label}</Typography>
    </Box>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [allSalons, setAllSalons] = useState<PublicTenantListItem[]>([]);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, salonsData, resData] = await Promise.all([
        getMyCustomerProfile(),
        listPublicTenants(),
        getMyReservations(),
      ]);

      setProfile(profileData);
      setAllSalons(salonsData);
      setReservations(resData);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: profileColors.purple }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Failed to load profile.</Typography>
      </Box>
    );
  }

  const upcoming = reservations.filter(
    (r) =>
      (r.status === 'pending' || r.status === 'confirmed') && new Date(r.startTime) > new Date(),
  );
  const history = reservations.filter(
    (r) =>
      r.status === 'completed' ||
      r.status === 'cancelled' ||
      r.status === 'no-show' ||
      new Date(r.startTime) <= new Date(),
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        {/* HEADER / OVERVIEW CARD */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 5,
            bgcolor: '#10162B',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 20% 20%, rgba(124,108,255,0.15), transparent 40%),
                           radial-gradient(circle at 80% 80%, rgba(125,211,252,0.1), transparent 40%)`,
              pointerEvents: 'none',
            }}
          />
          <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              alignItems={{ xs: 'center', md: 'center' }}
              textAlign={{ xs: 'center', md: 'left' }}
            >
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: alpha(profileColors.purple, 0.2),
                  color: profileColors.purple,
                  fontSize: 48,
                  fontWeight: 900,
                  border: `4px solid rgba(255,255,255,0.1)`,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.24)',
                }}
              >
                {user?.name?.[0]}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 1000, letterSpacing: -1.5, mb: 0.5 }}>
                  {user?.name}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, mb: 3 }}>
                  {user?.email}
                </Typography>
                
                <Stack direction="row" spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <Stat label="Bookings" value={reservations.length} />
                  <Stat label="Upcoming" value={upcoming.length} />
                  <Stat label="Reviews" value={reservations.filter(r => r.review).length} />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* SUB NAV */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(15,23,42,0.08)' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 850,
                fontSize: 16,
                minWidth: 140,
                color: profileColors.textSoft,
                pb: 2,
                '&.Mui-selected': {
                  color: profileColors.purple,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: profileColors.purple,
                height: 4,
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <Tab icon={<CalendarMonthRounded sx={{ fontSize: 22 }} />} iconPosition="start" label="My Bookings" />
            <Tab icon={<SettingsRounded sx={{ fontSize: 22 }} />} iconPosition="start" label="Account Settings" />
          </Tabs>
        </Box>

        {/* TAB CONTENT */}
        <Box>
          {activeTab === 0 && (
            <Stack spacing={6}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <CalendarMonthRounded sx={{ color: profileColors.purple }} /> Upcoming
                  Appointments
                </Typography>
                <UpcomingBookings reservations={upcoming} />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <HistoryRounded sx={{ color: profileColors.textSoft }} /> Booking History
                </Typography>
                <BookingHistory reservations={history} onReviewAdded={loadData} />
              </Box>
            </Stack>
          )}

          {activeTab === 1 && (
            <ProfileSettings
              profile={profile}
              allSalons={allSalons}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
