import { apiFetch } from './http';

export async function getBookingRules(): Promise<BookingRulesPayload> {
  return apiFetch<BookingRulesPayload>('/owner/settings/booking', {
    method: 'GET',
  });
}

export async function saveBookingRules(payload: BookingRulesPayload): Promise<BookingRulesPayload> {
  return apiFetch<BookingRulesPayload>('/owner/settings/booking', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export type BookingRulesPayload = {
  bufferBefore: { enabled: boolean; minutes: number };
  bufferAfter: { enabled: boolean; minutes: number };
  minimumNoticeMinutes: number;
  maximumDaysInAdvance: number;
  autoConfirmReservations: boolean;
  allowBookingToEndAfterWorkingHours: boolean;
  allowCustomerChooseSpecificStaff: boolean;
};

export type StaffBookingRulesResponse = {
  source: 'global' | 'custom';
  globalSettings: BookingRulesPayload;
  staffSettings: {
    userId: string;
    tenantId: string;
    useGlobalSettings: boolean;
    overrides?: Partial<BookingRulesPayload>;
  };
  effectiveSettings: BookingRulesPayload;
};

export async function getMyStaffBookingRules(): Promise<StaffBookingRulesResponse> {
  return apiFetch('/staff-booking-settings/me/current', {
    method: 'GET',
  });
}

export async function updateMyStaffBookingRules(payload: {
  useGlobalSettings: boolean;
  overrides?: Partial<BookingRulesPayload>;
}) {
  return apiFetch('/staff-booking-settings/me/current', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateStaffBookingRulesForOwner(
  userId: string,
  payload: {
    useGlobalSettings: boolean;
    overrides?: Partial<BookingRulesPayload>;
  },
) {
  return apiFetch(`/staff-booking-settings/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
