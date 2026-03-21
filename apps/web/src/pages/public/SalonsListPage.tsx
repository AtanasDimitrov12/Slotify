import * as React from 'react';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  alpha,
  Container,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { listPublicTenants, type PublicTenantListItem, type TenantAddress } from '../../api/publicTenants';
import { Page } from '../../layout/Page';
import { landingColors, premium } from '../../components/landing/constants';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

function formatAddress(address?: TenantAddress) {
  if (!address) return 'Address not provided';

  return [
    [address.street, address.houseNumber].filter(Boolean).join(' '),
    [address.postalCode, address.city].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');
}

export default function SalonsListPage() {
  const [items, setItems] = React.useState<PublicTenantListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await listPublicTenants();
        setItems(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load salons');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <Page showFooter>
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box textAlign="center">
              <Typography sx={{ fontWeight: 1000, fontSize: { xs: 40, md: 64 }, letterSpacing: -2, color: '#0F172A', lineHeight: 1 }}>
                Explore Salons
              </Typography>
              <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: 18, md: 20 }, mt: 2, maxWidth: 600, mx: 'auto' }}>
                Discover top-rated barbershops and beauty salons nearby and book your next appointment in seconds.
              </Typography>
            </Box>

            {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

            {loading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
                <CircularProgress sx={{ color: landingColors.purple }} />
              </Box>
            ) : (
              <Grid container spacing={4}>
                {items.map((item) => (
                  <Grid item xs={12} sm={6} lg={4} key={item._id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: `${premium.rLg * 4}px`,
                        border: '1px solid',
                        borderColor: 'rgba(15,23,42,0.06)',
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 12px 40px rgba(15,23,42,0.04)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 30px 60px rgba(15,23,42,0.08)',
                          borderColor: alpha(landingColors.purple, 0.15),
                        },
                      }}
                    >
                      <CardActionArea
                        component={RouterLink}
                        to={`/salons/${item.slug}`}
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        <Box sx={{ height: 180, bgcolor: alpha(landingColors.purple, 0.04), display: 'grid', placeItems: 'center', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                           <Typography sx={{ fontSize: 64, fontWeight: 1000, color: alpha(landingColors.purple, 0.1), letterSpacing: -4 }}>
                             {item.name.charAt(0).toUpperCase()}
                           </Typography>
                        </Box>
                        
                        <CardContent sx={{ p: 4, flexGrow: 1 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography sx={{ fontWeight: 1000, fontSize: 22, color: '#0F172A', lineHeight: 1.2 }}>
                                {item.name}
                              </Typography>
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: '#64748B' }}>
                                <LocationOnRoundedIcon sx={{ fontSize: 16 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                  {formatAddress(item.details?.address)}
                                </Typography>
                              </Stack>
                            </Box>

                            {item.details?.notes ? (
                              <Typography
                                sx={{
                                  color: '#475569',
                                  fontSize: 15,
                                  lineHeight: 1.6,
                                  fontWeight: 500,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: 72,
                                }}
                              >
                                {item.details.notes}
                              </Typography>
                            ) : (
                              <Box sx={{ minHeight: 72 }} />
                            )}

                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                              <Chip
                                size="small"
                                label={item.details?.timezone || item.timezone}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 11,
                                  bgcolor: alpha('#F1F5F9', 0.8),
                                  color: '#64748B',
                                  border: '1px solid rgba(15,23,42,0.06)',
                                }}
                              />
                              <Box sx={{ color: landingColors.purple, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>View</Typography>
                                <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                              </Box>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>
    </Page>
  );
}