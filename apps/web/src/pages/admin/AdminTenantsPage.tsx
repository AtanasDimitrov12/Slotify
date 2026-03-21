import * as React from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TenantFormDialog, { type TenantFormValues } from './components/TenantFormDialog';
import TenantsTable from './components/TenantsTable';
import { register } from '../../api/auth';
import { landingColors } from '../../components/landing/constants';
import {
  listTenants,
  updateTenant,
  type Tenant,
} from '../../api/tenants';

export default function AdminTenantsPage() {
  const [rows, setRows] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [editingTenant, setEditingTenant] = React.useState<Tenant | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTenants();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

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

        setRows((prev) =>
          prev.map((row) => (row._id === editingTenant._id ? updated : row))
        );
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

    setRows((prev) =>
      prev.map((item) => (item._id === row._id ? updated : item))
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A' }}>
            Tenants
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18 }}>
            Onboard and manage salon environments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{
            minHeight: 54,
            px: 3.5,
            borderRadius: 999,
            fontWeight: 900,
            fontSize: 15,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
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