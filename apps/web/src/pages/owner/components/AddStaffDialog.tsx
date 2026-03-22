import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { landingColors } from '../../../components/landing/constants';
import { useToast } from '../../../components/ToastProvider';

export type AddStaffPayload = {
  name: string;
  email: string;
  password: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: AddStaffPayload) => void | Promise<void>;
};

export default function AddStaffDialog({ open, onClose, onCreate }: Props) {
  const { showError, showSuccess } = useToast();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
  }, []);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.trim().length >= 6 &&
    !submitting;

  async function handleCreate() {
    const payload: AddStaffPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    setSubmitting(true);

    try {
      await onCreate(payload);
      resetForm();
      showSuccess('Staff member created successfully.');
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create staff member.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 8,
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 1000,
          fontSize: 24,
          letterSpacing: -0.5,
          py: 3,
          px: 4,
        }}
      >
        Add Team Member
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stack spacing={3}>
          <Stack spacing={2.5}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
              fullWidth
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              fullWidth
            />

            <TextField
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 characters required."
              disabled={submitting}
              fullWidth
            />

            <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14 }}>
              The new member will be created with the <b>staff</b> role and can
              immediately setup their profile.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
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
          variant="contained"
          disabled={!canSubmit}
          onClick={handleCreate}
          sx={{
            borderRadius: 999,
            px: 4,
            fontWeight: 900,
            minHeight: 48,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            '&:hover': {
              bgcolor: landingColors.purple,
              filter: 'brightness(1.05)',
            },
          }}
        >
          {submitting ? 'Creating...' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}