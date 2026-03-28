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
  useMediaQuery,
  useTheme,
  Divider,
  Box,
} from '@mui/material';
import { landingColors } from '@barber/shared'; 
import { useToast } from '@barber/shared'; 

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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          p: 0,
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

      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            Create a new administrative account for your staff member.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
              fullWidth
              required
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              fullWidth
              required
            />

            <TextField
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 characters required."
              disabled={submitting}
              fullWidth
              required
            />

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(landingColors.purple, 0.05), border: `1px solid ${alpha(landingColors.purple, 0.1)}` }}>
              <Typography sx={{ color: landingColors.purple, fontWeight: 700, fontSize: 14 }}>
                The new member will be created with the <b>staff</b> role and can
                immediately setup their profile.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <Divider sx={{ opacity: 0.5 }} />

      <DialogActions sx={{ p: 3, px: 4, bgcolor: '#F8FAFC' }}>
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