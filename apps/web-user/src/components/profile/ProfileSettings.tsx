import {
  COUNTRIES,
  type CustomerProfile,
  type PreferredBookingSlot,
  type PublicTenantListItem,
  updateMyCustomerProfile,
  useToast,
} from '@barber/shared';
import {
  AccessTimeRounded,
  AccountCircleRounded,
  AddRounded,
  CalendarMonthRounded,
  ContentCutRounded,
  DeleteOutlineRounded,
  FavoriteRounded,
  LocationOnRounded,
  NotificationsRounded,
  PersonRounded,
  PhoneRounded,
  SaveRounded,
  SettingsRounded,
  StorefrontRounded,
} from '@mui/icons-material';
import {
  Autocomplete,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormGroup,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const profileColors = {
  purple: '#7C6CFF',
  text: '#0F172A',
  textSoft: '#64748B',
  bgSoft: '#F8FAFC',
  border: 'rgba(15,23,42,0.08)',
};

const TIME_PRESETS = [
  { label: 'All Day', value: 'All Day' },
  { label: 'Morning (Open - 12:00)', value: 'morning' },
  { label: 'Afternoon (12:00 - 17:00)', value: 'afternoon' },
  { label: 'Evening (17:00 - Close)', value: 'evening' },
  { label: 'Custom Range', value: 'custom' },
];

interface Props {
  profile: CustomerProfile;
  allSalons: PublicTenantListItem[];
  onProfileUpdated: (updated: CustomerProfile) => void;
}

type EditablePreferredBookingSlot = PreferredBookingSlot & {
  id: string;
};

type EditableCustomerProfile = Omit<CustomerProfile, 'preferredBookingSlots'> & {
  preferredBookingSlots?: EditablePreferredBookingSlot[];
};

const createSlotId = () => crypto.randomUUID();

export default function ProfileSettings({
  profile: initialProfile,
  allSalons,
  onProfileUpdated,
}: Props) {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<EditableCustomerProfile>({
    ...initialProfile,
    preferredBookingSlots: (initialProfile.preferredBookingSlots || []).map((slot) => ({
      ...slot,
      id: createSlotId(),
    })),
  });
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const validatePhone = (phone: string) => {
    return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(phone);
  };

  const handleSaveSection = async (sectionId: string, payload: any) => {
    // Specific Validations
    if (sectionId === 'personal') {
      if (payload.phone && !validatePhone(payload.phone)) {
        showError('Please enter a valid phone number');
        return;
      }
      if (payload.birthday) {
        const bday = new Date(payload.birthday);
        if (bday > new Date()) {
          showError('Birthday cannot be in the future');
          return;
        }
      }
    }

    if (sectionId === 'booking') {
      const slots = payload.preferredBookingSlots || [];
      for (const slot of slots) {
        if (slot.timeSlot.includes('-')) {
          const [start, end] = slot.timeSlot.split(' - ');
          if (start >= end) {
            showError(`Invalid time range: ${start} to ${end}. Start must be before end.`);
            return;
          }
        }
      }
    }

    try {
      setSavingSection(sectionId);
      const updated = await updateMyCustomerProfile(payload);
      setProfile({
        ...updated,
        preferredBookingSlots: (updated.preferredBookingSlots || []).map((slot) => ({
          ...slot,
          id: createSlotId(),
        })),
      });
      onProfileUpdated(updated);
      showSuccess('Changes saved successfully');
    } catch (err) {
      showError(err);
    } finally {
      setSavingSection(null);
    }
  };

  const updateNested = (section: keyof CustomerProfile, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const addPreferredSlot = () => {
    const current = profile.preferredBookingSlots || [];
    setProfile({
      ...profile,
      preferredBookingSlots: [
        ...current,
        { id: createSlotId(), dayOfWeek: 1, timeSlot: 'All Day' },
      ],
    });
  };

  const removePreferredSlot = (id: string) => {
    const current = profile.preferredBookingSlots || [];
    setProfile({
      ...profile,
      preferredBookingSlots: current.filter((slot) => slot.id !== id),
    });
  };

  const updatePreferredSlot = (
    id: string,
    field: keyof PreferredBookingSlot,
    value: string | number,
  ) => {
    const current = profile.preferredBookingSlots || [];
    setProfile({
      ...profile,
      preferredBookingSlots: current.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot,
      ),
    });
  };

  const handleNotificationChange = async (field: string, val: boolean) => {
    const nextPrefs = { ...profile.notificationPreferences, [field]: val };
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: nextPrefs,
    }));

    try {
      setSavingSection('notifications');
      const updated = await updateMyCustomerProfile({
        notificationPreferences: nextPrefs,
      });

      setProfile({
        ...updated,
        preferredBookingSlots: (updated.preferredBookingSlots || []).map((slot) => ({
          ...slot,
          id: createSlotId(),
        })),
      });

      onProfileUpdated(updated);
    } catch (err) {
      showError(err);
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <Stack spacing={4}>
      {/* PERSONAL INFO */}
      <Section
        title="Personal Information"
        icon={<AccountCircleRounded />}
        onSave={() =>
          handleSaveSection('personal', {
            phone: profile.phone,
            birthday: profile.birthday,
            location: profile.location,
          })
        }
        isSaving={savingSection === 'personal'}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              InputProps={{
                startAdornment: (
                  <PhoneRounded sx={{ mr: 1, color: profileColors.textSoft, fontSize: 20 }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Birthday"
              type="date"
              value={profile.birthday ? profile.birthday.split('T')[0] : ''}
              onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <CalendarMonthRounded
                    sx={{ mr: 1, color: profileColors.textSoft, fontSize: 20 }}
                  />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              options={
                COUNTRIES.find((c) => c.name === profile.location?.country)?.cities.map(
                  (c) => c.name,
                ) || []
              }
              value={profile.location?.city || null}
              onChange={(_, newValue) => updateNested('location', 'city', newValue || '')}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <LocationOnRounded
                          sx={{ mr: 1, color: profileColors.textSoft, fontSize: 20 }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              options={COUNTRIES.map((c) => c.name)}
              value={profile.location?.country || null}
              onChange={(_, newValue) => {
                setProfile((prev) => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    country: newValue || undefined,
                    city: '', // Reset city when country changes
                  },
                }));
              }}
              freeSolo
              renderInput={(params) => <TextField {...params} label="Country" />}
            />
          </Grid>
        </Grid>
      </Section>

      {/* BOOKING PREFERENCES */}
      <Section
        title="Booking Preferences"
        icon={<SettingsRounded />}
        onSave={() =>
          handleSaveSection('booking', {
            preferredBookingSlots: (profile.preferredBookingSlots || []).map(
              ({ id, ...slot }) => slot,
            ),
          })
        }
        isSaving={savingSection === 'booking'}
      >
        <Stack spacing={4}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: profileColors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AccessTimeRounded fontSize="small" /> Preferred Slots
                </Typography>
                <Typography sx={{ color: profileColors.textSoft, fontSize: 13 }}>
                  Specify your ideal days and times for appointments.
                </Typography>
              </Box>
              <Button
                startIcon={<AddRounded />}
                onClick={addPreferredSlot}
                size="small"
                sx={{
                  fontWeight: 700,
                  color: profileColors.purple,
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: alpha(profileColors.purple, 0.05),
                  '&:hover': { bgcolor: alpha(profileColors.purple, 0.1) },
                }}
              >
                Add Slot
              </Button>
            </Box>

            <Stack spacing={2}>
              {(profile.preferredBookingSlots || []).length === 0 && (
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `1px dashed ${profileColors.border}`,
                    bgcolor: profileColors.bgSoft,
                  }}
                >
                  <Typography sx={{ color: profileColors.textSoft, fontSize: 14 }}>
                    No preferred slots added yet.
                  </Typography>
                </Box>
              )}
              {(profile.preferredBookingSlots || []).map((slot) => {
                const isCustom = slot.timeSlot.includes('-');
                const [customStart, customEnd] = isCustom ? slot.timeSlot.split(' - ') : ['', ''];

                return (
                  <Card
                    key={slot.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${profileColors.border}`,
                      bgcolor: '#FFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: profileColors.purple,
                        boxShadow: `0 4px 12px ${alpha(profileColors.purple, 0.04)}`,
                      },
                    }}
                  >
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Day"
                          value={slot.dayOfWeek}
                          onChange={(e) =>
                            updatePreferredSlot(slot.id, 'dayOfWeek', Number(e.target.value))
                          }
                        >
                          {[
                            { label: 'Monday', value: 1 },
                            { label: 'Tuesday', value: 2 },
                            { label: 'Wednesday', value: 3 },
                            { label: 'Thursday', value: 4 },
                            { label: 'Friday', value: 5 },
                            { label: 'Saturday', value: 6 },
                            { label: 'Sunday', value: 0 },
                          ].map((day) => (
                            <MenuItem key={day.value} value={day.value}>
                              {day.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Time Type"
                          value={isCustom ? 'custom' : slot.timeSlot}
                          onChange={(e) =>
                            updatePreferredSlot(
                              slot.id,
                              'timeSlot',
                              `${customStart} - ${e.target.value}`,
                            )
                          }
                        >
                          {TIME_PRESETS.map((p) => (
                            <MenuItem key={p.value} value={p.value}>
                              {p.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {isCustom ? (
                        <Grid item xs={12} sm={4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              type="time"
                              size="small"
                              label="From"
                              value={customStart}
                              onChange={(e) =>
                                updatePreferredSlot(
                                  slot.id,
                                  'timeSlot',
                                  `${e.target.value} - ${customEnd}`,
                                )
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                            <Typography sx={{ color: 'text.secondary' }}>-</Typography>
                            <TextField
                              type="time"
                              size="small"
                              label="To"
                              value={customEnd}
                              onChange={(e) =>
                                updatePreferredSlot(
                                  slot.id,
                                  'timeSlot',
                                  `${customStart} - ${e.target.value}`,
                                )
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Stack>
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={4} />
                      )}
                      <Grid
                        item
                        xs={12}
                        sm={1}
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removePreferredSlot(slot.id)}
                          sx={{
                            bgcolor: alpha('#EF4444', 0.05),
                            '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                          }}
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Section>

      {/* FAVORITES */}
      <Section
        title="Favorites"
        icon={<FavoriteRounded />}
        onSave={() =>
          handleSaveSection('favorites', {
            favoriteSalonIds: profile.favoriteSalonIds,
            preferredServiceIds: profile.preferredServiceIds,
            preferredStaffIds: profile.preferredStaffIds,
          })
        }
        isSaving={savingSection === 'favorites'}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 800,
                color: profileColors.text,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <StorefrontRounded fontSize="small" /> Favorite Salons
            </Typography>
            <Autocomplete
              multiple
              options={allSalons}
              getOptionLabel={(option) => option.name}
              value={allSalons.filter((s) => profile.favoriteSalonIds?.includes(s._id))}
              onChange={(_, newValue) => {
                setProfile((prev) => ({ ...prev, favoriteSalonIds: newValue.map((v) => v._id) }));
              }}
              renderInput={(params) => <TextField {...params} placeholder="Search salons..." />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });

                  return (
                    <Chip
                      key={key}
                      label={option.name}
                      {...tagProps}
                      sx={{
                        bgcolor: alpha(profileColors.purple, 0.1),
                        color: profileColors.purple,
                        fontWeight: 700,
                        borderRadius: 2,
                      }}
                    />
                  );
                })
              }
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 800,
                color: profileColors.text,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ContentCutRounded fontSize="small" /> Preferred Services
            </Typography>
            <Typography sx={{ color: profileColors.textSoft, fontSize: 13, mb: 2 }}>
              These are services you book frequently. You can manage them here.
            </Typography>
            {profile.preferredServiceIds?.length ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.preferredServiceIds.map((id: string) => (
                  <Chip
                    key={id}
                    label={`Service ${id.slice(-4)}`}
                    onDelete={() => {
                      setProfile((prev) => ({
                        ...prev,
                        preferredServiceIds: prev.preferredServiceIds?.filter(
                          (sid: string) => sid !== id,
                        ),
                      }));
                    }}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: profileColors.textSoft, fontSize: 14, fontStyle: 'italic' }}>
                No preferred services yet. They appear here as you book.
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 800,
                color: profileColors.text,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <PersonRounded fontSize="small" /> Preferred Staff
            </Typography>
            <Typography sx={{ color: profileColors.textSoft, fontSize: 13, mb: 2 }}>
              Your go-to professionals across different salons.
            </Typography>
            {profile.preferredStaffIds?.length ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.preferredStaffIds.map((id: string) => (
                  <Chip
                    key={id}
                    label={`Staff ${id.slice(-4)}`}
                    onDelete={() => {
                      setProfile((prev) => ({
                        ...prev,
                        preferredStaffIds: prev.preferredStaffIds?.filter(
                          (sid: string) => sid !== id,
                        ),
                      }));
                    }}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: profileColors.textSoft, fontSize: 14, fontStyle: 'italic' }}>
                No preferred staff members yet.
              </Typography>
            )}
          </Box>
        </Stack>
      </Section>

      {/* NOTIFICATIONS */}
      <Section
        title="Notifications"
        icon={<NotificationsRounded />}
        onSave={() => {}} // No-op as we auto-save
        isSaving={savingSection === 'notifications'}
        hideSaveButton
      >
        <FormGroup>
          <Stack spacing={1}>
            <NotificationToggle
              label="Appointment Reminders"
              description="Get notified about your upcoming bookings"
              checked={profile.notificationPreferences?.remindersEnabled}
              onChange={(val) => handleNotificationChange('remindersEnabled', val)}
            />
            <Divider sx={{ my: 1, opacity: 0.5 }} />
            <NotificationToggle
              label="Promotions & News"
              description="Receive special offers and salon updates"
              checked={profile.notificationPreferences?.promotionsEnabled}
              onChange={(val) => handleNotificationChange('promotionsEnabled', val)}
            />
            <Divider sx={{ my: 1, opacity: 0.5 }} />
            <NotificationToggle
              label="Last-minute Deals"
              description="Be the first to know about cancelled slots and discounts"
              checked={profile.notificationPreferences?.lastMinuteDealsEnabled}
              onChange={(val) => handleNotificationChange('lastMinuteDealsEnabled', val)}
            />
          </Stack>
        </FormGroup>
      </Section>
    </Stack>
  );
}

function Section({
  title,
  icon,
  children,
  onSave,
  isSaving,
  hideSaveButton,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
  hideSaveButton?: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 4, border: `1px solid ${profileColors.border}`, bgcolor: '#FFF' }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: profileColors.purple, display: 'flex' }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: profileColors.text }}>
              {title}
            </Typography>
          </Stack>
          {!hideSaveButton && (
            <Button
              variant="contained"
              size="small"
              onClick={onSave}
              disabled={isSaving}
              startIcon={
                isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />
              }
              sx={{
                borderRadius: 2,
                bgcolor: profileColors.purple,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 4px 12px ${alpha(profileColors.purple, 0.2)}`,
                '&:hover': { bgcolor: '#6B5CFA' },
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {hideSaveButton && isSaving && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={14} sx={{ color: profileColors.purple }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: profileColors.purple }}>
                Saving...
              </Typography>
            </Stack>
          )}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, color: profileColors.text }}>{label}</Typography>
        <Typography sx={{ color: profileColors.textSoft, fontSize: 13 }}>{description}</Typography>
      </Box>
      <Switch
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: profileColors.purple },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            bgcolor: profileColors.purple,
          },
        }}
      />
    </Box>
  );
}
