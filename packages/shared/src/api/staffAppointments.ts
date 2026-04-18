import { apiFetch } from './http';

export type StaffAppointment = {
  id: string;
  tenantId: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  priceEUR: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  serviceId: string;
  staffServiceAssignmentId: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  riskScore?: number;
};

export type StaffServiceOption = {
  id: string; // assignment id
  tenantId: string;
  serviceId: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

export type CustomerInsights = {
  stats: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  globalStats: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  verification: {
    isRegistered: boolean;
    isEmailVerified: boolean;
    hasPhone: boolean;
  };
  riskScore: number;
  riskFactors: string[];
};

export async function getCustomerInsights(reservationId: string): Promise<CustomerInsights> {
  return apiFetch<CustomerInsights>(`/staff/me/appointments/${reservationId}/customer-insights`);
}

export async function listStaffServices(): Promise<StaffServiceOption[]> {
  return apiFetch<StaffServiceOption[]>('/staff/me/appointments/services');
}

export async function listStaffAppointments(params: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<StaffAppointment[]> {
  const query = new URLSearchParams();
  if (params.date) {
    query.set('date', params.date);
  }
  if (params.startDate) {
    query.set('startDate', params.startDate);
  }
  if (params.endDate) {
    query.set('endDate', params.endDate);
  }

  return apiFetch<StaffAppointment[]>(`/staff/me/appointments?${query.toString()}`);
}

export async function createStaffAppointment(payload: {
  staffServiceAssignmentId: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}) {
  return apiFetch<{ id: string }>('/staff/me/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateStaffAppointment(
  id: string,
  payload: Partial<{
    staffServiceAssignmentId: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }>,
) {
  return apiFetch<{ success: true }>(`/staff/me/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateStaffAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show',
) {
  return apiFetch<{ success: true }>(`/staff/me/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function cancelStaffAppointment(id: string) {
  return apiFetch<{ success: true }>(`/staff/me/appointments/${id}`, {
    method: 'DELETE',
  });
}
