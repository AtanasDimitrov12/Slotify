import type { StaffAppointment } from '@barber/shared';
import { landingColors } from '@barber/shared';
import { alpha, Box, Typography } from '@mui/material';

const STATUS_CONFIG: Record<StaffAppointment['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#F59E0B' },
  confirmed: { label: 'Upcoming', color: landingColors.purple },
  completed: { label: 'Done', color: '#10B981' },
  'no-show': { label: 'No-show', color: '#EF4444' },
  cancelled: { label: 'Cancelled', color: '#94A3B8' },
};

export default function AppointmentStatusChip({ status }: { status: StaffAppointment['status'] }) {
  const config = STATUS_CONFIG[status];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 2,
        bgcolor: alpha(config.color, 0.08),
        border: `1px solid ${alpha(config.color, 0.15)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(config.color, 0.12),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: config.color,
          boxShadow: `0 0 8px ${alpha(config.color, 0.4)}`,
          ...(status === 'pending' && {
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.5)', opacity: 0.5 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }),
        }}
      />
      <Typography
        sx={{
          color: config.color,
          fontWeight: 800,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}
