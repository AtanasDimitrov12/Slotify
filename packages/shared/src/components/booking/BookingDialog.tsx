import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  MobileStepper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { type CustomerProfile, getMyCustomerProfile } from '../../api/customerProfile';
import {
  type AvailabilitySlot,
  type BookingOptionService,
  type BookingOptionStaff,
  createReservation,
  getAvailability,
  getBookingOptions,
} from '../../api/publicTenants';
import { useAuth } from '../../auth/AuthProvider';
import { landingColors } from '../landing/constants';
import { useToast } from '../ToastProvider';

type BookingDialogProps = {
  open: boolean;
  slug: string;
  salonName: string;
  onClose: () => void;
};

const STEP_SERVICE = 0;
const STEP_STAFF = 1;
const STEP_TIME = 2;
const STEP_DETAILS = 3;
const STEP_SUCCESS = 4;

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSlotTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSlotDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNextDays(count: number) {
  const result: Date[] = [];
  const base = new Date();

  for (let i = 0; i < count; i += 1) {
    const day = new Date(base);
    day.setDate(base.getDate() + i);
    result.push(day);
  }

  return result;
}

function formatDayChip(date: Date) {
  return {
    value: formatDateInput(date),
    title: date.toLocaleDateString([], { weekday: 'short' }),
    subtitle: date.toLocaleDateString([], { day: '2-digit', month: 'short' }),
  };
}

function isQuarterHourSlot(slot: AvailabilitySlot) {
  const date = new Date(slot.startTime);
  const minutes = date.getMinutes();
  return minutes % 15 === 0;
}

