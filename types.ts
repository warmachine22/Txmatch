
export interface TimeSlot {
  day: number; // 0 for Monday, 6 for Sunday
  time: number; // e.g., 5, 5.5, 6, ... 22.5 (for 5:00 AM, 5:30 AM, etc.)
}

export interface Case {
  id: string;
  name: string;
  address: string;
  color: string;
  schedule: TimeSlot[];
}

export interface Therapist {
  id: string;
  name:string;
  cases: Case[];
}

export interface NewCaseInfo {
  name: string;
  address: string;
  requiredHours: number;
  availability: TimeSlot[];
}

export interface GeoCoordinates {
  lat: string;
  lon: string;
}

export interface MatchResult {
  therapist: Therapist;
  totalHours: number;
  availableHours: number;
  isDistanceMatch: boolean;
}
