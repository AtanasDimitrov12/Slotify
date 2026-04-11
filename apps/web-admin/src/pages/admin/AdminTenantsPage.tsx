import {
  landingColors,
  listTenants,
  register,
  type Tenant,
  updateTenant,
  useAuth,
} from '@barber/shared';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { alpha, Box, Button, Stack, Typography } from '@mui/material';
import * as React from 'react';
import TenantFormDialog, { type TenantFormValues } from './components/TenantFormDialog';
import TenantsTable from './components/TenantsTable';

export default function AdminTenantsPage() {
  const { user } = useAuth();
  const [rows, setRows] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [editingTenant, setEditingTenant] = React.useState<Tenant | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTenants();
      // Filter out administrative tenants:
      // 1. Those with plan: 'admin' (backend-driven)
      // 2. Those matching the current admin's tenantId (frontend safeguard)
      const filtered = data.filter((t) => {
        if (t.plan === 'admin') return false;
        if (user?.role === 'admin' && t._id === user.tenantId) return false;
        return true;
      });
      setRows(filtered);
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId, user?.role]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  function handleOpenCreate() {
    setEditingTenant(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(row: Tenant) {
    setEditingTenant(row);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    if (submitting) return;
    setDialogOpen(false);
    setEditingTenant(null);
  }

  async function handleSubmit(values: TenantFormValues) {
    setSubmitting(true);

    try {
      if (editingTenant) {
        const updated = await updateTenant(editingTenant._id, {
          name: values.tenantName,
          ownerEmail: values.email,
        });

        setRows((prev) => prev.map((row) => (row._id === editingTenant._id ? updated : row)));
      } else {
        await register({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          tenantName: values.tenantName.trim(),
        });

        await refresh();
      }

      setDialogOpen(false);
      setEditingTenant(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(row: Tenant) {
    const nextStatus = row.status === 'active' ? 'suspended' : 'active';

    const updated = await updateTenant(row._id, {
      status: nextStatus,
    });

    setRows((prev) => prev.map((item) => (item._id === row._id ? updated : item)));
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: -1, color: '#0F172A', mb: 0.5 }}
          >
            Tenants
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: { xs: 16, md: 18 } }}>
            Onboard and manage salon environments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{
            height: 48,
            px: 3.5,
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: landingColors.purple,
            boxShadow: `0 8px 20px ${alpha(landingColors.purple, 0.25)}`,
            '&:hover': {
              bgcolor: alpha(landingColors.purple, 0.9),
              boxShadow: `0 10px 25px ${alpha(landingColors.purple, 0.35)}`,
            },
          }}
        >
          Add new tenant
        </Button>
      </Stack>

      <TenantsTable
        rows={rows}
        loading={loading}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />

      <TenantFormDialog
        open={dialogOpen}
        submitting={submitting}
        initialValues={
          editingTenant
            ? {
                name: '',
                email: editingTenant.ownerEmail ?? '',
                password: '',
                tenantName: editingTenant.name,
              }
            : undefined
        }
        mode={editingTenant ? 'edit' : 'create'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
