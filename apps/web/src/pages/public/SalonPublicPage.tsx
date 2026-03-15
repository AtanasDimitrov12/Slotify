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
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  getPublicTenantBySlug,
  type TenantAddress,
  type WeeklyOpeningHours,
} from '../../api/publicTenants';
import { Page } from '../../layout/Page';
import BookingDialog from '../../components/booking/BookingDialog';

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
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
          <CircularProgress />
        </Box>
      ) : error || !data ? (
        <Alert severity="error">{error || 'Salon not found'}</Alert>
      ) : (
        <>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" fontWeight={900}>
                {data.tenant.name}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                {formatAddress(data.details?.address)}
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={800}>
                        About
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {data.details?.notes || 'No description provided yet.'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={800}>
                        Contact
                      </Typography>

                      <Typography sx={{ color: 'text.secondary' }}>
                        Email: {data.details?.contactEmail || 'Not provided'}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        Phone: {data.details?.contactPhone || 'Not provided'}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        Contact person: {data.details?.contactPersonName || 'Not provided'}
                      </Typography>

                      {data.details?.websiteUrl ? (
                        <Button
                          variant="outlined"
                          component="a"
                          href={data.details.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Website
                        </Button>
                      ) : null}

                      {data.details?.socialLinks?.instagram ? (
                        <Button
                          variant="outlined"
                          component="a"
                          href={data.details.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Instagram
                        </Button>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={800}>
                        Opening hours
                      </Typography>

                      {data.details?.openingHours ? (
                        <Stack divider={<Divider flexItem />}>
                          {orderedDays.map(({ key, label }) => {
                            const slots = data.details?.openingHours?.[key];

                            return (
                              <Box
                                key={key}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 1,
                                  gap: 2,
                                }}
                              >
                                <Typography fontWeight={600}>{label}</Typography>
                                <Typography sx={{ color: 'text.secondary', textAlign: 'right' }}>
                                  {slots && slots.length > 0
                                    ? slots.map((slot) => `${slot.start} - ${slot.end}`).join(', ')
                                    : 'Closed'}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography sx={{ color: 'text.secondary' }}>
                          Opening hours not provided.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box>
              <Button variant="contained" size="large" onClick={() => setBookingOpen(true)}>
                Book appointment
              </Button>
            </Box>
          </Stack>

          <BookingDialog
            open={bookingOpen}
            slug={slug}
            salonName={data.tenant.name}
            onClose={() => setBookingOpen(false)}
          />
        </>
      )}
    </Page>
  );
}