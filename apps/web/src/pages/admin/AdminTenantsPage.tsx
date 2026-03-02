import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

type TenantStatus = 'active' | 'pending' | 'suspended';

type TenantRow = {
  id: string;
  tenantName: string;
  ownerEmail: string;
  ownersCount: number;
  employeesCount: number;
  status: TenantStatus;
  createdAt: string;
};

type CreateTenantPayload = {
  name: string;        // owner name
  email: string;       // owner email
  password: string;    // owner password
  tenantName: string;  // salon/tenant name
};

function StatusChip({ status }: { status: TenantStatus }) {
  const map: Record<TenantStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
    active: { label: 'Active', color: 'success' },
    pending: { label: 'Pending', color: 'warning' },
    suspended: { label: 'Suspended', color: 'error' },
  };
  const m = map[status];
  return <Chip label={m.label} color={m.color} size="small" sx={{ fontWeight: 900 }} />;
}

// TODO: replace with real API module
async function apiListTenants(): Promise<TenantRow[]> {
  // GET /admin/tenants
  return [
    {
      id: 't1',
      tenantName: 'Fade District',
      ownerEmail: 'owner@fadedistrict.com',
      ownersCount: 2,
      employeesCount: 6,
      status: 'active',
      createdAt: '2026-02-10',
    },
    {
      id: 't2',
      tenantName: 'Burgas Cuts',
      ownerEmail: 'admin@burgascuts.bg',
      ownersCount: 1,
      employeesCount: 3,
      status: 'pending',
      createdAt: '2026-02-22',
    },
  ];
}

async function apiCreateTenant(payload: CreateTenantPayload): Promise<void> {
  // POST /admin/tenants
  // body: payload
  await new Promise((r) => setTimeout(r, 500));
  // throw new Error('Example failure');
}

export default function AdminTenantsPage() {
  const [rows, setRows] = React.useState<TenantRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreateTenantPayload>({
    name: '',
    email: '',
    password: '',
    tenantName: '',
  });

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiListTenants();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const onOpen = () => {
    setError(null);
    setForm({ name: '', email: '', password: '', tenantName: '' });
    setOpen(true);
  };

  const onCreate = async () => {
    setError(null);

    // simple client validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.tenantName.trim()) {
      setError('Please fill all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateTenant({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        tenantName: form.tenantName.trim(),
      });
      setOpen(false);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={1000} letterSpacing={-0.6}>
            Tenants
          </Typography>
          <Typography color="text.secondary" fontWeight={650}>
            Manage salons: status, owners, and employees.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onOpen}
          sx={{ borderRadius: 999, height: 44, fontWeight: 950 }}
        >
          Add new tenant
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha('#000', 0.08),
          bgcolor: alpha('#FFFFFF', 0.85),
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(16, 24, 40, 0.06)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha('#000', 0.02) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 1000 }}>Tenant</TableCell>
                  <TableCell sx={{ fontWeight: 1000 }}>Owner email</TableCell>
                  <TableCell sx={{ fontWeight: 1000, width: 140 }}>Owners</TableCell>
                  <TableCell sx={{ fontWeight: 1000, width: 160 }}>Employees</TableCell>
                  <TableCell sx={{ fontWeight: 1000, width: 140 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 1000, width: 140 }}>Created</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary" fontWeight={650}>
                          Loading…
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary" fontWeight={650}>
                          No tenants yet.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 950 }}>{r.tenantName}</TableCell>
                      <TableCell>{r.ownerEmail}</TableCell>
                      <TableCell>{r.ownersCount}</TableCell>
                      <TableCell>{r.employeesCount}</TableCell>
                      <TableCell><StatusChip status={r.status} /></TableCell>
                      <TableCell>{r.createdAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Tenant Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 1000 }}>Add new tenant</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            <Typography color="text.secondary" fontWeight={650}>
              This creates a new tenant (salon) and the first owner account.
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Owner name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="Owner email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              fullWidth
              required
              autoComplete="email"
            />

            <TextField
              label="Owner password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              fullWidth
              required
              type="password"
              autoComplete="new-password"
              helperText="Later: enforce password rules / send invite link instead."
            />

            <TextField
              label="Tenant name (salon name)"
              value={form.tenantName}
              onChange={(e) => setForm((p) => ({ ...p, tenantName: e.target.value }))}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 999, fontWeight: 900 }}>
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={submitting}
            variant="contained"
            sx={{ borderRadius: 999, fontWeight: 950 }}
          >
            {submitting ? 'Creating…' : 'Create tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}