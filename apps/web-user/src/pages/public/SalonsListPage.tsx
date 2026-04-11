import {
  COUNTRIES,
  listPublicTenants,
  Page,
  type PublicTenantListItem,
  type TenantAddress,
  useAuth,
} from '@barber/shared';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

function formatAddress(address?: TenantAddress) {
  if (!address) return 'Address not provided';

  return [
    [address.street, address.houseNumber].filter(Boolean).join(' '),
    [address.postalCode, address.city].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');
}

const colors = {
  purple: '#7C6CFF',
  dark: '#0F172A',
  darker: '#0A0F1E',
  textSoft: '#64748B',
  bgSoft: '#F8FAFC',
  border: 'rgba(15,23,42,0.06)',
};

export default function SalonsListPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<PublicTenantListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('');

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await listPublicTenants();

        const filtered = result.filter((item) => {
          if (item.plan === 'admin') return false;
          if (user?.role === 'admin' && item._id === user.tenantId) return false;
          return true;
        });

        setItems(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load salons');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user?.tenantId, user?.role]);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !selectedCountry || item.details?.address?.country === selectedCountry;
      const matchesCity = !selectedCity || item.details?.address?.city === selectedCity;

      return matchesSearch && matchesCountry && matchesCity;
    });
  }, [items, searchQuery, selectedCountry, selectedCity]);

  const countryOptions = COUNTRIES;
  const cityOptions = countryOptions.find((c) => c.name === selectedCountry)?.cities || [];

  return (
    <Page showFooter>
      {/* HERO / HEADER SECTION */}
      <Box
        sx={{
          bgcolor: colors.darker,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 10 },
          pb: { xs: 12, md: 14 },
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography
              variant="h1"
              sx={{
                fontWeight: 1000,
                fontSize: { xs: 40, md: 56 },
                letterSpacing: -2,
                mb: 1,
                background: `linear-gradient(to bottom, #FFFFFF, ${alpha('#FFFFFF', 0.7)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Find Your Salon
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 4,
                bgcolor: colors.purple,
                borderRadius: 2,
                mx: 'auto',
                boxShadow: `0 0 20px ${alpha(colors.purple, 0.6)}`,
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* FILTER BAR SECTION */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 6,
            bgcolor: '#FFFFFF',
            boxShadow: '0 25px 60px rgba(10,15,30,0.12)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by salon name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: colors.textSoft }} />
                    </InputAdornment>
                  ),
                  sx: {
                    height: 56,
                    borderRadius: 4,
                    bgcolor: colors.bgSoft,
                    border: 'none',
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                label="Country"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('');
                }}
                InputProps={{
                  sx: {
                    height: 56,
                    borderRadius: 4,
                    bgcolor: colors.bgSoft,
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                  },
                }}
              >
                <MenuItem value="">All Countries</MenuItem>
                {countryOptions.map((c) => (
                  <MenuItem key={c.code} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                label="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry}
                InputProps={{
                  sx: {
                    height: 56,
                    borderRadius: 4,
                    bgcolor: colors.bgSoft,
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                  },
                }}
              >
                <MenuItem value="">All Cities</MenuItem>
                {cityOptions.map((c) => (
                  <MenuItem key={c.code} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* RESULTS SECTION */}
      <Box sx={{ py: 10, bgcolor: colors.bgSoft, minHeight: '50vh' }}>
        <Container maxWidth="lg">
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 4, mb: 4 }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
              <CircularProgress sx={{ color: colors.purple }} />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography variant="h5" sx={{ fontWeight: 1000, color: colors.dark, mb: 1 }}>
                No matching salons found
              </Typography>
              <Typography sx={{ color: colors.textSoft, fontWeight: 600 }}>
                Try adjusting your filters or search terms.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={item._id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 7,
                      border: '1px solid',
                      borderColor: 'rgba(15,23,42,0.04)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 15px 35px rgba(15,23,42,0.04)',
                      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: `0 35px 70px ${alpha(colors.dark, 0.08)}`,
                        borderColor: alpha(colors.purple, 0.2),
                      },
                    }}
                  >
                    <CardActionArea
                      component={RouterLink}
                      to={`/salons/${item.slug}`}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: colors.dark,
                          position: 'relative',
                          display: 'grid',
                          placeItems: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(45deg, ${alpha(colors.purple, 0.2)}, transparent)`,
                            zIndex: 1,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 84,
                            fontWeight: 1000,
                            color: 'rgba(255,255,255,0.05)',
                            letterSpacing: -6,
                            zIndex: 0,
                          }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </Typography>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 20,
                            left: 20,
                            zIndex: 2,
                          }}
                        >
                          <Chip
                            size="small"
                            label={item.details?.timezone || item.timezone}
                            sx={{
                              fontWeight: 900,
                              fontSize: 10,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 4, flexGrow: 1 }}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 1000,
                                fontSize: 24,
                                color: colors.dark,
                                lineHeight: 1.2,
                                letterSpacing: -0.5,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{ mt: 1, color: colors.textSoft }}
                            >
                              <LocationOnRoundedIcon sx={{ fontSize: 18, color: colors.purple }} />
                              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                {formatAddress(item.details?.address)}
                              </Typography>
                            </Stack>
                          </Box>

                          <Typography
                            sx={{
                              color: colors.textSoft,
                              fontSize: 15,
                              lineHeight: 1.6,
                              fontWeight: 500,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: 48,
                            }}
                          >
                            {item.details?.notes || 'No description available for this salon.'}
                          </Typography>

                          <Divider sx={{ opacity: 0.1 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                              sx={{
                                fontWeight: 1000,
                                fontSize: 14,
                                color: colors.purple,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              Book Appointment <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Page>
  );
}
