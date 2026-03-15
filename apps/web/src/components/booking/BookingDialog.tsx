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
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import {
    createReservation,
    getAvailability,
    getBookingOptions,
    type AvailabilitySlot,
    type BookingOptionService,
    type BookingOptionStaff,
} from '../../api/publicTenants';

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

    const nextDays = React.useMemo(() => getNextDays(7), []);
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
            <Card
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    bgcolor: 'grey.50',
                }}
            >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                    >
                        <Chip
                            icon={<ContentCutRoundedIcon />}
                            label={
                                selectedService
                                    ? `${selectedService.name} · ${selectedService.durationMin} min`
                                    : 'Choose service'
                            }
                            variant={selectedService ? 'filled' : 'outlined'}
                            color={selectedService ? 'primary' : 'default'}
                        />
                        <Chip
                            icon={<PersonRoundedIcon />}
                            label={
                                selectedSlot
                                    ? staff.find((member) => member._id === selectedSlot.staffId)?.displayName ??
                                    'Selected staff'
                                    : selectedStaff
                                        ? selectedStaff.displayName
                                        : 'Any available'
                            }
                            variant={(selectedStaff || selectedSlot) ? 'filled' : 'outlined'}
                            color={(selectedStaff || selectedSlot) ? 'primary' : 'default'}
                        />
                        <Chip
                            icon={<EventAvailableRoundedIcon />}
                            label={
                                selectedSlot
                                    ? formatSlotDateTime(selectedSlot.startTime)
                                    : 'Choose time'
                            }
                            variant={selectedSlot ? 'filled' : 'outlined'}
                            color={selectedSlot ? 'primary' : 'default'}
                        />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    function renderServiceStep() {
        return (
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="h5" fontWeight={900}>
                        Choose a service
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
                        Select what you want to book.
                    </Typography>
                </Box>

                <Stack spacing={1.5}>
                    {services.map((service) => {
                        const selected = selectedServiceId === service._id;

                        return (
                            <Card
                                key={service._id}
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    borderColor: selected ? 'primary.main' : 'divider',
                                    boxShadow: selected ? '0 0 0 1px rgba(25,118,210,0.25)' : 'none',
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedServiceId(service._id)}>
                                    <CardContent>
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            spacing={1}
                                        >
                                            <Box>
                                                <Typography fontWeight={800}>{service.name}</Typography>
                                                {service.description ? (
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                        {service.description}
                                                    </Typography>
                                                ) : null}
                                            </Box>

                                            <Stack direction="row" spacing={1}>
                                                <Chip label={`${service.durationMin} min`} size="small" />
                                                <Chip label={`€${service.priceEUR}`} size="small" />
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
                    <Typography variant="h5" fontWeight={900}>
                        Choose a staff member
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
                        Pick a preferred barber or let the system choose any available one.
                    </Typography>
                </Box>

                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        borderColor: selectedStaffId === '' ? 'primary.main' : 'divider',
                        boxShadow: selectedStaffId === '' ? '0 0 0 1px rgba(25,118,210,0.25)' : 'none',
                    }}
                >
                    <CardActionArea onClick={() => setSelectedStaffId('')}>
                        <CardContent>
                            <Typography fontWeight={800}>Any available</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                We will show you the best available times across eligible staff.
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>

                <Stack spacing={1.5}>
                    {staff.map((member) => {
                        const selected = selectedStaffId === member._id;

                        return (
                            <Card
                                key={member._id}
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    borderColor: selected ? 'primary.main' : 'divider',
                                    boxShadow: selected ? '0 0 0 1px rgba(25,118,210,0.25)' : 'none',
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedStaffId(member._id)}>
                                    <CardContent>
                                        <Typography fontWeight={800}>{member.displayName}</Typography>
                                        {member.bio ? (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
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
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="h5" fontWeight={900}>
                        Choose a date and time
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
                        For now, we show cleaner 15-minute options to keep the experience tidy.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                    {nextDays.map((date) => {
                        const day = formatDayChip(date);
                        const selected = selectedDate === day.value;

                        return (
                            <Card
                                key={day.value}
                                variant="outlined"
                                sx={{
                                    minWidth: 92,
                                    flexShrink: 0,
                                    borderRadius: 3,
                                    borderColor: selected ? 'primary.main' : 'divider',
                                    boxShadow: selected ? '0 0 0 1px rgba(25,118,210,0.25)' : 'none',
                                }}
                            >
                                <CardActionArea onClick={() => setSelectedDate(day.value)}>
                                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                        <Typography variant="body2" fontWeight={700}>
                                            {day.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                            {day.subtitle}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </Stack>

                <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    sx={{ maxWidth: 220 }}
                />

                {slotsLoading ? (
                    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : slotsError ? (
                    <Alert severity="error">{slotsError}</Alert>
                ) : displaySlots.length === 0 ? (
                    <Alert severity="info">
                        No available time slots for this day. Try another date or staff option.
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {(['Morning', 'Afternoon', 'Evening'] as const).map((groupName) => {
                            const items = groupedSlots[groupName];
                            if (!items.length) return null;

                            return (
                                <Box key={groupName}>
                                    <Typography fontWeight={800} sx={{ mb: 1.25 }}>
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
                                            gap: 1,
                                        }}
                                    >
                                        {items.map((slot) => {
                                            const selected =
                                                selectedSlot?.staffId === slot.staffId &&
                                                selectedSlot?.startTime === slot.startTime;

                                            const staffName =
                                                staff.find((member) => member._id === slot.staffId)?.displayName ??
                                                'Staff';

                                            return (
                                                <Button
                                                    key={`${slot.staffId}-${slot.startTime}`}
                                                    variant={selected ? 'contained' : 'outlined'}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    sx={{
                                                        borderRadius: 2.5,
                                                        py: 1.2,
                                                        textTransform: 'none',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.75}
                                                        alignItems="center"
                                                        sx={{ width: '100%', justifyContent: 'space-between' }}
                                                    >
                                                        <Typography fontWeight={700}>
                                                            {formatSlotTime(slot.startTime)}
                                                        </Typography>
                                                        {!selectedStaffId ? (
                                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                                {staffName}
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
            </Stack>
        );
    }

    function renderDetailsStep() {
        return (
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="h5" fontWeight={900}>
                        Your details
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
                        Complete your booking with your contact information.
                    </Typography>
                </Box>

                {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                <TextField
                    label="Full name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    fullWidth
                />

                <TextField
                    label="Phone number"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    fullWidth
                />

                <TextField
                    label="Email (optional)"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    fullWidth
                />

                <TextField
                    label="Notes (optional)"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                />
            </Stack>
        );
    }

    function renderSuccessStep() {
        return (
            <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: 360, textAlign: 'center' }}
            >
                <CheckCircleRoundedIcon color="success" sx={{ fontSize: 64 }} />
                <Typography variant="h4" fontWeight={900}>
                    Booking confirmed
                </Typography>
                <Typography sx={{ color: 'text.secondary', maxWidth: 420 }}>
                    {successMessage || 'Your booking was created successfully.'}
                </Typography>

                {selectedService && selectedSlot ? (
                    <Card variant="outlined" sx={{ borderRadius: 3, width: '100%', maxWidth: 480 }}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Typography fontWeight={800}>Summary</Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Service: {selectedService.name}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Staff:{' '}
                                    {staff.find((member) => member._id === selectedSlot.staffId)?.displayName ??
                                        'Selected staff'}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Time: {formatSlotDateTime(selectedSlot.startTime)}
                                </Typography>
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
                <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (optionsError) {
            return <Alert severity="error">{optionsError}</Alert>;
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
        if (step === STEP_SERVICE) {
            return (
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext}
                    disabled={!canContinueFromService}
                >
                    Continue
                </Button>
            );
        }

        if (step === STEP_STAFF) {
            return (
                <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleNext}
                >
                    Continue
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
                >
                    Continue
                </Button>
            );
        }

        if (step === STEP_DETAILS) {
            return (
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                >
                    {submitLoading ? 'Booking...' : 'Confirm booking'}
                </Button>
            );
        }

        return (
            <Button variant="contained" onClick={handleClose}>
                Done
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
                    borderRadius: fullScreen ? 0 : 4,
                    minHeight: fullScreen ? '100%' : 720,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1.5 }}>
                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="h5" fontWeight={900}>
                            Book appointment
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {salonName}
                        </Typography>
                    </Box>

                    {step !== STEP_SUCCESS ? (
                        <MobileStepper
                            variant="progress"
                            steps={4}
                            position="static"
                            activeStep={Math.min(step, 3)}
                            nextButton={<Box />}
                            backButton={<Box />}
                            sx={{
                                px: 0,
                                bgcolor: 'transparent',
                            }}
                        />
                    ) : null}

                    {renderSummary()}
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 3 }}>{renderStepContent()}</DialogContent>

            <Divider />

            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    startIcon={step === STEP_SERVICE ? undefined : <ArrowBackRoundedIcon />}
                    onClick={handleBack}
                >
                    {step === STEP_SERVICE ? 'Close' : 'Back'}
                </Button>

                {getPrimaryAction()}
            </Box>
        </Dialog>
    );
}