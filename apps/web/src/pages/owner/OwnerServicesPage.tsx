import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import ServiceCatalogDialog, {
  type CatalogServicePayload,
} from './components/ServiceCatalogDialog';
import {
  createCatalogService,
  deleteCatalogService,
  getCatalogServices,
  updateCatalogService,
  type CatalogServiceItem,
} from '../../api/servicesCatalog';

export default function OwnerServicesPage() {
  const [items, setItems] = React.useState<CatalogServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CatalogServiceItem | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCatalogServices();
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleCreateClick() {
    setEditingItem(null);
    setOpen(true);
  }

  function handleEditClick(item: CatalogServiceItem) {
    setEditingItem(item);
    setOpen(true);
  }

  function handleClose() {
    if (saving) return;
    setOpen(false);
    setEditingItem(null);
  }

  async function handleSave(payload: CatalogServicePayload) {
    setSaving(true);
    setError('');

    try {
      if (editingItem) {
        const updated = await updateCatalogService(editingItem.id, payload);
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? updated : item)));
        setSuccess('Service updated successfully.');
      } else {
        const created = await createCatalogService(payload);
        setItems((prev) => [created, ...prev]);
        setSuccess('Service created successfully.');
      }

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError('');

    try {
      await deleteCatalogService(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Service removed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const showEmptyState = !error && items.length === 0;

  return (
    <>
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={900}>
              Services catalog
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>
              Create the global services your salon offers. Staff members can later
              select from this catalog and optionally override their own price and duration.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateClick}
          >
            Add service
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {showEmptyState ? (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              textAlign: 'center',
              py: 5,
              px: 3,
            }}
          >
            <CardContent>
              <Stack spacing={1.5} alignItems="center">
                <ContentCutRoundedIcon sx={{ fontSize: 44, opacity: 0.35 }} />

                <Typography variant="h6" fontWeight={800}>
                  No catalog services yet
                </Typography>

                <Typography sx={{ opacity: 0.75, maxWidth: 560 }}>
                  Start by creating the main services your salon offers, such as haircut,
                  beard trim, coloring, or styling.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {items.length > 0 ? (
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography fontWeight={900}>{item.name}</Typography>
                        <Typography sx={{ opacity: 0.7 }}>
                          {item.durationMin} min · €{item.priceEUR}
                        </Typography>

                        {item.description ? (
                          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                            {item.description}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : null}

        <ServiceCatalogDialog
          open={open}
          onClose={handleClose}
          onSave={handleSave}
          initialData={editingItem}
        />
      </Stack>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}