import { Stack, TextField } from '@mui/material';
import type * as React from 'react';

interface DetailsStepProps {
  customerName: string;
  onNameChange: (val: string) => void;
  customerPhone: string;
  onPhoneChange: (val: string) => void;
  customerEmail: string;
  onEmailChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  isLoggedIn: boolean;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  customerName,
  onNameChange,
  customerPhone,
  onPhoneChange,
  customerEmail,
  onEmailChange,
  notes,
  onNotesChange,
  isLoggedIn,
}) => {
  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <Stack spacing={2.5}>
        <TextField
          label="Full Name"
          value={customerName}
          onChange={(e) => onNameChange(e.target.value)}
          fullWidth
          required
          disabled={isLoggedIn}
          InputProps={{ sx: { borderRadius: 3 } }}
        />
        <TextField
          label="Phone Number"
          value={customerPhone}
          onChange={(e) => onPhoneChange(e.target.value)}
          fullWidth
          required
          InputProps={{ sx: { borderRadius: 3 } }}
        />
        <TextField
          label="Email Address"
          value={customerEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          fullWidth
          disabled={isLoggedIn}
          InputProps={{ sx: { borderRadius: 3 } }}
        />
        <TextField
          label="Special Requests (optional)"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          multiline
          rows={3}
          fullWidth
          InputProps={{ sx: { borderRadius: 3 } }}
        />
      </Stack>
    </Stack>
  );
};
