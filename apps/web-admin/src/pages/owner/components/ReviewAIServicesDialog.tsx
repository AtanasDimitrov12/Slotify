import { landingColors } from '@barber/shared';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import type { CatalogServicePayload } from './ServiceCatalogDialog';

interface ReviewAIServicesDialogProps {
  open: boolean;
  services: CatalogServicePayload[];
  onClose: () => void;
  onConfirm: (services: CatalogServicePayload[]) => void | Promise<void>;
  loading?: boolean;
}

export default function ReviewAIServicesDialog({
  open,
  services: initialServices,
  onClose,
  onConfirm,
  loading = false,
}: ReviewAIServicesDialogProps) {
  const [services, setServices] = React.useState<CatalogServicePayload[]>([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    if (open && Array.isArray(initialServices)) {
      // Ensure we don't have nulls for required fields and duration is at least 1
      const sanitized = initialServices.map((s) => ({
        ...s,
        name: s.name || '',
        priceEUR: s.priceEUR || 0,
        durationMin: s.durationMin || 30,
        description: s.description || '',
      }));
      setServices(sanitized);
    } else if (open) {
      setServices([]);
    }
  }, [open, initialServices]);

  const handleChange = (
    index: number,
    field: keyof CatalogServicePayload,
    value: string | number,
  ) => {
    if (!Array.isArray(services)) return;
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleDelete = (index: number) => {
    if (!Array.isArray(services)) return;
    setServices(services.filter((_, i) => i !== index));
  };

  const isInvalid = React.useMemo(() => {
    return services.some((s) => !s.name.trim() || !s.durationMin || s.durationMin < 1);
  }, [services]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          bgcolor: '#F8FAFC',
        },
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 4 }, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(landingColors.purple, 0.1),
              display: 'grid',
              placeItems: 'center',
              color: landingColors.purple,
            }}
          >
            <AutoFixHighRoundedIcon />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 1000,
                fontSize: { xs: 20, sm: 24 },
                letterSpacing: -0.5,
                lineHeight: 1.2,
              }}
            >
              Review AI Results
            </Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14 }}>
              {services.length} services found in your pricelist
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 4 }, pt: 2 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(landingColors.blue, 0.05),
              border: `1px solid ${alpha(landingColors.blue, 0.1)}`,
            }}
          >
            <Typography sx={{ color: '#0369A1', fontWeight: 700, fontSize: 14 }}>
              Tip: You can edit the names, prices, and durations directly. AI might not be 100%
              accurate, so please double-check.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {Array.isArray(services) &&
              services.map((service, index) => {
                const nameError = !service.name.trim();
                const durationError = !service.durationMin || service.durationMin < 1;

                const serviceKey = `${service.name}-${service.durationMin}-${service.priceEUR}-${index}`;

                return (
                  <Card
                    key={serviceKey}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: nameError || durationError ? '#F43F5E' : 'rgba(15,23,42,0.08)',
                      bgcolor: '#FFFFFF',
                      overflow: 'visible',
                      position: 'relative',
                      '&:hover': {
                        borderColor:
                          nameError || durationError ? '#F43F5E' : alpha(landingColors.purple, 0.3),
                        boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                              label="Service Name"
                              size="small"
                              fullWidth
                              value={service.name}
                              onChange={(e) => handleChange(index, 'name', e.target.value)}
                              variant="outlined"
                              error={nameError}
                              helperText={nameError ? 'Name is required' : ''}
                              sx={{
                                '& .MuiOutlinedInput-root': { fontWeight: 800, fontSize: 16 },
                              }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(index)}
                              sx={{
                                mt: 0.5,
                                bgcolor: alpha('#F43F5E', 0.05),
                                '&:hover': { bgcolor: alpha('#F43F5E', 0.1) },
                              }}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Price (€)"
                            size="small"
                            type="number"
                            fullWidth
                            value={service.priceEUR}
                            onChange={(e) =>
                              handleChange(index, 'priceEUR', Number(e.target.value))
                            }
                            variant="outlined"
                            InputProps={{ sx: { fontWeight: 700 } }}
                          />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Duration (min)"
                            size="small"
                            type="number"
                            fullWidth
                            value={service.durationMin}
                            onChange={(e) =>
                              handleChange(index, 'durationMin', Number(e.target.value))
                            }
                            variant="outlined"
                            error={durationError}
                            helperText={durationError ? 'Min 1 min' : ''}
                            InputProps={{ sx: { fontWeight: 700 } }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Description"
                            size="small"
                            fullWidth
                            placeholder="Short description..."
                            value={service.description}
                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                            variant="outlined"
                            InputProps={{ sx: { fontWeight: 500, fontSize: 14 } }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
          </Stack>
        </Stack>
      </DialogContent>

      <Divider sx={{ opacity: 0.5 }} />

      <DialogActions sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ fontWeight: 800, color: '#64748B', borderRadius: 999, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={services.length === 0 || loading || isInvalid}
          onClick={() => onConfirm(services)}
          sx={{
            borderRadius: 999,
            px: { xs: 2, sm: 4 },
            fontWeight: 900,
            minHeight: 48,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
          }}
        >
          {loading
            ? 'Saving...'
            : fullScreen
              ? 'Save All'
              : `Confirm and Save ${services.length} Services`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
