import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { type CustomerProfile, getMyCustomerProfile } from '../../api/customerProfile';
import { type CustomerReservation, getMyReservations } from '../../api/customerReservations';
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
import { DetailsStep } from './BookingDialog/DetailsStep';
import { Header } from './BookingDialog/Header';
import { OverviewStep } from './BookingDialog/OverviewStep';
import { ServiceStep } from './BookingDialog/ServiceStep';
import { SuccessStep } from './BookingDialog/SuccessStep';
import { TimeStep } from './BookingDialog/TimeStep';

import {
  formatDateInput,
  getNextDays,
  groupSlots,
  STEP_DETAILS,
  STEP_OVERVIEW,
  STEP_SERVICE,
  STEP_SUCCESS,
  STEP_TIME,
} from './BookingDialog/utils';

type BookingDialogProps = {
  open: boolean;
  slug: string;
  salonName: string;
  onClose: () => void;
};

export default function BookingDialog({ open, slug, salonName, onClose }: BookingDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { showError } = useToast();
  const { user } = useAuth();

  // State
  const [step, setStep] = React.useState<number>(STEP_SERVICE);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [optionsError, setOptionsError] = React.useState('');

  const [services, setServices] = React.useState<BookingOptionService[]>([]);
  const [staff, setStaff] = React.useState<BookingOptionStaff[]>([]);
  const [maxDays, setMaxDays] = React.useState(14);
  const [profile, setProfile] = React.useState<CustomerProfile | null>(null);
  const [history, setHistory] = React.useState<CustomerReservation[]>([]);

  const [selectedServiceId, setSelectedServiceId] = React.useState('');
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(formatDateInput(new Date()));

  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<AvailabilitySlot | null>(null);

  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [staffFilter, setStaffFilter] = React.useState('all');
  const [submitLoading, setSubmitLoading] = React.useState(false);

  // Memos
  const nextDays = React.useMemo(() => getNextDays(Math.max(maxDays, 14)), [maxDays]);
  const groupedSlots = React.useMemo(
    () => groupSlots(slots, profile, history),
    [slots, profile, history],
  );

  const selectedStaffMember = staff.find((s) => s._id === selectedStaffId);
  const selectedService = selectedStaffMember?.services.find((s) => s._id === selectedServiceId);

  // Load Initial Options
  React.useEffect(() => {
    if (!open) return;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setOptionsError('');
        setStep(STEP_SERVICE);

        const [result, profileData, historyData] = await Promise.all([
          getBookingOptions(slug),
          user ? getMyCustomerProfile().catch(() => null) : Promise.resolve(null),
          user ? getMyReservations().catch(() => []) : Promise.resolve([]),
        ]);

        setServices(result.services);
        setStaff(result.staff);
        setMaxDays(result.maximumDaysInAdvance);
        setProfile(profileData);
        setHistory(historyData);

        if (profileData) {
          setCustomerName(user?.name || '');
          setCustomerEmail(user?.email || '');
          setCustomerPhone(profileData.phone || '');

          // Auto-select preferred
          if (profileData.preferredStaffIds?.length && profileData.preferredServiceIds?.length) {
            const preferredStaff = result.staff.find((s) =>
              profileData.preferredStaffIds?.includes(s._id),
            );
            if (preferredStaff) {
              const preferredService = preferredStaff.services.find((s) =>
                profileData.preferredServiceIds?.includes(s.originalServiceId),
              );
              if (preferredService) {
                setSelectedStaffId(preferredStaff._id);
                setSelectedServiceId(preferredService._id);
              }
            }
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

  // Load Availability
  React.useEffect(() => {
    if (!open || !selectedServiceId || !selectedDate || !selectedStaffId) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    async function loadAvailability() {
      try {
        setSlotsLoading(true);
        setSelectedSlot(null);

        const result = await getAvailability({
          slug,
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          date: new Date(`${selectedDate}T12:00:00`).toISOString(),
        });

        setSlots(result.slots);
      } catch (err) {
        showError(err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    void loadAvailability();
  }, [open, slug, selectedServiceId, selectedStaffId, selectedDate, showError]);

  const handleClose = () => {
    setStep(STEP_SERVICE);
    setSelectedServiceId('');
    setSelectedStaffId('');
    setSelectedSlot(null);
    setSearchQuery('');
    onClose();
  };

  const handleBack = () => {
    if (step === STEP_SERVICE) {
      handleClose();
      return;
    }
    setStep((prev) => Math.max(prev - 1, STEP_SERVICE));
  };

  const handleNext = () => {
    if (step === STEP_SERVICE) {
      if (!selectedServiceId || !selectedStaffId) return;
      setStep(STEP_TIME);
    } else if (step === STEP_TIME) {
      if (!selectedSlot) return;
      setStep(STEP_DETAILS);
    } else if (step === STEP_DETAILS) {
      if (!customerName.trim() || !customerPhone.trim()) {
        showError('Please fill in your name and phone number.');
        return;
      }
      setStep(STEP_OVERVIEW);
    }
  };

  const handleConfirm = async () => {
    if (!selectedServiceId || !selectedSlot) return;

    try {
      setSubmitLoading(true);
      await createReservation(slug, {
        serviceId: selectedServiceId,
        staffId: selectedSlot.staffId,
        startTime: selectedSlot.startTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase() || undefined,
        notes: notes.trim() || undefined,
      });
      setStep(STEP_SUCCESS);
    } catch (err) {
      showError(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const canContinue =
    (step === STEP_SERVICE && selectedServiceId && selectedStaffId) ||
    (step === STEP_TIME && selectedSlot) ||
    (step === STEP_DETAILS && customerName.trim() && customerPhone.trim()) ||
    step === STEP_OVERVIEW;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          bgcolor: '#F8FAFC',
          overflow: 'hidden',
        },
      }}
    >
      <Header salonName={salonName} step={step} onClose={handleClose} />

      <DialogContent sx={{ p: { xs: 2, sm: 4 }, pt: 2, bgcolor: '#F8FAFC' }}>
        {loadingOptions ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: landingColors.purple }} />
          </Box>
        ) : optionsError ? (
          <Alert severity="error">{optionsError}</Alert>
        ) : (
          <Box sx={{ minHeight: 300 }}>
            {step === STEP_SERVICE && (
              <ServiceStep
                staff={staff}
                profile={profile}
                selectedStaffId={selectedStaffId}
                selectedServiceId={selectedServiceId}
                onSelect={(staffId, serviceId) => {
                  setSelectedStaffId(staffId);
                  setSelectedServiceId(serviceId);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                staffFilter={staffFilter}
                onFilterChange={setStaffFilter}
              />
            )}
            {step === STEP_TIME && (
              <TimeStep
                nextDays={nextDays}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                slots={slots}
                slotsLoading={slotsLoading}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                groupedSlots={groupedSlots}
                profilePreferredDays={profile?.preferredDaysOfWeek}
              />
            )}
            {step === STEP_DETAILS && (
              <DetailsStep
                customerName={customerName}
                onNameChange={setCustomerName}
                customerPhone={customerPhone}
                onPhoneChange={setCustomerPhone}
                customerEmail={customerEmail}
                onEmailChange={setCustomerEmail}
                notes={notes}
                onNotesChange={setNotes}
                isLoggedIn={!!user}
              />
            )}
            {step === STEP_OVERVIEW && (
              <OverviewStep
                selectedService={selectedService}
                selectedStaffMember={selectedStaffMember}
                selectedSlot={selectedSlot || undefined}
                customerName={customerName}
                customerPhone={customerPhone}
                customerEmail={customerEmail}
              />
            )}
            {step === STEP_SUCCESS && <SuccessStep onClose={handleClose} />}
          </Box>
        )}
      </DialogContent>

      {step !== STEP_SUCCESS && (
        <Box
          sx={{
            p: 3,
            px: 4,
            bgcolor: '#FFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <Button
            onClick={handleBack}
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {step === STEP_SERVICE ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            onClick={step === STEP_OVERVIEW ? handleConfirm : handleNext}
            disabled={!canContinue || submitLoading}
            endIcon={step !== STEP_OVERVIEW ? <KeyboardArrowRightRoundedIcon /> : null}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 3,
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: landingColors.purple,
              '&:hover': { bgcolor: landingColors.purple, filter: 'brightness(1.1)' },
            }}
          >
            {submitLoading
              ? 'Processing...'
              : step === STEP_OVERVIEW
                ? 'Confirm Booking'
                : step === STEP_SERVICE
                  ? 'Pick Time'
                  : 'Continue'}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
