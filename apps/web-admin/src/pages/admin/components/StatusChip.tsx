import { Chip, alpha } from '@mui/material';
import type { Tenant } from '@barber/shared'; 
import { landingColors } from '@barber/shared'; 

type TenantStatus = Tenant['status'];

export default function StatusChip({ status }: { status: TenantStatus }) {
    const map: Record<TenantStatus, { label: string; color: string }> = {
        active: { label: 'Active', color: landingColors.success },
        inactive: { label: 'Inactive', color: landingColors.warning },
        suspended: { label: 'Suspended', color: '#F43F5E' },
    };

    const meta = map[status];

    return (
        <Chip
            label={meta.label}
            size="small"
            sx={{
                fontWeight: 900,
                fontSize: 11.5,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                bgcolor: alpha(meta.color, 0.12),
                color: meta.color,
                border: `1px solid ${alpha(meta.color, 0.2)}`,
                height: 24,
                '& .MuiChip-label': { px: 1.2 }
            }}
        />
    );
}