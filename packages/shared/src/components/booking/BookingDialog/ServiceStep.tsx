import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Avatar,
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import type { CustomerProfile } from '../../../api/customerProfile';
import type { BookingOptionStaff } from '../../../api/publicTenants';
import { landingColors } from '../../landing/constants';

interface ServiceStepProps {
  staff: BookingOptionStaff[];
  profile: CustomerProfile | null;
  selectedStaffId: string;
  selectedServiceId: string;
  onSelect: (staffId: string, serviceId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  staffFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ServiceStep: React.FC<ServiceStepProps> = ({
  staff,
  profile,
  selectedStaffId,
  selectedServiceId,
  onSelect,
  searchQuery,
  onSearchChange,
  staffFilter,
  onFilterChange,
}) => {
  const filteredStaff = React.useMemo(() => {
    let result = staff;
    if (staffFilter !== 'all') {
      result = result.filter((s) => s._id === staffFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result
        .map((s) => {
          const matchesStaff = s.displayName.toLowerCase().includes(q);
          const matchedServices = s.services.filter(
            (sv) =>
              sv.name.toLowerCase().includes(q) ||
              (sv.description?.toLowerCase() || '').includes(q),
          );
          if (matchesStaff || matchedServices.length > 0) {
            return { ...s, services: matchesStaff ? s.services : matchedServices };
          }
          return null;
        })
        .filter((s): s is BookingOptionStaff => s !== null);
    }
    return result;
  }, [staff, searchQuery, staffFilter]);

  return (
    <Stack spacing={3} sx={{ mt: 0.5 }}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder="Search treatments or stylists..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              '& fieldset': { borderColor: 'rgba(15,23,42,0.08)' },
            },
          }}
        />

        {staff.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={staffFilter}
              onChange={(_, v) => onFilterChange(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  minWidth: 0,
                  px: 2,
                  py: 1,
                  minHeight: 40,
                },
                '& .Mui-selected': { color: landingColors.purple },
                '& .MuiTabs-indicator': {
                  bgcolor: landingColors.purple,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label="All Experts" value="all" />
              {staff.map((s) => (
                <Tab key={s._id} label={s.displayName} value={s._id} />
              ))}
            </Tabs>
          </Box>
        )}
      </Stack>

      <Stack spacing={4} sx={{ pb: 2 }}>
        {filteredStaff.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 700, fontSize: 15 }}>
              No results for "{searchQuery}"
            </Typography>
            <Typography sx={{ color: 'text.secondary', opacity: 0.6, fontSize: 13, mt: 0.5 }}>
              Try a different keyword or professional.
            </Typography>
          </Box>
        ) : (
          filteredStaff.map((member) => (
            <Stack key={member._id} spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={member.avatarUrl}
                  sx={{
                    width: 44,
                    height: 44,
                    border: `2px solid ${alpha(landingColors.purple, 0.15)}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  {member.displayName[0]}
                </Avatar>
                <Box>
                  <Typography
                    sx={{ fontWeight: 900, fontSize: 16, color: '#0F172A', lineHeight: 1.2 }}
                  >
                    {member.displayName}
                  </Typography>
                  <Typography
                    sx={{
                      color: landingColors.purple,
                      fontWeight: 800,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      mt: 0.25,
                    }}
                  >
                    {member.experienceYears || 0} Years Experience
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.25}>
                {member.services.map((service) => {
                  const selected =
                    selectedServiceId === service._id && selectedStaffId === member._id;
                  const isPreferred = profile?.preferredServiceIds?.includes(
                    service.originalServiceId,
                  );
                  return (
                    <Card
                      key={service._id}
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                        bgcolor: selected ? alpha(landingColors.purple, 0.03) : '#FFFFFF',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        '&:hover': {
                          borderColor: landingColors.purple,
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <CardActionArea onClick={() => onSelect(member._id, service._id)}>
                        <CardContent sx={{ p: 2, pr: 2.5 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 0.25 }}
                              >
                                <Typography
                                  sx={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}
                                >
                                  {service.name}
                                </Typography>
                                {isPreferred && (
                                  <Chip
                                    label="Preferred"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: 9,
                                      fontWeight: 900,
                                      bgcolor: alpha(landingColors.purple, 0.1),
                                      color: landingColors.purple,
                                      border: `1px solid ${alpha(landingColors.purple, 0.2)}`,
                                    }}
                                  />
                                )}
                              </Stack>
                              {service.description && (
                                <Typography
                                  sx={{
                                    color: '#64748B',
                                    fontWeight: 500,
                                    fontSize: 12.5,
                                    lineHeight: 1.4,
                                    maxWidth: '90%',
                                  }}
                                >
                                  {service.description}
                                </Typography>
                              )}
                            </Box>
                            <Stack alignItems="flex-end" sx={{ minWidth: 70 }}>
                              <Typography
                                sx={{ fontWeight: 1000, fontSize: 17, color: landingColors.purple }}
                              >
                                €{service.priceEUR}
                              </Typography>
                              <Typography
                                sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 11, mt: -0.25 }}
                              >
                                {service.durationMin} MIN
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
    </Stack>
  );
};