function calculateCustomerBonus(slot: AvailabilitySlot, profile: CustomerProfile | null): number {
  if (!profile) return 0;
  let bonus = 0;

  const date = new Date(slot.startTime);
  const hour = date.getHours();
  const day = date.getDay();

  // Match preferred time of day
  if (profile.preferredTimeOfDay === 'morning' && hour < 12) bonus += 500;
  if (profile.preferredTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) bonus += 500;
  if (profile.preferredTimeOfDay === 'evening' && hour >= 17) bonus += 500;

  // Match preferred days
  if (profile.preferredDaysOfWeek?.includes(day)) bonus += 300;

  // Match specific slots
  if (profile.preferredBookingSlots) {
    for (const pSlot of profile.preferredBookingSlots) {
      if (pSlot.dayOfWeek === day) {
        if (pSlot.timeSlot === 'morning' && hour < 12) bonus += 1000;
        else if (pSlot.timeSlot === 'afternoon' && hour >= 12 && hour < 17) bonus += 1000;
        else if (pSlot.timeSlot === 'evening' && hour >= 17) bonus += 1000;
        else if (pSlot.timeSlot === 'All Day') bonus += 1000;
        else if (pSlot.timeSlot.includes(' - ')) {
          const [start, end] = pSlot.timeSlot.split(' - ');
          const currentTime = `${hour.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          if (currentTime >= start && currentTime <= end) bonus += 1500;
        }
      }
    }
  }

  return bonus;
}

function groupSlots(allSlots: AvailabilitySlot[], profile: CustomerProfile | null) {
  const slotsWithAdjustedScore = allSlots.map((s) => {
    const customerBonus = calculateCustomerBonus(s, profile);
    return {
      ...s,
      combinedScore: s.score + customerBonus,
      isCustomerPreferred: customerBonus > 0,
      isStaffOptimized: s.score >= 1000,
      customerBonus,
    };
  });

  const sortedByCombined = [...slotsWithAdjustedScore].sort(
    (a, b) => b.combinedScore - a.combinedScore,
  );

  // Diverse recommendations:
  // 1. Top absolute combined fits
  // 2. Top customer-only fits (if not in top 4)
  // 3. Top staff-only fits (if not in top 4)
  const recommendedSet = new Set<string>();
  const recommended: (AvailabilitySlot & {
    isCustomerPreferred: boolean;
    isStaffOptimized: boolean;
  })[] = [];

  const addRecommended = (s: any) => {
    const key = `${s.staffId}-${s.startTime}`;
    if (!recommendedSet.has(key) && recommended.length < 6) {
      recommendedSet.add(key);
      recommended.push(s);
    }
  };

  // Add top 3 combined
  sortedByCombined.slice(0, 3).forEach(addRecommended);

  // Ensure at least one customer favorite if exists
  const topCustomer = sortedByCombined
    .filter((s) => s.isCustomerPreferred)
    .sort((a, b) => b.customerBonus - a.customerBonus)[0];
  if (topCustomer) addRecommended(topCustomer);

  // Ensure at least one staff optimized if exists
  const topStaff = sortedByCombined
    .filter((s) => s.isStaffOptimized)
    .sort((a, b) => b.score - a.score)[0];
  if (topStaff) addRecommended(topStaff);

  // Fill up to 4 if still room
  sortedByCombined.slice(0, 4).forEach(addRecommended);

  const groups: Record<
    'Recommended' | 'Morning' | 'Afternoon' | 'Evening',
    (AvailabilitySlot & { isCustomerPreferred: boolean; isStaffOptimized: boolean })[]
  > = {
    Recommended: recommended.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    ),
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  const filteredSlots = slotsWithAdjustedScore.filter(isQuarterHourSlot);

  filteredSlots.forEach((slot) => {
    const hour = new Date(slot.startTime).getHours();

    if (hour < 12) {
      groups.Morning.push(slot);
    } else if (hour < 17) {
      groups.Afternoon.push(slot);
    } else {
      groups.Evening.push(slot);
    }
  });

  for (const key of Object.keys(groups) as Array<keyof typeof groups>) {
    groups[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  return groups;
}

export default function BookingDialog({ open, slug, salonName, onClose }: BookingDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { showError } = useToast();
  const { user } = useAuth();

  const [step, setStep] = React.useState<number>(STEP_SERVICE);

  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [optionsError, setOptionsError] = React.useState('');
  const [services, setServices] = React.useState<BookingOptionService[]>([]);
  const [staff, setStaff] = React.useState<BookingOptionStaff[]>([]);
  const [maxDays, setMaxDays] = React.useState(14);
  const [profile, setProfile] = React.useState<CustomerProfile | null>(null);

  const [selectedServiceId, setSelectedServiceId] = React.useState('');
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(formatDateInput(new Date()));
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [slotsError, setSlotsError] = React.useState('');
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<AvailabilitySlot | null>(null);

  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const nextDays = React.useMemo(() => getNextDays(Math.max(maxDays, 14)), [maxDays]);
  const groupedSlots = React.useMemo(() => groupSlots(slots, profile), [slots, profile]);

  const selectedService = services.find((item) => item._id === selectedServiceId);

  React.useEffect(() => {
    if (!open) return;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setOptionsError('');
        setSuccessMessage('');
        setStep(STEP_SERVICE);

        const [result, profileData] = await Promise.all([
          getBookingOptions(slug),
          user ? getMyCustomerProfile().catch(() => null) : Promise.resolve(null),
        ]);

        setServices(result.services);
        setStaff(result.staff);
        setMaxDays(result.maximumDaysInAdvance);
        setProfile(profileData);

        if (profileData) {
          // Auto-fill credentials
          setCustomerName(user?.name || '');
          setCustomerEmail(user?.email || '');
          setCustomerPhone(profileData.phone || '');

          // Smart preference match for service
          if (profileData.preferredServiceIds?.length) {
            const match = result.services.find((s) =>
              profileData.preferredServiceIds?.includes(s._id),
            );
            if (match) setSelectedServiceId(match._id);
          } else if (result.services.length === 1) {
            setSelectedServiceId(result.services[0]._id);
          }

          // Smart preference match for staff
          if (profileData.preferredStaffIds?.length) {
            const match = result.staff.find((s) => profileData.preferredStaffIds?.includes(s._id));
            if (match) setSelectedStaffId(match._id);
          } else if (result.staff.length === 1) {
            setSelectedStaffId(result.staff[0]._id);
          }
        } else {
          if (result.services.length === 1) {
            setSelectedServiceId(result.services[0]._id);
          }
          if (result.staff.length === 1) {
            setSelectedStaffId(result.staff[0]._id);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load booking options';
        setOptionsError(msg);
        showError(msg);
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadOptions();
  }, [open, slug, showError, user]);

  React.useEffect(() => {
    if (!open || !selectedServiceId || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    async function loadAvailability() {
      try {
        setSlotsLoading(true);
        setSlotsError('');
        setSelectedSlot(null);

        const result = await getAvailability({
          slug,
          serviceId: selectedServiceId,
          staffId: selectedStaffId || undefined,
          date: new Date(`${selectedDate}T12:00:00`).toISOString(),
        });

        setSlots(result.slots);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load availability';
        setSlotsError(msg);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    void loadAvailability();
  }, [open, slug, selectedServiceId, selectedStaffId, selectedDate]);

  function resetState() {
    setStep(STEP_SERVICE);
    setSelectedServiceId('');
    setSelectedStaffId('');
    setSelectedDate(formatDateInput(new Date()));
    setSlots([]);
    setSelectedSlot(null);
    setCustomerName(user?.name || '');
    setCustomerPhone(profile?.phone || '');
    setCustomerEmail(user?.email || '');
    setNotes('');
    setSuccessMessage('');
    setOptionsError('');
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleBack() {
    if (step === STEP_SERVICE) {
      handleClose();
      return;
    }
    setStep((prev) => Math.max(prev - 1, STEP_SERVICE));
  }

  function handleNext() {
    if (step === STEP_SERVICE) {
      if (!selectedServiceId) return;
      setStep(STEP_STAFF);
      return;
    }
    if (step === STEP_STAFF) {
      setStep(STEP_TIME);
      return;
    }
    if (step === STEP_TIME) {
      if (!selectedSlot) return;
      // Skip details step if already logged in and filled
      if (user && customerName && customerPhone) {
        handleConfirm();
      } else {
        setStep(STEP_DETAILS);
      }
    }
  }

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const validatePhone = (phone: string) => {
    return /^[+()\-\s0-9]{5,40}$/.test(phone);
  };

  async function handleConfirm() {
    const finalSlot = selectedSlot;
    if (!selectedServiceId || !finalSlot) {
      showError('Please choose a service and a time slot.');
      return;
    }

    if (!customerName.trim()) {
      setStep(STEP_DETAILS);
      showError('Please fill in your full name.');
      return;
    }

    if (!customerPhone.trim() || !validatePhone(customerPhone)) {
      setStep(STEP_DETAILS);
      showError('Please provide a valid phone number.');
      return;
    }

    try {
      setSubmitLoading(true);

      await createReservation(slug, {
        serviceId: selectedServiceId,
        staffId: finalSlot.staffId,
        startTime: finalSlot.startTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMessage('Your booking was created successfully.');
      setStep(STEP_SUCCESS);
    } catch (err) {
      showError(err);
    } finally {
      setSubmitLoading(false);
    }
  }

  const canContinueFromService = !!selectedServiceId;
  const canContinueFromTime = !!selectedSlot;
  const canConfirm =
    !!selectedServiceId &&
    !!selectedSlot &&
    !!customerName.trim() &&
    !!customerPhone.trim() &&
    !submitLoading;

  function renderSummary() {
    if (step === STEP_SUCCESS) return null;

    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(landingColors.purple, 0.04),
          border: `1px solid ${alpha(landingColors.purple, 0.08)}`,
        }}
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            icon={<ContentCutRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            label={selectedService ? selectedService.name : 'Service'}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: selectedService ? alpha(landingColors.purple, 0.1) : 'transparent',
              color: selectedService ? landingColors.purple : 'text.secondary',
              border: `1px solid ${selectedService ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.06)'}`,
            }}
          />
          <Chip
            icon={<PersonRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            label={
              selectedSlot
                ? (staff.find((member) => member._id === selectedSlot.staffId)?.displayName ??
                  'Staff')
                : (staff.find((m) => m._id === selectedStaffId)?.displayName ?? 'Any Staff')
            }
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor:
                selectedStaffId || selectedSlot ? alpha(landingColors.purple, 0.1) : 'transparent',
              color: selectedStaffId || selectedSlot ? landingColors.purple : 'text.secondary',
              border: `1px solid ${selectedStaffId || selectedSlot ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.06)'}`,
            }}
          />
          <Chip
            icon={<EventAvailableRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            label={selectedSlot ? formatSlotTime(selectedSlot.startTime) : 'Time'}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: selectedSlot ? alpha(landingColors.purple, 0.1) : 'transparent',
              color: selectedSlot ? landingColors.purple : 'text.secondary',
              border: `1px solid ${selectedSlot ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.06)'}`,
            }}
          />
        </Stack>
      </Box>
    );
  }

  function renderServiceStep() {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A' }}>
            Select Service
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 15 }}>
            Choose the treatment you would like to receive.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {services.map((service) => {
            const selected = selectedServiceId === service._id;
            const isPreferred = profile?.preferredServiceIds?.includes(service._id);
            return (
              <Card
                key={service._id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.08)',
                  bgcolor: selected ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    borderColor: landingColors.purple,
                  },
                }}
              >
                {isPreferred && (
                  <Chip
                    icon={<FavoriteRoundedIcon sx={{ fontSize: '12px !important' }} />}
                    label="Preferred"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      height: 20,
                      fontSize: 10,
                      fontWeight: 800,
                      bgcolor: alpha(landingColors.purple, 0.1),
                      color: landingColors.purple,
                      border: `1px solid ${alpha(landingColors.purple, 0.2)}`,
                    }}
                  />
                )}
                <CardActionArea onClick={() => setSelectedServiceId(service._id)}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                          {service.name}
                        </Typography>
                        {service.description ? (
                          <Typography
                            sx={{ color: '#64748B', fontWeight: 500, fontSize: 13, mt: 0.5 }}
                          >
                            {service.description}
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 13 }}>
                          {service.durationMin} min
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 800, fontSize: 16, color: landingColors.purple }}
                        >
                          €{service.priceEUR}
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
    );
  }

  function renderStaffStep() {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A' }}>
            Select Staff
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 15 }}>
            Pick your professional or choose anyone available.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: selectedStaffId === '' ? landingColors.purple : 'rgba(15,23,42,0.08)',
              bgcolor: selectedStaffId === '' ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
              transition: 'all 0.2s ease',
            }}
          >
            <CardActionArea onClick={() => setSelectedStaffId('')}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                  Any available professional
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 13, mt: 0.5 }}>
                  Show the best available time slots.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {staff.map((member) => {
            const selected = selectedStaffId === member._id;
            const isPreferred = profile?.preferredStaffIds?.includes(member._id);
            return (
              <Card
                key={member._id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.08)',
                  bgcolor: selected ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {isPreferred && (
                  <Chip
                    icon={<FavoriteRoundedIcon sx={{ fontSize: '12px !important' }} />}
                    label="Preferred"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      height: 20,
                      fontSize: 10,
                      fontWeight: 800,
                      bgcolor: alpha(landingColors.purple, 0.1),
                      color: landingColors.purple,
                      border: `1px solid ${alpha(landingColors.purple, 0.2)}`,
                    }}
                  />
                )}
                <CardActionArea onClick={() => setSelectedStaffId(member._id)}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                      {member.displayName}
                    </Typography>
                    {member.bio ? (
                      <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 13, mt: 0.5 }}>
                        {member.bio}
                      </Typography>
                    ) : null}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  function renderTimeStep() {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A' }}>
            Pick Time
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 15 }}>
            Select an available slot for your appointment.
          </Typography>
        </Box>

        <Box
          sx={{
            mx: -1,
            px: 1,
            overflowX: 'auto',
            pb: 1,
            // Improved scrollbar visibility for desktop users
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(landingColors.purple, 0.2),
              borderRadius: 3,
            },
          }}
        >
          <Stack direction="row" spacing={1}>
            {nextDays.map((date) => {
              const day = formatDayChip(date);
              const selected = selectedDate === day.value;
              const isPreferred = profile?.preferredDaysOfWeek?.includes(date.getDay());
              return (
                <Box
                  key={day.value}
                  onClick={() => setSelectedDate(day.value)}
                  sx={{
                    minWidth: 80,
                    flexShrink: 0,
                    p: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                    bgcolor: selected ? landingColors.purple : '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      borderColor: landingColors.purple,
                      bgcolor: selected ? landingColors.purple : alpha(landingColors.purple, 0.02),
                    },
                  }}
                >
                  {isPreferred && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: selected ? '#FFF' : landingColors.purple,
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: selected ? '#FFFFFF' : '#64748B',
                      textTransform: 'uppercase',
                    }}
                  >
                    {day.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: selected ? '#FFFFFF' : '#0F172A',
                      mt: 0.25,
                    }}
                  >
                    {day.subtitle.split(' ')[0]}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box>
          {slotsLoading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
              <CircularProgress size={32} sx={{ color: landingColors.purple }} />
            </Box>
          ) : slotsError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {slotsError}
            </Alert>
          ) : slots.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: alpha('#F1F5F9', 0.5),
                border: '1px dashed #CBD5E1',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#64748B' }}>No slots available</Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {(['Recommended', 'Morning', 'Afternoon', 'Evening'] as const).map((groupName) => {
                const items = groupedSlots[groupName];
                if (!items.length) return null;
                return (
                  <Box key={groupName}>
                    <Box
                      sx={{
                        mb: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 12,
                          color: landingColors.purple,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                        Recommended Slots
                      </Typography>

                      {user && groupName === 'Recommended' && (
                        <Stack direction="row" spacing={1.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FavoriteRoundedIcon
                              sx={{ fontSize: 12, color: landingColors.purple }}
                            />
                            <Typography
                              sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}
                            >
                              For You
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AutoAwesomeRoundedIcon
                              sx={{ fontSize: 12, color: landingColors.success }}
                            />
                            <Typography
                              sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}
                            >
                              Expert Fit
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(3, minmax(0, 1fr))',
                          sm: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 1,
                      }}
                    >
                      {items.map((slot) => {
                        const selected =
                          selectedSlot?.staffId === slot.staffId &&
                          selectedSlot?.startTime === slot.startTime;
                        return (
                          <Button
                            key={`${slot.staffId}-${slot.startTime}`}
                            variant={selected ? 'contained' : 'outlined'}
                            onClick={() => setSelectedSlot(slot)}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              py: 1,
                              px: 1,
                              textTransform: 'none',
                              bgcolor: selected ? landingColors.purple : 'transparent',
                              borderColor: selected
                                ? landingColors.purple
                                : slot.isCustomerPreferred
                                  ? alpha(landingColors.purple, 0.3)
                                  : 'rgba(15,23,42,0.1)',
                              color: selected ? '#FFFFFF' : '#0F172A',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              '&:hover': {
                                bgcolor: selected
                                  ? landingColors.purple
                                  : alpha(landingColors.purple, 0.04),
                                borderColor: landingColors.purple,
                              },
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                              {formatSlotTime(slot.startTime)}
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                              {slot.isCustomerPreferred && (
                                <FavoriteRoundedIcon
                                  sx={{
                                    fontSize: 10,
                                    color: selected ? '#FFF' : landingColors.purple,
                                  }}
                                />
                              )}
                              {slot.isStaffOptimized && (
                                <AutoAwesomeRoundedIcon
                                  sx={{
                                    fontSize: 10,
                                    color: selected ? '#FFF' : landingColors.success,
                                  }}
                                />
                              )}
                            </Stack>
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>
    );
  }

  function renderDetailsStep() {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5, color: '#0F172A' }}>
            Your Details
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 15 }}>
            Almost there! Provide your details to finalize.
          </Typography>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Full Name"
            size="small"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            fullWidth
            required
            disabled={!!user}
          />

          <TextField
            label="Phone Number"
            size="small"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Email Address"
            size="small"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            fullWidth
            disabled={!!user}
          />

          <TextField
            label="Note (optional)"
            size="small"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </Stack>
    );
  }

  function renderSuccessStep() {
    return (
      <Stack
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: 400, textAlign: 'center' }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(landingColors.success, 0.1),
            display: 'grid',
            placeItems: 'center',
            color: landingColors.success,
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.5, color: '#0F172A' }}>
            Confirmed!
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 16, mt: 1 }}>
            {successMessage || 'We have successfully reserved your slot.'}
          </Typography>
        </Box>

        {selectedService && selectedSlot ? (
          <Box
            sx={{
              borderRadius: 4,
              border: '1px solid rgba(15,23,42,0.06)',
              bgcolor: '#FFFFFF',
              p: 3,
              width: '100%',
              maxWidth: 360,
              textAlign: 'left',
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Service
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {selectedService.name}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Professional
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {staff.find((member) => member._id === selectedSlot.staffId)?.displayName ??
                    'Expert Staff'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}
                >
                  Date & Time
                </Typography>
                <Typography sx={{ fontWeight: 800, color: landingColors.purple }}>
                  {formatSlotDateTime(selectedSlot.startTime)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Stack>
    );
  }

  function renderStepContent() {
    if (loadingOptions) {
      return (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
          <CircularProgress sx={{ color: landingColors.purple }} />
        </Box>
      );
    }
    if (optionsError) {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {optionsError}
        </Alert>
      );
    }
    switch (step) {
      case STEP_SERVICE:
        return renderServiceStep();
      case STEP_STAFF:
        return renderStaffStep();
      case STEP_TIME:
        return renderTimeStep();
      case STEP_DETAILS:
        return renderDetailsStep();
      case STEP_SUCCESS:
        return renderSuccessStep();
      default:
        return null;
    }
  }

  function getPrimaryAction() {
    const btnSx = {
      minHeight: 48,
      px: 3,
      borderRadius: 2,
      fontWeight: 800,
      fontSize: 15,
      textTransform: 'none',
      bgcolor: landingColors.purple,
      '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
    };

    if (step === STEP_SERVICE) {
      return (
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canContinueFromService}
          sx={btnSx}
        >
          Continue
        </Button>
      );
    }
    if (step === STEP_STAFF) {
      return (
        <Button variant="contained" onClick={handleNext} sx={btnSx}>
          Pick Time
        </Button>
      );
    }
    if (step === STEP_TIME) {
      return (
        <Button variant="contained" onClick={handleNext} disabled={!canContinueFromTime} sx={btnSx}>
          {user && customerPhone
            ? submitLoading
              ? 'Booking...'
              : 'Confirm Booking'
            : 'Enter Details'}
        </Button>
      );
    }
    if (step === STEP_DETAILS) {
      return (
        <Button variant="contained" onClick={handleConfirm} disabled={!canConfirm} sx={btnSx}>
          {submitLoading ? 'Booking...' : 'Confirm Booking'}
        </Button>
      );
    }
    return (
      <Button variant="contained" onClick={handleClose} sx={btnSx}>
        Close
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          minHeight: fullScreen ? '100%' : 600,
          bgcolor: '#F8FAFC',
        },
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, md: 4 }, pb: 0 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: -1,
                  color: '#0F172A',
                  lineHeight: 1.2,
                }}
              >
                {salonName}
              </Typography>
              <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14, mt: 0.5 }}>
                Online Booking
              </Typography>
            </Box>
            {!fullScreen && (
              <Button
                onClick={handleClose}
                size="small"
                sx={{ color: '#94A3B8', fontWeight: 800, borderRadius: 2, minWidth: 0, p: 1 }}
              >
                CLOSE
              </Button>
            )}
          </Box>

          {step !== STEP_SUCCESS ? (
            <Box sx={{ position: 'relative' }}>
              <MobileStepper
                variant="progress"
                steps={4}
                position="static"
                activeStep={Math.min(step, 3)}
                nextButton={<Box />}
                backButton={<Box />}
                sx={{
                  p: 0,
                  bgcolor: alpha(landingColors.purple, 0.06),
                  borderRadius: 1,
                  height: 6,
                  overflow: 'hidden',
                  '& .MuiMobileStepper-progress': {
                    bgcolor: landingColors.purple,
                    width: '100%',
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          ) : null}

          {renderSummary()}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 4 }, pt: 3 }}>
        <Box sx={{ minHeight: fullScreen ? 'auto' : 320 }}>{renderStepContent()}</Box>
      </DialogContent>

      <Divider sx={{ opacity: 0.5 }} />

      <Box
        sx={{
          p: { xs: 2, md: 3 },
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#FFFFFF',
        }}
      >
        <Button
          onClick={handleBack}
          sx={{
            fontWeight: 700,
            color: '#64748B',
            borderRadius: 2,
            textTransform: 'none',
            px: 2,
          }}
        >
          {step === STEP_SERVICE ? 'Cancel' : 'Back'}
        </Button>

        {getPrimaryAction()}
      </Box>
    </Dialog>
  );
}
