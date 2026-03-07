import * as React from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Tenant } from '../../../api/tenants';
import StatusChip from './StatusChip';

type Props = {
  rows: Tenant[];
  loading: boolean;
  onEdit: (row: Tenant) => void;
  onToggleStatus: (row: Tenant) => void;
};

function formatDate(value: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

export default function TenantsTable({ rows, loading, onEdit, onToggleStatus }: Props) {
  return (
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
                <TableCell sx={{ fontWeight: 1000 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 1000, width: 130 }}>Published</TableCell>
                <TableCell sx={{ fontWeight: 1000, width: 130 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 1000, width: 140 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 1000, width: 220 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ p: 2 }}>
                      <Typography color="text.secondary" fontWeight={650}>
                        Loading…
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ p: 2 }}>
                      <Typography color="text.secondary" fontWeight={650}>
                        No tenants yet.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isActive = row.status === 'active';

                  return (
                    <TableRow key={row._id} hover>
                      <TableCell sx={{ fontWeight: 950 }}>{row.name}</TableCell>
                      <TableCell>{row.plan || '-'}</TableCell>
                      <TableCell>{row.isPublished ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onEdit(row)}
                            sx={{ borderRadius: 999, fontWeight: 800 }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color={isActive ? 'error' : 'success'}
                            onClick={() => onToggleStatus(row)}
                            sx={{ borderRadius: 999, fontWeight: 800 }}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}