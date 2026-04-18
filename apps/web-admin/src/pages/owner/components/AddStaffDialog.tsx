import type { AvailableStaffListItem } from '@barber/shared';
import { landingColors, listAvailableStaffForOwner, useToast } from '@barber/shared';
import {
  Avatar,
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';

export type AddStaffPayload = {
  name: string;
  email: string;
  password?: string;
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
  const [availableStaff, setAvailableStaff] = React.useState<AvailableStaffListItem[]>([]);
  const [isSelectedExisting, setIsSelectedExisting] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setIsSelectedExisting(false);
  }, []);

  const handleClose = React.useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    (isSelectedExisting || password.trim().length >= 6) &&
    !submitting;

  async function handleCreate() {
    const payload: AddStaffPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    if (!isSelectedExisting) {
      payload.password = password.trim();
    }

    setSubmitting(true);

    try {
      await onCreate(payload);
      resetForm();
      showSuccess('Staff member added successfully.');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add staff member.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  React.useEffect(() => {
    if (open) {
      void listAvailableStaffForOwner().then(setAvailableStaff).catch(console.error);
    } else {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSelectExisting = (staff: AvailableStaffListItem) => {
    setName(staff.name);
    setEmail(staff.email);
    setPassword('');
    setIsSelectedExisting(true);
  };

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
          {availableStaff.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#64748B',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Available from your other salons
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {availableStaff.map((staff) => (
                  <Chip
                    key={staff.userId}
                    avatar={<Avatar src={staff.photoUrl}>{staff.name.charAt(0)}</Avatar>}
                    label={staff.name}
                    onClick={() => handleSelectExisting(staff)}
                    sx={{
                      fontWeight: 700,
                      bgcolor:
                        email === staff.email ? alpha(landingColors.purple, 0.1) : 'transparent',
                      borderColor:
                        email === staff.email ? landingColors.purple : 'rgba(15,23,42,0.1)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      '&:hover': {
                        bgcolor: alpha(landingColors.purple, 0.05),
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>
            {isSelectedExisting
              ? 'Re-assigning existing staff member to this salon. Their profile and settings will be reused.'
              : 'Create a new administrative account for your staff member.'}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsSelectedExisting(false);
              }}
              autoFocus
              disabled={submitting}
              fullWidth
              required
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsSelectedExisting(false);
              }}
              disabled={submitting}
              fullWidth
              required
            />

            {!isSelectedExisting && (
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
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(landingColors.purple, 0.05),
                border: `1px solid ${alpha(landingColors.purple, 0.1)}`,
              }}
            >
              <Typography sx={{ color: landingColors.purple, fontWeight: 700, fontSize: 14 }}>
                The member will have the <b>staff</b> role and can immediately manage their schedule
                for this salon.
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
          {submitting ? 'Processing...' : isSelectedExisting ? 'Add to Team' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
