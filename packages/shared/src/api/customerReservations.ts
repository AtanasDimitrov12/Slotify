import { apiFetch } from './http';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export type ReservationReview = {
  rating: number;
  comment?: string;
  pictures?: string[];
  createdAt: string;
};

export type CustomerReservation = {
  _id: string;
  tenantId: {
    _id: string;
    name: string;
    slug: string;
  };
  staffId: {
    _id: string;
    name: string;
    displayName: string;
    avatarUrl?: string;
  };
  serviceName: string;
  durationMin: number;
  priceEUR: number;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  status: ReservationStatus;
  review?: ReservationReview | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewPayload = {
  rating: number;
  comment?: string;
  pictures?: string[];
};

export async function getMyReservations(): Promise<CustomerReservation[]> {
  return apiFetch<CustomerReservation[]>('/customer-reservations', {
    method: 'GET',
  });
}

export async function addReservationReview(
  reservationId: string,
  payload: CreateReviewPayload,
): Promise<CustomerReservation> {
  return apiFetch<CustomerReservation>(`/customer-reservations/${reservationId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
