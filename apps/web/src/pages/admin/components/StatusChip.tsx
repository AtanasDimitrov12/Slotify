import { Chip } from '@mui/material';
import type { Tenant } from '../../../api/tenants';

type TenantStatus = Tenant['status'];

export default function StatusChip({ status }: { status: TenantStatus }) {
    const map: Record<TenantStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
        active: { label: 'Active', color: 'success' },
        inactive: { label: 'Inactive', color: 'warning' },
        suspended: { label: 'Suspended', color: 'error' },
    };

    const meta = map[status];

    return <Chip label={meta.label} color={meta.color} size="small" sx={{ fontWeight: 900 }} />;
}