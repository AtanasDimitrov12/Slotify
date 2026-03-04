import * as React from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import TimeOffRequestDialog, { type TimeOffPayload } from './components/TimeOffRequestDialog';
import type { TimeOffRequest } from './components/types';

const seed: TimeOffRequest[] = [
  { id: 't1', startDate: '2026-03-10', endDate: '2026-03-12', status: 'pending', createdAt: new Date().toISOString() },
  { id: 't2', startDate: '2026-02-01', endDate: '2026-02-02', status: 'approved', createdAt: new Date().toISOString() },
];

function StatusChip({ status }: { status: TimeOffRequest['status'] }) {
  const label = status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected';
  return <Chip label={label} size="small" />;
}

export default function StaffTimeOffPage() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<TimeOffRequest[]>(seed);

  async function handleSubmit(payload: TimeOffPayload) {
    // TODO: POST /staff/me/time-off
    const next: TimeOffRequest = {
      id: String(Date.now()),
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setItems((p) => [next, ...p]);
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            Time off
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            Request time off. The owner will approve or reject it.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Request time off
        </Button>
      </Box>

      <Stack spacing={2}>
        {items.map((r) => (
          <Card key={r.id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={900}>
                  {r.startDate} → {r.endDate}
                </Typography>
                {r.reason ? (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {r.reason}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    No reason provided
                  </Typography>
                )}
              </Box>
              <StatusChip status={r.status} />
            </CardContent>
          </Card>
        ))}
      </Stack>

      <TimeOffRequestDialog open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </Stack>
  );
}