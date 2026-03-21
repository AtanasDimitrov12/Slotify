import * as React from 'react';
import {
    Alert,
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
    alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import {
    createReservation,
    getAvailability,
    getBookingOptions,
    type AvailabilitySlot,
    type BookingOptionService,
    type BookingOptionStaff,
} from '../../api/publicTenants';
import { landingColors, premium } from '../landing/constants';

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
const TOTAL_STEPS = 5;

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

function getDisplaySlots(slots: AvailabilitySlot[]) {
    const quarterHourSlots = slots.filter(isQuarterHourSlot);

    // fallback so we don't accidentally hide all valid slots
    return quarterHourSlots.length > 0 ? quarterHourSlots : slots;
}

function groupSlots(slots: AvailabilitySlot[]) {
    const groups: Record<'Morning' | 'Afternoon' | 'Evening', AvailabilitySlot[]> = {
        Morning: [],
        Afternoon: [],
        Evening: [],
    };

    slots.forEach((slot) => {
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
        groups[key].sort(
            (a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
    }

    return groups;
}

export default function BookingDialog({
    open,
    slug,
    salonName,
    onClose,
}: BookingDialogProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [step, setStep] = React.useState<number>(STEP_SERVICE);

    const [loadingOptions, setLoadingOptions] = React.useState(false);
    const [optionsError, setOptionsError] = React.useState('');
    const [services, setServices] = React.useState<BookingOptionService[]>([]);
    const [staff, setStaff] = React.useState<BookingOptionStaff[]>([]);

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
    const [submitError, setSubmitError] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    const nextDays = React.useMemo(() => getNextDays(14), []);
    const displaySlots = React.useMemo(() => getDisplaySlots(slots), [slots]);
    const groupedSlots = React.useMemo(() => groupSlots(displaySlots), [displaySlots]);

    const selectedService = services.find((item) => item._id === selectedServiceId);
    const selectedStaff = staff.find((item) => item._id === selectedStaffId);

    React.useEffect(() => {
        if (!open) return;

        async function loadOptions() {
            try {
                setLoadingOptions(true);
                setOptionsError('');
                setSubmitError('');
                setSuccessMessage('');
                setStep(STEP_SERVICE);

                const result = await getBookingOptions(slug);
                setServices(result.services);
                setStaff(result.staff);

                if (result.services.length === 1) {
                    setSelectedServiceId(result.services[0]._id);
                }

                if (result.staff.length === 1) {
                    setSelectedStaffId(result.staff[0]._id);
                }
            } catch (err) {
                setOptionsError(
                    err instanceof Error ? err.message : 'Failed to load booking options',
                );
            } finally {
                setLoadingOptions(false);
            }
        }

        void loadOptions();
    }, [open, slug]);

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
                setSlotsError(
                    err instanceof Error ? err.message : 'Failed to load availability',
                );
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
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
        setSubmitError('');
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
            setStep(STEP_DETAILS);
        }
    }

    async function handleConfirm() {
        if (!selectedServiceId || !selectedSlot) {
            setSubmitError('Please choose a service and a time slot.');
            return;
        }

        if (!customerName.trim() || !customerPhone.trim()) {
            setSubmitError('Please fill in your full name and phone number.');
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitError('');

            await createReservation(slug, {
                serviceId: selectedServiceId,
                staffId: selectedSlot.staffId,
                startTime: selectedSlot.startTime,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerEmail: customerEmail.trim() || undefined,
                notes: notes.trim() || undefined,
            });

            setSuccessMessage('Your booking was created successfully.');
            setStep(STEP_SUCCESS);
        } catch (err) {
            setSubmitError(
                err instanceof Error ? err.message : 'Failed to create reservation',
            );
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
                    p: 2,
                    borderRadius: 4,
                    bgcolor: alpha(landingColors.purple, 0.04),
                    border: `1px solid ${alpha(landingColors.purple, 0.08)}`,
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                >
                    <Chip
                        icon={<ContentCutRoundedIcon sx={{ fontSize: '1.1rem !important' }} />}
                        label={
                            selectedService
                                ? selectedService.name
                                : 'Choose service'
                        }
                        sx={{
                            fontWeight: 800,
                            bgcolor: selectedService ? alpha(landingColors.purple, 0.12) : 'transparent',
                            color: selectedService ? landingColors.purple : 'text.secondary',
                            border: `1px solid ${selectedService ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.08)'}`,
                        }}
                    />
                    <Chip
                        icon={<PersonRoundedIcon sx={{ fontSize: '1.1rem !important' }} />}
                        label={
                            selectedSlot
                                ? staff.find((member) => member._id === selectedSlot.staffId)?.displayName ??
                                'Selected staff'
                                : selectedStaff
                                    ? selectedStaff.displayName
                                    : 'Any available'
                        }
                        sx={{
                            fontWeight: 800,
                            bgcolor: (selectedStaff || selectedSlot) ? alpha(landingColors.purple, 0.12) : 'transparent',
                            color: (selectedStaff || selectedSlot) ? landingColors.purple : 'text.secondary',
                            border: `1px solid ${(selectedStaff || selectedSlot) ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.08)'}`,
                        }}
                    />
                    <Chip
                        icon={<EventAvailableRoundedIcon sx={{ fontSize: '1.1rem !important' }} />}
                        label={
                            selectedSlot
                                ? formatSlotDateTime(selectedSlot.startTime)
                                : 'Choose time'
                        }
                        sx={{
                            fontWeight: 800,
                            bgcolor: selectedSlot ? alpha(landingColors.purple, 0.12) : 'transparent',
                            color: selectedSlot ? landingColors.purple : 'text.secondary',
                            border: `1px solid ${selectedSlot ? alpha(landingColors.purple, 0.2) : 'rgba(0,0,0,0.08)'}`,
                        }}
                    />
                </Stack>
            </Box>
        );
    }

    function renderServiceStep() {
        return (
            <Stack spacing={3}>
                <Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 28, letterSpacing: -1, color: '#0F172A' }}>
                        Select Service
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 16 }}>
                        Choose the treatment you would like to receive.
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    {services.map((service) => {
                        const selected = selectedServiceId === service._id;

                        return (
                            <Card
                                key={service._id}
                                sx={{
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                                    bgcolor: selected ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
                                    boxShadow: selected ? `0 12px 30px ${alpha(landingColors.purple, 0.12)}` : '0 4px 12px rgba(15,23,42,0.03)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: landingColors.purple,
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedServiceId(service._id)} sx={{ p: 0.5 }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            spacing={2}
                                        >
                                            <Box>
                                                <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>
                                                    {service.name}
                                                </Typography>
                                                {service.description ? (
                                                    <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14, mt: 0.5, lineHeight: 1.5 }}>
                                                        {service.description}
                                                    </Typography>
                                                ) : null}
                                            </Box>

                                            <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                                                <Chip
                                                    icon={<AccessTimeRoundedIcon style={{ fontSize: 14 }} />}
                                                    label={`${service.durationMin} min`}
                                                    size="small"
                                                    sx={{ fontWeight: 800, bgcolor: 'rgba(15,23,42,0.04)', color: '#475569' }}
                                                />
                                                <Typography sx={{ fontWeight: 1000, fontSize: 18, color: landingColors.purple }}>
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
            <Stack spacing={3}>
                <Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 28, letterSpacing: -1, color: '#0F172A' }}>
                        Select Staff
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 16 }}>
                        Pick your favorite professional or choose anyone available.
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: selectedStaffId === '' ? landingColors.purple : 'rgba(15,23,42,0.06)',
                            bgcolor: selectedStaffId === '' ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
                            boxShadow: selectedStaffId === '' ? `0 12px 30px ${alpha(landingColors.purple, 0.12)}` : '0 4px 12px rgba(15,23,42,0.03)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <CardActionArea onClick={() => setSelectedStaffId('')}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>Any available professional</Typography>
                                <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14, mt: 0.5 }}>
                                    Show the best available time slots regardless of who is working.
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {staff.map((member) => {
                        const selected = selectedStaffId === member._id;

                        return (
                            <Card
                                key={member._id}
                                sx={{
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                                    bgcolor: selected ? alpha(landingColors.purple, 0.02) : '#FFFFFF',
                                    boxShadow: selected ? `0 12px 30px ${alpha(landingColors.purple, 0.12)}` : '0 4px 12px rgba(15,23,42,0.03)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedStaffId(member._id)}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A' }}>{member.displayName}</Typography>
                                        {member.bio ? (
                                            <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 14, mt: 0.5, lineHeight: 1.5 }}>
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
                    <Typography sx={{ fontWeight: 1000, fontSize: 28, letterSpacing: -1, color: '#0F172A' }}>
                        Pick Time
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 16 }}>
                        Select an available date and time for your appointment.
                    </Typography>
                </Box>

                <Box sx={{ mx: -3, px: 3, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Stack direction="row" spacing={1.5}>
                        {nextDays.map((date) => {
                            const day = formatDayChip(date);
                            const selected = selectedDate === day.value;

                            return (
                                <Card
                                    key={day.value}
                                    sx={{
                                        minWidth: 100,
                                        flexShrink: 0,
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.06)',
                                        bgcolor: selected ? landingColors.purple : '#FFFFFF',
                                        boxShadow: selected ? `0 12px 24px ${alpha(landingColors.purple, 0.25)}` : 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <CardActionArea onClick={() => setSelectedDate(day.value)}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: selected ? '#FFFFFF' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {day.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: 16, fontWeight: 1000, color: selected ? '#FFFFFF' : '#0F172A', mt: 0.5 }}>
                                                {day.subtitle}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Stack>
                </Box>

                <Box>
                    {slotsLoading ? (
                        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
                            <CircularProgress sx={{ color: landingColors.purple }} />
                        </Box>
                    ) : slotsError ? (
                        <Alert severity="error" sx={{ borderRadius: 3 }}>{slotsError}</Alert>
                    ) : displaySlots.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center', borderRadius: 4, bgcolor: alpha('#F1F5F9', 0.5), border: '1px dashed #CBD5E1' }}>
                            <Typography sx={{ fontWeight: 800, color: '#64748B' }}>No slots available</Typography>
                            <Typography sx={{ color: '#94A3B8', mt: 1 }}>Please try another date or professional.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={4}>
                            {(['Morning', 'Afternoon', 'Evening'] as const).map((groupName) => {
                                const items = groupedSlots[groupName];
                                if (!items.length) return null;

                                return (
                                    <Box key={groupName}>
                                        <Typography sx={{ fontWeight: 1000, fontSize: 14, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                                            {groupName}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: 'repeat(2, minmax(0, 1fr))',
                                                    sm: 'repeat(3, minmax(0, 1fr))',
                                                    md: 'repeat(4, minmax(0, 1fr))',
                                                },
                                                gap: 1.5,
                                            }}
                                        >
                                            {items.map((slot) => {
                                                const selected =
                                                    selectedSlot?.staffId === slot.staffId &&
                                                    selectedSlot?.startTime === slot.startTime;

                                                const staffMember = staff.find((m) => m._id === slot.staffId);

                                                return (
                                                    <Button
                                                        key={`${slot.staffId}-${slot.startTime}`}
                                                        variant={selected ? 'contained' : 'outlined'}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        sx={{
                                                            borderRadius: 3,
                                                            py: 1.5,
                                                            px: 2,
                                                            textTransform: 'none',
                                                            bgcolor: selected ? landingColors.purple : 'transparent',
                                                            borderColor: selected ? landingColors.purple : 'rgba(15,23,42,0.1)',
                                                            color: selected ? '#FFFFFF' : '#0F172A',
                                                            boxShadow: selected ? `0 8px 20px ${alpha(landingColors.purple, 0.25)}` : 'none',
                                                            '&:hover': {
                                                                bgcolor: selected ? landingColors.purple : alpha(landingColors.purple, 0.04),
                                                                borderColor: landingColors.purple,
                                                            },
                                                        }}
                                                    >
                                                        <Stack alignItems="center" spacing={0.25} sx={{ width: '100%' }}>
                                                            <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>
                                                                {formatSlotTime(slot.startTime)}
                                                            </Typography>
                                                            {!selectedStaffId && staffMember ? (
                                                                <Typography sx={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                                    {staffMember.displayName.split(' ')[0]}
                                                                </Typography>
                                                            ) : null}
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
            <Stack spacing={4}>
                <Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 28, letterSpacing: -1, color: '#0F172A' }}>
                        Your Details
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 16 }}>
                        Almost there! Just a few details to finalize your spot.
                    </Typography>
                </Box>

                {submitError ? <Alert severity="error" sx={{ borderRadius: 3 }}>{submitError}</Alert> : null}

                <Stack spacing={3}>
                    <TextField
                        label="Full Name"
                        placeholder="e.g. Michael Scott"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        fullWidth
                        required
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                        <TextField
                            label="Phone Number"
                            placeholder="e.g. +1 234 567 890"
                            value={customerPhone}
                            onChange={(event) => setCustomerPhone(event.target.value)}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Email Address"
                            placeholder="e.g. michael@dundermifflin.com"
                            value={customerEmail}
                            onChange={(event) => setCustomerEmail(event.target.value)}
                            fullWidth
                        />
                    </Stack>

                    <TextField
                        label="Add a note (optional)"
                        placeholder="Any special requests or details for the barber?"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Stack>
            </Stack>
        );
    }

    function renderSuccessStep() {
        return (
            <Stack
                spacing={4}
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: 480, textAlign: 'center' }}
            >
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 999,
                        bgcolor: alpha(landingColors.success, 0.1),
                        display: 'grid',
                        placeItems: 'center',
                        color: landingColors.success,
                        mb: 1,
                    }}
                >
                    <CheckCircleRoundedIcon sx={{ fontSize: 60 }} />
                </Box>
                
                <Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 36, letterSpacing: -1.5, color: '#0F172A', lineHeight: 1 }}>
                        Booking Confirmed!
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 18, mt: 1.5, maxWidth: 420 }}>
                        {successMessage || 'We have successfully reserved your slot. See you soon!'}
                    </Typography>
                </Box>

                {selectedService && selectedSlot ? (
                    <Card
                        sx={{
                            borderRadius: 6,
                            border: '1px solid',
                            borderColor: 'rgba(15,23,42,0.06)',
                            bgcolor: '#FFFFFF',
                            boxShadow: '0 20px 50px rgba(15,23,42,0.06)',
                            width: '100%',
                            maxWidth: 480,
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3} textAlign="left">
                                <Typography sx={{ fontWeight: 1000, fontSize: 18, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Appointment Details
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Service</Typography>
                                        <Typography sx={{ fontWeight: 1000, color: '#0F172A', fontSize: 18 }}>{selectedService.name}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Professional</Typography>
                                        <Typography sx={{ fontWeight: 1000, color: '#0F172A', fontSize: 18 }}>
                                            {staff.find((member) => member._id === selectedSlot.staffId)?.displayName ?? 'Expert Staff'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Date & Time</Typography>
                                        <Typography sx={{ fontWeight: 1000, color: landingColors.purple, fontSize: 18 }}>
                                            {formatSlotDateTime(selectedSlot.startTime)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
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
            return <Alert severity="error" sx={{ borderRadius: 3 }}>{optionsError}</Alert>;
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
            minHeight: 52,
            px: 4,
            borderRadius: 999,
            fontWeight: 1000,
            fontSize: 16,
            bgcolor: landingColors.purple,
            boxShadow: `0 12px 30px ${alpha(landingColors.purple, 0.24)}`,
            '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.05)' },
        };

        if (step === STEP_SERVICE) {
            return (
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext}
                    disabled={!canContinueFromService}
                    sx={btnSx}
                >
                    Choose Staff
                </Button>
            );
        }

        if (step === STEP_STAFF) {
            return (
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext}
                    sx={btnSx}
                >
                    Pick Time
                </Button>
            );
        }

        if (step === STEP_TIME) {
            return (
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext}
                    disabled={!canContinueFromTime}
                    sx={btnSx}
                >
                    Enter Details
                </Button>
            );
        }

        if (step === STEP_DETAILS) {
            return (
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    sx={btnSx}
                >
                    {submitLoading ? 'Booking...' : 'Confirm Reservation'}
                </Button>
            );
        }

        return (
            <Button variant="contained" onClick={handleClose} sx={btnSx}>
                Finish
            </Button>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 8,
                    minHeight: fullScreen ? '100%' : 800,
                    bgcolor: '#F8FAFC',
                },
            }}
        >
            <DialogTitle sx={{ p: { xs: 3, md: 5 }, pb: 0 }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography sx={{ fontWeight: 1000, fontSize: 32, letterSpacing: -1.5, color: '#0F172A', lineHeight: 1 }}>
                                Book Appointment
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 18, mt: 1 }}>
                                {salonName}
                            </Typography>
                        </Box>
                        {!fullScreen && (
                            <Button 
                                onClick={handleClose} 
                                sx={{ color: '#94A3B8', fontWeight: 1000, borderRadius: 999, minWidth: 0, p: 1 }}
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
                                    borderRadius: 999,
                                    height: 8,
                                    overflow: 'hidden',
                                    '& .MuiMobileStepper-progress': {
                                        bgcolor: landingColors.purple,
                                        width: '100%',
                                        borderRadius: 999,
                                    },
                                }}
                            />
                        </Box>
                    ) : null}

                    {renderSummary()}
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 3, md: 5 }, pt: 4 }}>
                <Box sx={{ minHeight: fullScreen ? 'auto' : 400 }}>
                    {renderStepContent()}
                </Box>
            </DialogContent>

            <Divider sx={{ opacity: 0.5 }} />

            <Box
                sx={{
                    p: { xs: 3, md: 4 },
                    px: { xs: 3, md: 5 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#FFFFFF',
                }}
            >
                <Button
                    startIcon={step === STEP_SERVICE ? undefined : <ArrowBackRoundedIcon />}
                    onClick={handleBack}
                    sx={{
                        fontWeight: 900,
                        color: '#64748B',
                        borderRadius: 999,
                        px: 3,
                        '&:hover': { bgcolor: alpha('#64748B', 0.05) },
                    }}
                >
                    {step === STEP_SERVICE ? 'Cancel' : 'Back'}
                </Button>

                {getPrimaryAction()}
            </Box>
        </Dialog>
    );
}