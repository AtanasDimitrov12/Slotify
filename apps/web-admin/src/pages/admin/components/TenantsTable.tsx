import type { Tenant } from '@barber/shared';
import { landingColors } from '@barber/shared';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TenantsTable({ rows, loading, onEdit, onToggleStatus }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Stack spacing={2.5}>
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: landingColors.purple }} />
          </Box>
        ) : rows.length === 0 ? (
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px dashed #CBD5E1',
              bgcolor: 'transparent',
            }}
          >
            <Typography sx={{ color: '#94A3B8', fontWeight: 700 }}>No salons found</Typography>
          </Card>
        ) : (
          rows.map((row) => (
            <Card
              key={row._id}
              sx={{
                borderRadius: 4,
                border: '1px solid rgba(15,23,42,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                maxWidth: 450,
                mx: 'auto',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography sx={{ fontWeight: 1000, fontSize: 17, color: '#0F172A' }}>
                        {row.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#94A3B8', fontWeight: 600, fontFamily: 'monospace' }}
                      >
                        {row.slug || 'no-slug'}
                      </Typography>
                    </Box>
                    <StatusChip status={row.status} />
                  </Stack>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#F8FAFC',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                        }}
                      >
                        Plan
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                        {row.plan ? row.plan.toUpperCase() : 'BASIC'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                        }}
                      >
                        Published
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: row.isPublished ? landingColors.success : '#94A3B8',
                        }}
                      >
                        {row.isPublished ? 'YES' : 'NO'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#94A3B8',
                          textTransform: 'uppercase',
                        }}
                      >
                        Created
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                        {formatDate(row.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => onEdit(row)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        textTransform: 'none',
                        borderColor: 'rgba(15,23,42,0.1)',
                        color: '#475569',
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color={row.status === 'active' ? 'error' : 'success'}
                      onClick={() => onToggleStatus(row)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        textTransform: 'none',
                        borderColor:
                          row.status === 'active'
                            ? alpha('#F43F5E', 0.2)
                            : alpha(landingColors.success, 0.2),
                      }}
                    >
                      {row.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(15,23,42,0.06)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(15,23,42,0.02)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(landingColors.purple, 0.02) }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    py: 2,
                  }}
                >
                  Tenant
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                  }}
                >
                  Plan
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    width: 130,
                  }}
                >
                  Published
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    width: 130,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    width: 140,
                  }}
                >
                  Created
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#64748B',
                    width: 220,
                    textAlign: 'right',
                    pr: 4,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: '#94A3B8', fontWeight: 500, fontSize: 14 }}>
                        Fetching tenants...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                      <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 16 }}>
                        No salons found in the platform.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const isActive = row.status === 'active';

                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ py: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>
                          {row.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#94A3B8', fontWeight: 500, fontFamily: 'monospace' }}
                        >
                          {row.slug || 'no-slug'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>
                          {row.plan ? row.plan.toUpperCase() : 'BASIC'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: row.isPublished ? landingColors.success : '#94A3B8',
                          }}
                        >
                          {row.isPublished ? 'YES' : 'NO'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, fontSize: 13, color: '#64748B' }}>
                          {formatDate(row.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ pr: 4 }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => onEdit(row)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: 13,
                              px: 2,
                              color: '#475569',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: alpha('#0F172A', 0.04),
                              },
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color={isActive ? 'error' : 'success'}
                            onClick={() => onToggleStatus(row)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: 13,
                              px: 2,
                              textTransform: 'none',
                              borderColor: isActive
                                ? alpha('#F43F5E', 0.2)
                                : alpha(landingColors.success, 0.2),
                              color: isActive ? '#F43F5E' : landingColors.success,
                              '&:hover': {
                                bgcolor: isActive
                                  ? alpha('#F43F5E', 0.04)
                                  : alpha(landingColors.success, 0.04),
                                borderColor: isActive
                                  ? alpha('#F43F5E', 0.4)
                                  : alpha(landingColors.success, 0.4),
                              },
                            }}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
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
