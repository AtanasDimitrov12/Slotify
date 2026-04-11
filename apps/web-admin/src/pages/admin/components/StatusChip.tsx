import type { Tenant } from '@barber/shared';
import { landingColors } from '@barber/shared';
import { alpha, Box, Typography } from '@mui/material';

type TenantStatus = Tenant['status'];

const STATUS_CONFIG: Record<TenantStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: landingColors.success },
  inactive: { label: 'Inactive', color: landingColors.warning },
  suspended: { label: 'Suspended', color: '#F43F5E' },
};

export default function StatusChip({ status }: { status: TenantStatus }) {
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
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: config.color,
          boxShadow: `0 0 8px ${alpha(config.color, 0.4)}`,
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
