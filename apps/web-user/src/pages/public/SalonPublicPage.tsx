import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  Container,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  getPublicTenantBySlug,
  type TenantAddress,
  type WeeklyOpeningHours,
} from '../../api/publicTenants';
import { Page } from '../../layout/Page';
import BookingDialog from '../../components/booking/BookingDialog';
import { landingColors, premium } from '../../components/landing/constants';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ContactSupportRoundedIcon from '@mui/icons-material/ContactSupportRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

function formatAddress(address?: TenantAddress) {
  if (!address) return 'Address not provided';

  return [
    [address.street, address.houseNumber].filter(Boolean).join(' '),
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

const orderedDays: Array<{ key: keyof WeeklyOpeningHours; label: string }> = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function SalonPublicPage() {
  const { slug = '' } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getPublicTenantBySlug>> | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await getPublicTenantBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load salon');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      void load();
    }
  }, [slug]);

  return (
    <Page showFooter>
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
          <CircularProgress sx={{ color: landingColors.purple }} />
        </Box>
      ) : error || !data ? (
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 700 }}>{error || 'Salon not found'}</Alert>
        </Container>
      ) : (
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Stack spacing={6}>
              <Box>
                <Typography sx={{ fontWeight: 1000, fontSize: { xs: 40, md: 64 }, letterSpacing: -2, color: '#0F172A', lineHeight: 1 }}>
                  {data.tenant.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: '#64748B' }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                    {formatAddress(data.details?.address)}
                  </Typography>
                </Stack>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={4}>
                    <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px solid', borderColor: 'rgba(15,23,42,0.06)', bgcolor: '#FFFFFF', boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(landingColors.purple, 0.08), display: 'grid', placeItems: 'center', color: landingColors.purple }}>
                              <ContactSupportRoundedIcon fontSize="small" />
                            </Box>
                            <Typography sx={{ fontWeight: 1000, fontSize: 22, color: '#0F172A' }}>
                              About the Salon
                            </Typography>
                          </Stack>
                          <Typography sx={{ color: '#475569', fontSize: 17, lineHeight: 1.8, fontWeight: 500 }}>
                            {data.details?.notes || 'Experience premium grooming services in a modern and welcoming atmosphere. Our expert team is dedicated to providing you with the best style and care.'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Box>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<CalendarMonthRoundedIcon />}
                        onClick={() => setBookingOpen(true)}
                        sx={{
                          minHeight: 72,
                          borderRadius: 999,
                          fontSize: 20,
                          fontWeight: 1000,
                          bgcolor: landingColors.purple,
                          boxShadow: `0 20px 50px ${alpha(landingColors.purple, 0.3)}`,
                          '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
                        }}
                      >
                        Book Appointment Now
                      </Button>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack spacing={4}>
                    <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px solid', borderColor: 'rgba(15,23,42,0.06)', bgcolor: '#FFFFFF', boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                          <Typography sx={{ fontWeight: 1000, fontSize: 20, color: '#0F172A' }}>
                            Contact Details
                          </Typography>

                          <Stack spacing={2}>
                            <Box>
                              <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Email</Typography>
                              <Typography sx={{ fontWeight: 700, color: '#475569' }}>{data.details?.contactEmail || 'Not provided'}</Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Phone</Typography>
                              <Typography sx={{ fontWeight: 700, color: '#475569' }}>{data.details?.contactPhone || 'Not provided'}</Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Manager</Typography>
                              <Typography sx={{ fontWeight: 700, color: '#475569' }}>{data.details?.contactPersonName || 'Not provided'}</Typography>
                            </Box>
                          </Stack>

                          <Stack spacing={1.5}>
                            {data.details?.websiteUrl ? (
                              <Button
                                variant="outlined"
                                fullWidth
                                component="a"
                                href={data.details.websiteUrl}
                                target="_blank"
                                sx={{ borderRadius: 999, fontWeight: 900 }}
                              >
                                Official Website
                              </Button>
                            ) : null}

                            {data.details?.socialLinks?.instagram ? (
                              <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                component="a"
                                href={data.details.socialLinks.instagram}
                                target="_blank"
                                sx={{ borderRadius: 999, fontWeight: 900 }}
                              >
                                Instagram
                              </Button>
                            ) : null}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px solid', borderColor: 'rgba(15,23,42,0.06)', bgcolor: '#FFFFFF', boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <AccessTimeRoundedIcon sx={{ color: landingColors.purple }} />
                            <Typography sx={{ fontWeight: 1000, fontSize: 20, color: '#0F172A' }}>
                              Opening Hours
                            </Typography>
                          </Stack>

                          {data.details?.openingHours ? (
                            <Stack spacing={1.5}>
                              {orderedDays.map(({ key, label }) => {
                                const slots = data.details?.openingHours?.[key];
                                const isClosed = !slots || slots.length === 0;

                                return (
                                  <Box
                                    key={key}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Typography sx={{ fontWeight: 700, color: isClosed ? '#94A3B8' : '#475569' }}>{label}</Typography>
                                    <Typography sx={{ fontWeight: 800, color: isClosed ? '#F43F5E' : '#0F172A', fontSize: 14 }}>
                                      {isClosed
                                        ? 'CLOSED'
                                        : slots.map((slot) => `${slot.start} - ${slot.end}`).join(', ')}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Stack>
                          ) : (
                            <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>
                              Schedule not available.
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Box>
      )}

      <BookingDialog
        open={bookingOpen}
        slug={slug}
        salonName={data?.tenant.name || ''}
        onClose={() => setBookingOpen(false)}
      />
    </Page>
  );
}