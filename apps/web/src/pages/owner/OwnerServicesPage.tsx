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
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ServiceCatalogDialog, {
  type CatalogServicePayload,
} from './components/ServiceCatalogDialog';
import ReviewAIServicesDialog from './components/ReviewAIServicesDialog';
import {
  createCatalogService,
  deleteCatalogService,
  getCatalogServices,
  updateCatalogService,
  extractServicesFromAI,
  createBulkCatalogServices,
  type CatalogServiceItem,
} from '../../api/servicesCatalog';
import { landingColors, premium } from '../../components/landing/constants';

export default function OwnerServicesPage() {
  const [items, setItems] = React.useState<CatalogServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [extracting, setExtracting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CatalogServiceItem | null>(null);
  const [extractedServices, setExtractedServices] = React.useState<CatalogServicePayload[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError('');

    try {
      const services = await extractServicesFromAI(file);
      setExtractedServices(services);
      setReviewOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract services');
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBulkConfirm = async (payloads: CatalogServicePayload[]) => {
    setSaving(true);
    setError('');

    try {
      const created = await createBulkCatalogServices(payloads);
      setItems((prev) => [...created, ...prev]);
      setSuccess(`${created.length} services created successfully.`);
      setReviewOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: landingColors.purple }} />
      </Box>
    );
  }

  const showEmptyState = !error && items.length === 0;

  return (
    <>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
              Services Catalog
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
              Define the master list of services your salon offers.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            
            <Tooltip title="Upload a photo or PDF of your pricelist and let AI extract the services for you!">
              <Button
                variant="outlined"
                startIcon={extracting ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighRoundedIcon />}
                onClick={handleScanClick}
                disabled={extracting || saving}
                sx={{
                  minHeight: 52,
                  px: 3,
                  borderRadius: 999,
                  fontWeight: 900,
                  borderColor: alpha(landingColors.purple, 0.3),
                  color: landingColors.purple,
                  bgcolor: alpha(landingColors.purple, 0.04),
                  '&:hover': {
                    bgcolor: alpha(landingColors.purple, 0.08),
                    borderColor: landingColors.purple,
                  },
                }}
              >
                {extracting ? 'Scanning...' : 'Scan Pricelist'}
              </Button>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleCreateClick}
              disabled={extracting || saving}
              sx={{
                minHeight: 52,
                px: 3,
                borderRadius: 999,
                fontWeight: 900,
                bgcolor: landingColors.purple,
                boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
                '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
              }}
            >
              Add Service
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

        {showEmptyState ? (
          <Card
            sx={{
              borderRadius: `${premium.rLg * 4}px`,
              border: '1px dashed',
              borderColor: '#CBD5E1',
              bgcolor: 'transparent',
              py: 8,
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    bgcolor: alpha(landingColors.purple, 0.06),
                    display: 'grid',
                    placeItems: 'center',
                    color: landingColors.purple,
                    mb: 1,
                  }}
                >
                  <ContentCutRoundedIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography sx={{ fontWeight: 1000, fontSize: 24, color: '#0F172A' }}>
                  No services yet
                </Typography>

                <Typography sx={{ color: '#64748B', fontWeight: 600, maxWidth: 480 }}>
                  Create the services your salon offers (e.g., Haircut, Beard Trim) so your team can add them to their profiles.
                </Typography>
                
                <Button
                  variant="text"
                  startIcon={<AutoFixHighRoundedIcon />}
                  onClick={handleScanClick}
                  sx={{ mt: 2, fontWeight: 800, color: landingColors.purple }}
                >
                  Scan a pricelist with AI
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {items.length > 0 ? (
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
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
                            {item.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: 18, color: landingColors.purple }}>
                            €{item.priceEUR}
                          </Typography>
                        </Stack>
                        
                        <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                          {item.durationMin} minutes
                        </Typography>

                        {item.description ? (
                          <Typography sx={{ mt: 2, color: '#475569', fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                            {item.description}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handleEditClick(item)}
                          sx={{
                            borderRadius: 999,
                            fontWeight: 900,
                            borderColor: 'rgba(15,23,42,0.12)',
                            color: '#475569',
                            '&:hover': { bgcolor: '#F8FAFC', borderColor: landingColors.purple },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => handleDelete(item.id)}
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

        <ServiceCatalogDialog
          open={open}
          onClose={handleClose}
          onSave={handleSave}
          initialData={editingItem}
        />

        <ReviewAIServicesDialog
          open={reviewOpen}
          services={extractedServices}
          onClose={() => setReviewOpen(false)}
          onConfirm={handleBulkConfirm}
          loading={saving}
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