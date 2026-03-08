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
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ServiceEditorDialog, { type ServicePayload } from './components/ServiceEditorDialog';
import type { CatalogServiceOption, StaffService } from './components/types';
import {
  createMyStaffService,
  deleteMyStaffService,
  getMyStaffServices,
  updateMyStaffService,
} from '../../api/staffServices';
import { getCatalogServices } from '../../api/servicesCatalog';

export default function StaffServicesPage() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<StaffService[]>([]);
  const [catalogOptions, setCatalogOptions] = React.useState<CatalogServiceOption[]>([]);
  const [editingService, setEditingService] = React.useState<StaffService | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [assignedServices, catalogServices] = await Promise.all([
        getMyStaffServices(),
        getCatalogServices(),
      ]);

      setItems(assignedServices ?? []);
      setCatalogOptions(catalogServices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
      setItems([]);
      setCatalogOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleAddClick() {
    setEditingService(null);
    setOpen(true);
  }

  function handleEditClick(service: StaffService) {
    setEditingService(service);
    setOpen(true);
  }

  function handleClose() {
    if (saving) return;
    setOpen(false);
    setEditingService(null);
  }

  async function handleSave(payload: ServicePayload) {
    setSaving(true);
    setError('');

    try {
      if (editingService) {
        const updated = await updateMyStaffService(editingService.id, {
          durationMin: payload.durationMin,
          priceEUR: payload.priceEUR,
        });

        setItems((prev) =>
          prev.map((item) => (item.id === editingService.id ? updated : item)),
        );
        setSuccess('Service updated successfully.');
      } else {
        const created = await createMyStaffService({
          serviceId: payload.serviceId,
          durationMin: payload.durationMin,
          priceEUR: payload.priceEUR,
        });

        setItems((prev) => [created, ...prev]);
        setSuccess('Service added successfully.');
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
      await deleteMyStaffService(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Service removed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  }

  const availableCatalogOptions = catalogOptions.filter(
    (catalogItem) =>
      editingService?.serviceId === catalogItem.id ||
      !items.some((assignedItem) => assignedItem.serviceId === catalogItem.id),
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const showNoCatalogMessage = !error && catalogOptions.length === 0;
  const showNoAssignedServicesMessage = !error && catalogOptions.length > 0 && items.length === 0;

  return (
    <>
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={900}>
              Services & prices
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>
              Manage the services you offer from the salon catalog.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleAddClick}
            disabled={catalogOptions.length === 0}
          >
            Add service
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {showNoCatalogMessage ? (
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
                <BuildCircleOutlinedIcon sx={{ fontSize: 44, opacity: 0.35 }} />

                <Typography variant="h6" fontWeight={800}>
                  No services available yet
                </Typography>

                <Typography sx={{ opacity: 0.75, maxWidth: 560 }}>
                  The salon owner or manager must first create the global service
                  catalog before staff members can offer services here.
                </Typography>

                <Typography sx={{ opacity: 0.6, fontSize: 14, maxWidth: 560 }}>
                  Once catalog services are added, you will be able to select the
                  ones you offer and optionally adjust your own duration and price.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {showNoAssignedServicesMessage ? (
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
                <Typography variant="h6" fontWeight={800}>
                  No services assigned yet
                </Typography>

                <Typography sx={{ opacity: 0.75, maxWidth: 560 }}>
                  Your salon already has catalog services, but none are assigned to
                  you yet.
                </Typography>

                <Typography sx={{ opacity: 0.6, fontSize: 14, maxWidth: 560 }}>
                  Click <b>Add service</b> to choose which services you personally offer.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {items.length > 0 ? (
          <Grid container spacing={2}>
            {items.map((s) => (
              <Grid item xs={12} md={6} key={s.id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography fontWeight={900}>{s.name}</Typography>
                        <Typography sx={{ opacity: 0.7 }}>
                          {s.durationMin} min · €{s.priceEUR}
                        </Typography>

                        {s.description ? (
                          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                            {s.description}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditClick(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(s.id)}
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

        <ServiceEditorDialog
          open={open}
          onClose={handleClose}
          onSave={handleSave}
          initialData={editingService}
          catalogOptions={availableCatalogOptions}
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