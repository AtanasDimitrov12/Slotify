import * as React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TenantFormDialog, { type TenantFormValues } from './components/TenantFormDialog';
import TenantsTable from './components/TenantsTable';
import { register } from '../../api/auth';
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
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={1000} letterSpacing={-0.6}>
            Tenants
          </Typography>
          <Typography color="text.secondary" fontWeight={650}>
            Manage salons and tenant status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 999, height: 44, fontWeight: 950 }}
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