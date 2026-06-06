import {
  BookingDialog,
  getPublicTenantBySlug,
  landingColors,
  Page,
  type TenantAddress,
  type WeeklyOpeningHours,
} from '@barber/shared';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { useParams } from 'react-router-dom';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getPublicTenantBySlug>> | null>(
    null,
  );

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
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={32} sx={{ color: landingColors.purple }} />
        </Box>
      ) : error || !data ? (
        <Container maxWidth="md" sx={{ py: 10 }}>
          <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 700 }}>
            {error || 'Salon not found'}
          </Alert>
        </Container>
      ) : (
        <Box sx={{ pb: { xs: 10, md: 6 }, bgcolor: '#F8FAFC' }}>
          {/* HIGH-END HERO SECTION */}
          <Box
            sx={{
              position: 'relative',
              bgcolor: '#0F172A',
              color: 'white',
              pt: { xs: 6, md: 10 },
              pb: { xs: 8, md: 12 },
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 10% 20%, ${alpha(landingColors.purple, 0.18)}, transparent 40%),
                             radial-gradient(circle at 90% 80%, ${alpha('#38BDF8', 0.12)}, transparent 40%)`,
                zIndex: 1,
              }}
            />
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
              <Stack
                spacing={2.5}
                alignItems={{ xs: 'center', md: 'flex-start' }}
                textAlign={{ xs: 'center', md: 'left' }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 1000,
                      fontSize: { xs: 32, sm: 52, md: 72 },
                      letterSpacing: { xs: -1.2, md: -3 },
                      lineHeight: 1.1,
                      mb: 1.5,
                      textShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    {data.tenant.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                    sx={{ color: alpha('#FFF', 0.65), px: { xs: 2, sm: 0 } }}
                  >
                    <LocationOnRoundedIcon sx={{ fontSize: { xs: 18, md: 22 }, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: { xs: 14, md: 19 }, fontWeight: 600 }}>
                      {formatAddress(data.details?.address)}
                    </Typography>
                  </Stack>
                </Box>

                {!isMobile && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarMonthRoundedIcon />}
                    onClick={() => setBookingOpen(true)}
                    sx={{
                      height: 60,
                      px: 6,
                      borderRadius: 999,
                      fontSize: 17,
                      fontWeight: 900,
                      bgcolor: landingColors.purple,
                      boxShadow: `0 20px 40px ${alpha(landingColors.purple, 0.25)}`,
                      textTransform: 'none',
                      '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.08)' },
                    }}
                  >
                    Book Your Appointment
                  </Button>
                )}
              </Stack>
            </Container>
          </Box>

          <Container
            maxWidth="lg"
            sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 10 }}
          >
            <Grid container spacing={{ xs: 2, md: 4 }}>
              <Grid item xs={12} md={7.5}>
                <Stack spacing={{ xs: 2, md: 4 }}>
                  {/* MODERN ABOUT SECTION */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid rgba(15,23,42,0.06)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
                      maxWidth: { xs: 450, md: 'none' },
                      mx: 'auto',
                      width: '100%',
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, md: 4.5 } }}>
                      <Stack spacing={2.5}>
                        <Typography
                          sx={{
                            fontWeight: 1000,
                            fontSize: 22,
                            color: '#0F172A',
                            letterSpacing: -0.5,
                            textAlign: { xs: 'center', md: 'left' },
                          }}
                        >
                          About the Salon
                        </Typography>
                        <Typography
                          sx={{
                            color: '#475569',
                            fontSize: { xs: 15.5, md: 17.5 },
                            lineHeight: 1.7,
                            fontWeight: 500,
                          }}
                        >
                          {data.details?.notes ||
                            'Experience premium grooming services in a modern and welcoming atmosphere. Our expert team is dedicated to providing you with the best style and care.'}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4.5}>
                <Stack spacing={{ xs: 2, md: 4 }}>
                  {/* OPENING HOURS */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid rgba(15,23,42,0.06)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
                      maxWidth: { xs: 450, md: 'none' },
                      mx: 'auto',
                      width: '100%',
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                      <Stack spacing={2.5}>
                        <Typography
                          sx={{
                            fontWeight: 1000,
                            fontSize: 19,
                            color: '#0F172A',
                            letterSpacing: -0.5,
                            textAlign: { xs: 'center', md: 'left' },
                          }}
                        >
                          Opening Hours
                        </Typography>

                        {data.details?.openingHours ? (
                          <Stack spacing={1.4}>
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
                                    pb: 1.2,
                                    borderBottom: '1px solid rgba(15,23,42,0.03)',
                                    '&:last-child': { borderBottom: 0, pb: 0 },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: 14.5,
                                      color: isClosed ? '#94A3B8' : '#475569',
                                    }}
                                  >
                                    {label}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      color: isClosed ? '#EF4444' : '#0F172A',
                                      fontSize: 13.5,
                                      bgcolor: isClosed ? alpha('#EF4444', 0.04) : 'transparent',
                                      px: isClosed ? 1 : 0,
                                      py: isClosed ? 0.25 : 0,
                                      borderRadius: 1,
                                    }}
                                  >
                                    {isClosed
                                      ? 'CLOSED'
                                      : slots
                                          .map((slot) => `${slot.start} - ${slot.end}`)
                                          .join(', ')}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 14 }}>
                            Schedule not available.
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* CONTACT & LINKS */}
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid rgba(15,23,42,0.06)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
                      maxWidth: { xs: 450, md: 'none' },
                      mx: 'auto',
                      width: '100%',
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                      <Stack spacing={3}>
                        <Typography
                          sx={{
                            fontWeight: 1000,
                            fontSize: 19,
                            color: '#0F172A',
                            letterSpacing: -0.5,
                            textAlign: { xs: 'center', md: 'left' },
                          }}
                        >
                          Contact Details
                        </Typography>

                        <Stack spacing={2.2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                          <Box>
                            <Typography
                              sx={{
                                color: '#94A3B8',
                                fontWeight: 800,
                                fontSize: 9.5,
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                mb: 0.5,
                              }}
                            >
                              Phone
                            </Typography>
                            <Typography
                              component="a"
                              href={`tel:${data.details?.contactPhone}`}
                              sx={{
                                fontWeight: 800,
                                color: landingColors.purple,
                                fontSize: 16.5,
                                textDecoration: 'none',
                                display: 'block',
                                '&:active': { opacity: 0.7 },
                              }}
                            >
                              {data.details?.contactPhone || 'Not provided'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                color: '#94A3B8',
                                fontWeight: 800,
                                fontSize: 9.5,
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                mb: 0.5,
                              }}
                            >
                              Email
                            </Typography>
                            <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: 14.5 }}>
                              {data.details?.contactEmail || 'Not provided'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack spacing={1}>
                          {data.details?.websiteUrl ? (
                            <Button
                              variant="outlined"
                              fullWidth
                              component="a"
                              href={data.details.websiteUrl}
                              target="_blank"
                              sx={{
                                borderRadius: 999,
                                fontWeight: 800,
                                textTransform: 'none',
                                color: '#475569',
                                borderColor: 'rgba(15,23,42,0.12)',
                                fontSize: 14,
                                height: 46,
                                '&:hover': {
                                  borderColor: landingColors.purple,
                                  color: landingColors.purple,
                                },
                              }}
                            >
                              Visit Official Website
                            </Button>
                          ) : null}

                          {data.details?.socialLinks?.instagram ? (
                            <Button
                              variant="outlined"
                              fullWidth
                              component="a"
                              href={data.details.socialLinks.instagram}
                              target="_blank"
                              sx={{
                                borderRadius: 999,
                                fontWeight: 800,
                                textTransform: 'none',
                                color: '#E1306C',
                                borderColor: alpha('#E1306C', 0.2),
                                fontSize: 14,
                                height: 46,
                                '&:hover': {
                                  borderColor: '#E1306C',
                                  bgcolor: alpha('#E1306C', 0.02),
                                },
                              }}
                            >
                              Instagram
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Container>

          {/* APP-LIKE STICKY BOOKING BAR */}
          {isMobile && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                pb: 'calc(12px + env(safe-area-inset-bottom))',
                bgcolor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                zIndex: 1000,
                boxShadow: '0 -10px 40px rgba(0,0,0,0.04)',
              }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<CalendarMonthRoundedIcon />}
                onClick={() => setBookingOpen(true)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  bgcolor: landingColors.purple,
                  height: 58,
                  fontSize: 17,
                  textTransform: 'none',
                  letterSpacing: 0.2,
                  boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.35)}`,
                  '&:hover': { bgcolor: landingColors.purple },
                  '&:active': { transform: 'scale(0.97)', transition: 'transform 0.1s' },
                }}
              >
                Book Appointment
              </Button>
            </Box>
          )}
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
