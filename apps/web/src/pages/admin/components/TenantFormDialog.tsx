import * as React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export type TenantFormValues = {
  name: string;
  email: string;
  password: string;
  tenantName: string;
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  submitting?: boolean;
  initialValues?: TenantFormValues;
  onClose: () => void;
  onSubmit: (values: TenantFormValues) => Promise<void> | void;
};

const emptyValues: TenantFormValues = {
  name: '',
  email: '',
  password: '',
  tenantName: '',
};

export default function TenantFormDialog({
  open,
  mode,
  submitting = false,
  initialValues,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = React.useState<TenantFormValues>(emptyValues);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(initialValues ?? emptyValues);
  }, [open, initialValues]);

  const isEdit = mode === 'edit';

  async function handleSubmit() {
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.tenantName.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    if (!isEdit && !form.password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        tenantName: form.tenantName.trim(),
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save tenant');
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 1000 }}>
        {isEdit ? 'Edit tenant' : 'Add new tenant'}
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2}>
          <Typography color="text.secondary" fontWeight={650}>
            {isEdit
              ? 'Update the tenant and owner account details.'
              : 'This creates a new tenant (salon) and the first owner account.'}
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Owner name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />

          <TextField
            label="Owner email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            required
            autoComplete="email"
          />

          <TextField
            label={isEdit ? 'New password (optional)' : 'Owner password'}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            fullWidth
            required={!isEdit}
            type="password"
            autoComplete={isEdit ? 'current-password' : 'new-password'}
            helperText={
              isEdit
                ? 'Leave empty if you do not want to change the password.'
                : 'Later: enforce password rules or send invite link instead.'
            }
          />

          <TextField
            label="Tenant name (salon name)"
            value={form.tenantName}
            onChange={(e) => setForm((prev) => ({ ...prev, tenantName: e.target.value }))}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 999, fontWeight: 900 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          sx={{ borderRadius: 999, fontWeight: 950 }}
        >
          {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save changes' : 'Create tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}