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
  alpha,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';

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
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 8,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 1000, fontSize: 24, letterSpacing: -0.5, py: 3, px: 4 }}>
        {isEdit ? 'Edit Tenant' : 'Onboard New Tenant'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15, lineHeight: 1.6 }}>
            {isEdit
              ? 'Update the salon details and administrative account for this tenant.'
              : 'Setup a new salon environment and create the primary owner account.'}
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 700 }}>
              {error}
            </Alert>
          ) : null}

          <Stack spacing={2.5}>
            <TextField
              label="Owner Full Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              label="Administrative Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
              autoComplete="email"
            />

            <TextField
              label={isEdit ? 'Reset Password (optional)' : 'Account Password'}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              fullWidth
              required={!isEdit}
              type="password"
              autoComplete={isEdit ? 'current-password' : 'new-password'}
              helperText={
                isEdit
                  ? 'Leave empty to keep current password.'
                  : 'At least 8 characters recommended.'
              }
            />

            <TextField
              label="Salon Name"
              value={form.tenantName}
              onChange={(e) => setForm((prev) => ({ ...prev, tenantName: e.target.value }))}
              fullWidth
              required
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 800,
            color: '#64748B',
            borderRadius: 999,
            px: 3,
            '&:hover': { bgcolor: alpha('#64748B', 0.05) },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          sx={{
            borderRadius: 999,
            px: 4,
            fontWeight: 900,
            minHeight: 48,
            bgcolor: landingColors.purple,
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
          }}
        >
          {submitting ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Onboard Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}