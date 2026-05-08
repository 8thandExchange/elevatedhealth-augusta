export interface Provider {
  user_id: string;
  display_name: string;
  email: string;
  color: string;
}

export interface ProviderSchedule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0=Sun..6=Sat
  start_time: string;  // "HH:MM:SS"
  end_time: string;
  service_lines: string[];
  slot_minutes: number;
  is_active: boolean;
}

export interface ScheduleBlock {
  id: string;
  provider_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
}

export interface ScheduleException {
  id: string;
  provider_id: string;
  exception_date: string;
  start_time: string;
  end_time: string;
  type: "addition" | "removal";
  service_lines: string[];
  reason: string | null;
}

export interface Appointment {
  id: string;
  provider_id: string | null;
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_line: string;
  status: string;
  notes: string | null;
  is_telehealth: boolean | null;
  iv_drip_booking_id: string | null;
  consultation_booking_id: string | null;
  patient_name?: string | null;
  patient_phone?: string | null;
}

export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled";

export const SERVICE_LINES = [
  { id: "iv", label: "IV", full: "IV Therapy" },
  { id: "consult", label: "WA", full: "Wellness Assessment" },
  { id: "hormone", label: "HRM", full: "Hormone" },
  { id: "peptide", label: "PEP", full: "Peptide" },
  { id: "weight_loss", label: "WL", full: "Weight Loss" },
  { id: "follow_up", label: "F/U", full: "Follow-up" },
] as const;

export const SERVICE_LABEL: Record<string, string> = Object.fromEntries(
  SERVICE_LINES.map((s) => [s.id, s.label])
);
export const SERVICE_FULL: Record<string, string> = Object.fromEntries(
  SERVICE_LINES.map((s) => [s.id, s.full])
);

export const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  scheduled:   { bg: "bg-primary text-primary-foreground", label: "Booked" },
  checked_in:  { bg: "bg-accent text-accent-foreground", label: "Checked-in" },
  in_progress: { bg: "bg-amber-500 text-white", label: "In progress" },
  completed:   { bg: "bg-green-700 text-white", label: "Completed" },
  no_show:     { bg: "bg-red-700/70 text-white line-through", label: "No-show" },
  cancelled:   { bg: "bg-muted text-muted-foreground line-through opacity-60", label: "Cancelled" },
};

export const HOUR_START = 7;
export const HOUR_END = 20;
export const SLOT_MINUTES = 30;
export const ROWS = (HOUR_END - HOUR_START) * (60 / SLOT_MINUTES);
export const ROW_PX = 32;
