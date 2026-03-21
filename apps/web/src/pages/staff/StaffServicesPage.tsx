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
  alpha,
} from '@mui/material';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ServiceEditorDialog, { type ServicePayload } from './components/ServiceEditorDialog';
import type { CatalogServiceOption, StaffService } from './components/types';
import {
  createMyStaffService,
  deleteMyStaffService,
  getMyStaffServices,
  updateMyStaffService,
} from '../../api/staffServices';
import { getCatalogServices } from '../../api/servicesCatalog';
import { landingColors, premium } from '../../components/landing/constants';

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
      <Box sx={{ minHeight: 400, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  const showNoCatalogMessage = !error && catalogOptions.length === 0;
  const showNoAssignedServicesMessage = !error && catalogOptions.length > 0 && items.length === 0;

  return (
    <>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
              Services & Prices
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
              Select which services you offer and set your personal overrides.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddClick}
            disabled={catalogOptions.length === 0}
            sx={{
              minHeight: 52,
              px: 3,
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: landingColors.purple,
              boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            }}
          >
            Add Service
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        {showNoCatalogMessage ? (
          <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px dashed', borderColor: '#CBD5E1', bgcolor: 'transparent', py: 8 }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box sx={{ width: 80, height: 80, borderRadius: 4, bgcolor: alpha(landingColors.purple, 0.06), display: 'grid', placeItems: 'center', color: landingColors.purple, mb: 1 }}>
                  <BuildCircleOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography sx={{ fontWeight: 1000, fontSize: 24, color: '#0F172A' }}>No services available</Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 600, maxWidth: 480 }}>
                  The salon owner must first create the master service catalog before you can assign services to yourself.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {showNoAssignedServicesMessage ? (
          <Card sx={{ borderRadius: `${premium.rLg * 4}px`, border: '1px dashed', borderColor: '#CBD5E1', bgcolor: 'transparent', py: 8 }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography sx={{ fontWeight: 1000, fontSize: 24, color: '#0F172A' }}>No services assigned</Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 600, maxWidth: 480 }}>
                  Your salon has catalog services, but you haven't added any to your personal profile yet.
                </Typography>
                <Button variant="outlined" onClick={handleAddClick} sx={{ mt: 2, borderRadius: 999, fontWeight: 900 }}>
                  Assign your first service
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {items.length > 0 ? (
          <Grid container spacing={3}>
            {items.map((s) => (
              <Grid item xs={12} md={6} key={s.id}>
                <Card
                  sx={{
                    borderRadius: `${premium.rLg * 4}px`,
                    border: '1px solid',
                    borderColor: 'rgba(15,23,42,0.06)',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 16px 48px rgba(15,23,42,0.08)',
                      borderColor: alpha(landingColors.purple, 0.1),
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Stack spacing={2.5}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography sx={{ fontWeight: 1000, fontSize: 20, color: '#0F172A' }}>
                            {s.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: 18, color: landingColors.purple }}>
                            €{s.priceEUR}
                          </Typography>
                        </Stack>
                        
                        <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                          {s.durationMin} minutes
                        </Typography>

                        {s.description ? (
                          <Typography sx={{ mt: 2, color: '#475569', fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                            {s.description}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handleEditClick(s)}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            borderColor: 'rgba(15,23,42,0.12)',
                            color: '#475569',
                            '&:hover': { bgcolor: '#F8FAFC', borderColor: landingColors.purple },
                          }}
                        >
                          Adjust Override
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => handleDelete(s.id)}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            borderColor: alpha('#F43F5E', 0.2),
                            bgcolor: alpha('#F43F5E', 0.02),
                            '&:hover': { bgcolor: alpha('#F43F5E', 0.05), borderColor: '#F43F5E' },
                          }}
                        >
                          Remove
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
        <Alert onClose={() => setSuccess('')} severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 800 }}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}