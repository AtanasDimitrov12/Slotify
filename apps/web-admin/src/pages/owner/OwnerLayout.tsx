import { landingColors } from '@barber/shared';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';

export default function OwnerLayout() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 74px)',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(900px 480px at 18% -10%, ${alpha(landingColors.purple, 0.06)} 0%, transparent 60%),
          radial-gradient(900px 520px at 110% 0%, ${alpha(landingColors.blue, 0.05)} 0%, transparent 55%)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, minWidth: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
