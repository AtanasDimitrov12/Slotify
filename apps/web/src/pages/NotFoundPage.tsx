import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" fontWeight={700}>
        404
      </Typography>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Page not found
      </Typography>

      <Button variant="contained" onClick={() => navigate('/')}>
        Go back home
      </Button>
    </Box>
  );
}