export type StaffProfile = {
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  expertiseTags: string[];
};

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type DaySchedule = {
  day: DayKey;
  enabled: boolean;
  start: string; // "09:00"
  end: string;   // "18:00"
  breakStart?: string;
  breakEnd?: string;
};

export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export type TimeOffRequest = {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  status: TimeOffStatus;
  createdAt: string; // ISO string
};

export type StaffService = {
  id: string;
  name: string;
  durationMin: number;
  priceEUR: number;
  description?: string;
};

export type Appointment = {
  id: string;
  startTime: string; // "10:30"
  customerName: string;
  serviceName: string;
  durationMin: number;
  status: 'upcoming' | 'done' | 'no-show';
};