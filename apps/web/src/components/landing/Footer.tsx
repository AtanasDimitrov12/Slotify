import { Divider, Stack, Typography } from '@mui/material';

export function Footer() {
  return (
    <>
      <Divider sx={{ mt: 1 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} justifyContent="space-between" sx={{ pb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} Slotify
        </Typography>
        <Stack direction="row" spacing={2}>
          {['Privacy (later)', 'Terms (later)', 'Contact (later)'].map((t) => (
            <Typography key={t} variant="body2" sx={{ color: 'text.secondary' }}>
              {t}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </>
  );
}
