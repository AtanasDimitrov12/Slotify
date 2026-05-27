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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      {/* PROFESSIONAL HERO SECTION */}
      <Box
        sx={{
          bgcolor: '#0F172A',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 6, md: 10 },
          pb: { xs: 10, md: 14 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 10% 10%, ${alpha(colors.purple, 0.15)}, transparent 40%),
                         radial-gradient(circle at 90% 90%, ${alpha('#0EA5E9', 0.12)}, transparent 40%)`,
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 1000,
                fontSize: { xs: 36, sm: 48, md: 72 },
                letterSpacing: { xs: -1, md: -3 },
                mb: 1,
                lineHeight: 1,
                textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              Find Your Salon
            </Typography>
            <Typography
              sx={{
                color: alpha('#FFF', 0.6),
                fontSize: { xs: 15, md: 19 },
                fontWeight: 600,
                maxWidth: 600,
                mb: 0,
                lineHeight: 1.4,
              }}
            >
              Discover grooming experts and book instantly.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* REFINED FILTER BAR */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, position: 'relative', zIndex: 10 }}>
        <Card
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: { xs: 3.5, md: 5 },
            bgcolor: '#FFFFFF',
            boxShadow: '0 25px 60px rgba(15,23,42,0.12)',
            border: `1px solid rgba(15,23,42,0.06)`,
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search salons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: colors.textSoft, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    height: { xs: 48, md: 54 },
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                    fontSize: 14.5,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={3.5}>
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
                    height: { xs: 48, md: 54 },
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                    fontSize: 13.5,
                  },
                }}
              >
                <MenuItem value="" sx={{ fontWeight: 600 }}>
                  All Countries
                </MenuItem>
                {countryOptions.map((c) => (
                  <MenuItem key={c.code} value={c.name} sx={{ fontWeight: 600 }}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3.5}>
              <TextField
                select
                fullWidth
                label="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedCountry}
                InputProps={{
                  sx: {
                    height: { xs: 48, md: 54 },
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    '& fieldset': { border: 'none' },
                    fontWeight: 600,
                    fontSize: 13.5,
                  },
                }}
              >
                <MenuItem value="" sx={{ fontWeight: 600 }}>
                  All Cities
                </MenuItem>
                {cityOptions.map((c) => (
                  <MenuItem key={c.code} value={c.name} sx={{ fontWeight: 600 }}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* RESULTS SECTION */}
      <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: '#F8FAFC', minHeight: '50vh' }}>
        <Container maxWidth="lg">
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 3, mb: 4, fontWeight: 700 }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
              <CircularProgress size={32} sx={{ color: colors.purple }} />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" sx={{ fontWeight: 1000, color: colors.dark, mb: 0.5 }}>
                No salons found
              </Typography>
              <Typography sx={{ color: colors.textSoft, fontWeight: 600, fontSize: 14 }}>
                Try adjusting your search or filters.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, md: 4 }}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={item._id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'rgba(15,23,42,0.06)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 8px 30px rgba(15,23,42,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-8px)',
                        boxShadow: `0 24px 50px ${alpha(colors.dark, 0.06)}`,
                        borderColor: alpha(colors.purple, 0.2),
                      },
                      '&:active': {
                        bgcolor: '#F9FAFB',
                        transform: 'scale(0.99)',
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
                          height: { xs: 130, md: 180 },
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
                            background: `linear-gradient(135deg, ${alpha(colors.purple, 0.25)}, transparent)`,
                            zIndex: 1,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: { xs: 60, md: 80 },
                            fontWeight: 1000,
                            color: 'rgba(255,255,255,0.06)',
                            letterSpacing: -4,
                            zIndex: 0,
                          }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </Typography>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            zIndex: 2,
                          }}
                        >
                          <Chip
                            size="small"
                            label={item.details?.timezone || item.timezone}
                            sx={{
                              fontWeight: 900,
                              fontSize: 9,
                              bgcolor: 'rgba(15,23,42,0.6)',
                              color: 'white',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              height: 18,
                            }}
                          />
                        </Box>
                      </Box>

                      <CardContent sx={{ p: { xs: 2.2, md: 3.5 }, flexGrow: 1 }}>
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 1000,
                                fontSize: { xs: 19, md: 22 },
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
                              sx={{ mt: 0.75, color: colors.textSoft }}
                            >
                              <LocationOnRoundedIcon
                                sx={{ fontSize: { xs: 15, md: 17 }, color: colors.purple }}
                              />
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: { xs: 12.5, md: 13.5 },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatAddress(item.details?.address)}
                              </Typography>
                            </Stack>
                          </Box>

                          <Typography
                            sx={{
                              color: colors.textSoft,
                              fontSize: { xs: 13, md: 14.5 },
                              lineHeight: 1.6,
                              fontWeight: 500,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: { xs: 40, md: 46 },
                            }}
                          >
                            {item.details?.notes || 'Experience premium grooming services.'}
                          </Typography>

                          <Divider sx={{ opacity: 0.06 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: 12.5,
                                color: colors.purple,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                textTransform: 'uppercase',
                                letterSpacing: 0.8,
                              }}
                            >
                              Book Now <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
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
