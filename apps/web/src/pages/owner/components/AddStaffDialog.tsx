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

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
  }

  function handleClose() {
    onClose();
  }

  async function handleCreate() {
    const payload: AddStaffPayload = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    await onCreate(payload);
    resetForm();
    onClose();
  }

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.trim().length >= 6;

  React.useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add staff member</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Minimum 6 characters"
          />

          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            This will create a user with role <b>staff</b> under your tenant.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={handleCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}