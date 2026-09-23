export interface WateringRecord {
  date: string; // ISO 8601 string
  imageUrl?: string; // base64 data URL or image URL
  note?: string; // optional note e.g. "Spotted new growth!"
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  waterIntervalDays: number;
  lastWateredDate: string; // ISO 8601 string
  wateringHistory?: (string | WateringRecord)[]; // Array of past timestamps or detailed records
}

export type UrgencyStatus = 'overdue' | 'due_today' | 'healthy';

export interface PlantCalculatedStatus {
  status: UrgencyStatus;
  nextDueDate: Date;
  daysDiff: number; // negative = overdue days, 0 = due today, positive = days left
  statusLabel: string;
  percentElapsed: number; // 0 to 100+
  formattedLastWatered: string;
  formattedNextDue: string;
}

export interface PlantWithStatus extends Plant {
  computed: PlantCalculatedStatus;
}

export type UrgencyFilter = 'all' | 'needs_water' | 'healthy';
