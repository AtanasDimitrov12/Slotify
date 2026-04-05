import { apiFetch } from './http';

export type CustomerLocation = {
  country?: string;
  city?: string;
};

export type NotificationPreferences = {
  remindersEnabled: boolean;
  promotionsEnabled: boolean;
  lastMinuteDealsEnabled: boolean;
};

export type PreferredBookingSlot = {
  dayOfWeek: number;
  timeSlot: string;
};

export type CustomerProfile = {
  _id: string;
  userId: string;
  phone: string;
  avatarUrl?: string;
  location?: CustomerLocation;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | null;
  preferredDaysOfWeek?: number[];
  preferredBookingSlots?: PreferredBookingSlot[];
  preferredServiceIds?: string[];
  favoriteSalonIds?: string[];
  preferredStaffIds?: string[];
  birthday?: string | null;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCustomerProfilePayload = Partial<
  Omit<CustomerProfile, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export async function getMyCustomerProfile(): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>('/customer-profiles/me', {
    method: 'GET',
  });
}

export async function updateMyCustomerProfile(
  payload: UpdateCustomerProfilePayload,
): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>('/customer-profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
