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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { listPublicTenants, type PublicTenantListItem, type TenantAddress } from '../../api/publicTenants';
import { Page } from '../../layout/Page';

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
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={900}>
            Explore salons
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Discover barbershops and salons and choose where you want to book.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {items.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={item._id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={`/salons/${item.slug}`}
                    sx={{ height: '100%', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="h6" fontWeight={800}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {formatAddress(item.details?.address)}
                          </Typography>
                        </Box>

                        {item.details?.notes ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.details.notes}
                          </Typography>
                        ) : null}

                        <Box sx={{ pt: 0.5 }}>
                          <Chip
                            size="small"
                            label={item.details?.timezone || item.timezone}
                            variant="outlined"
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Page>
  );
}