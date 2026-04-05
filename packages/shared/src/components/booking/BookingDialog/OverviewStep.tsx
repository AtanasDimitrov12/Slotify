import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { Avatar, alpha, Box, Divider, Stack, Typography } from '@mui/material';
import type * as React from 'react';
import { landingColors } from '../../landing/constants';
import { formatSlotDateTime } from './utils';

interface OverviewStepProps {
  selectedService?: { name: string; durationMin: number; priceEUR: number };
  selectedStaffMember?: { displayName: string; avatarUrl?: string };
  selectedSlot?: { startTime: string };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export const OverviewStep: React.FC<OverviewStepProps> = ({
  selectedService,
  selectedStaffMember,
  selectedSlot,
  customerName,
  customerPhone,
  customerEmail,
}) => {
  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: alpha(landingColors.purple, 0.03),
          border: '1px solid',
          borderColor: alpha(landingColors.purple, 0.1),
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: landingColors.purple,
                display: 'grid',
                placeItems: 'center',
                color: '#FFF',
              }}
            >
              <ContentCutRoundedIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Treatment
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                {selectedService?.name}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                {selectedService?.durationMin} min • €{selectedService?.priceEUR}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={2}>
            <Avatar
              src={selectedStaffMember?.avatarUrl}
              sx={{ width: 48, height: 48, borderRadius: 2 }}
            >
              {selectedStaffMember?.displayName[0]}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Professional
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                {selectedStaffMember?.displayName}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: alpha(landingColors.success, 0.1),
                display: 'grid',
                placeItems: 'center',
                color: landingColors.success,
              }}
            >
              <EventAvailableRoundedIcon />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Date & Time
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: landingColors.purple }}>
                {selectedSlot ? formatSlotDateTime(selectedSlot.startTime) : ''}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            mb: 1,
          }}
        >
          Your Information
        </Typography>
        <Typography sx={{ fontWeight: 700 }}>{customerName}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{customerPhone}</Typography>
        {customerEmail && (
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{customerEmail}</Typography>
        )}
      </Box>
    </Stack>
  );
};
