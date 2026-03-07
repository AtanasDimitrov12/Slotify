import * as React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

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
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleCreate() {
    const payload: AddStaffPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    setSubmitting(true);
    setError('');

    try {
      await onCreate(payload);
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create staff member';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.trim().length >= 6 &&
    !submitting;

  React.useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add staff member</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={submitting}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Minimum 6 characters"
            disabled={submitting}
            fullWidth
          />

          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            This will create a user with role <b>staff</b> under your tenant.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={handleCreate}
        >
          {submitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}