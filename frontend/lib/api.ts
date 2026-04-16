import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Base URL
const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Error class ─────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ─────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.detail ?? "Request failed");
  }

  return res.json();
}

// ── Types ─────────────────────────────────────────────

export interface QuestionDefinition {
  key: string;
  label: string;
  type: "text" | "textarea" | "phone" | "url";
  required: boolean;
  placeholder?: string;
}

export interface EventType {
  id: string;
  title: string;
  slug: string;
  description?: string;
  duration_minutes: number;
  custom_questions?: QuestionDefinition[];
  color?: string;
  location_type?: string;
  buffer_before?: number;
  buffer_after?: number;
  is_active?: boolean;
}

export interface Slot {
  start_utc: string;
  end_utc: string;
  start_local: string;
  end_local: string;
}

export interface Booking {
  id: string;
  event_type_id: string;
  host_id?: string;
  invitee_email: string;
  invitee_name: string;
  invitee_timezone: string;
  start_utc: string;
  end_utc: string;
  status: string;
  meeting_url?: string;
  notes?: string;
  created_at: string;
}

// ── API ───────────────────────────────────────────────

export const api = {
  // ── Events ─────────────────────────────────────────

  getEventTypes: () =>
    apiFetch<EventType[]>("/events"),

  createEventType: (data: Partial<EventType>) =>
    apiFetch<EventType>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEventType: (id: string, data: Partial<EventType>) =>
    apiFetch<EventType>(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteEventType: (id: string) =>
    apiFetch<void>(`/events/${id}`, {
      method: "DELETE",
    }),

  getEventBySlug: (username: string, slug: string) =>
    apiFetch<EventType>(`/u/${username}/${slug}/event`),

  // ── Slots ─────────────────────────────────────────

  getSlots: (username: string, slug: string, date: string, tz: string) =>
    apiFetch<Slot[]>(
      `/u/${username}/${slug}/slots?date=${date}&timezone=${encodeURIComponent(tz)}`
    ),

  // ── Bookings ───────────────────────────────────────

  createBooking: (payload: {
    event_type_id: string;
    slot_start_utc: string;
    invitee_email: string;
    invitee_name: string;
    invitee_timezone: string;
    notes?: string;
    answers?: { key: string; value: string }[];
  }) =>
    apiFetch<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getBooking: (bookingId: string) =>
    apiFetch<Booking>(`/bookings/${bookingId}/public`),

  getUpcoming: () =>
    apiFetch<Booking[]>("/bookings/upcoming"),

  rescheduleBooking: (bookingId: string, payload: {
    slot_start_utc: string;
    invitee_timezone: string;
  }) =>
    apiFetch<Booking>(`/bookings/${bookingId}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// ── Helpers ───────────────────────────────────────────

export const getUserTz = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const fmtTime = (iso: string): string =>
  dayjs(iso).format("h:mm A");

export const fmtDate = (d: dayjs.Dayjs): string =>
  d.format("dddd, MMMM D, YYYY");

export const fmtShortDate = (d: dayjs.Dayjs): string =>
  d.format("MMM D, YYYY");