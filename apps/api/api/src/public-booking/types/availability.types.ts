export type TimeRange = {
  start: Date;
  end: Date;
};

export type AvailabilitySlot = {
  staffId: string;
  startTime: string;
  endTime: string;
  score: number;
};

export type EffectiveBookingSettings = {
  minimumNoticeMinutes: number;
  maximumDaysInAdvance: number;
  autoConfirmReservations: boolean;
  allowBookingToEndAfterWorkingHours: boolean;
  allowCustomerChooseSpecificStaff: boolean;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotIntervalMinutes: number;
  lockDurationMinutes: number;
};