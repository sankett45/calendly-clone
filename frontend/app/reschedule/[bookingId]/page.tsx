"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import tz  from "dayjs/plugin/timezone";
import { api, Booking, EventType, Slot, getUserTz, fmtDate, fmtTime } from "@/lib/api";
import Calendar  from "@/components/calendar/Calendar";
import TimeSlots from "@/components/booking/TimeSlots";

dayjs.extend(utc);
dayjs.extend(tz);

export default function ReschedulePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const userTz = getUserTz();

  const [booking,      setBooking]      = useState<Booking | null>(null);
  const [event,        setEvent]        = useState<EventType | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots,        setSlots]        = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirming,   setConfirming]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => {
    api.getBooking(bookingId)
      .then((b) => {
        setBooking(b);
        setEvent({ id: b.event_type_id, title: "Meeting", slug: "meeting",
          description: "", duration_minutes: 30, color: "#006BFF",
          location_type: "google_meet", buffer_before: 0, buffer_after: 0,
          is_active: true, custom_questions: [] });
      })
      .catch(() => {
        const mock: Booking = { id: bookingId, event_type_id: "mock", host_id: "mock",
          invitee_email: "alex@example.com", invitee_name: "Alex Johnson",
          invitee_timezone: userTz,
          start_utc: dayjs().add(2,"day").hour(10).toISOString(),
          end_utc: dayjs().add(2,"day").hour(10).add(30,"minute").toISOString(),
          status: "confirmed", meeting_url: "", notes: "", created_at: new Date().toISOString() };
        setBooking(mock);
        setEvent({ id: "mock", title: "30 Minute Meeting", slug: "30-min",
          description: "", duration_minutes: 30, color: "#7C3AED",
          location_type: "google_meet", buffer_before: 0, buffer_after: 0,
          is_active: true, custom_questions: [] });
      })
      .finally(() => setLoading(false));
  }, [bookingId, userTz]);

  const fetchSlots = useCallback(async (date: Dayjs) => {
    if (!event) return;
    setSlotsLoading(true); setSlots([]);
    try {
      setSlots(await api.getSlots("host", event.slug, date.format("YYYY-MM-DD"), userTz));
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  }, [event, userTz]);

  const handleDateSelect = (d: Dayjs) => { setSelectedDate(d); setSelectedSlot(null); fetchSlots(d); };
  const handleSlotSelect = (s: Slot) => { setSelectedSlot(s); setConfirming(true); };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true); setError("");
    try {
      const nb = await api.rescheduleBooking(bookingId, { slot_start_utc: selectedSlot.start_utc, invitee_timezone: userTz });
      router.push(`/confirmation?id=${nb.id}&name=${encodeURIComponent(booking?.invitee_name ?? "")}&start=${encodeURIComponent(selectedSlot.start_local)}&end=${encodeURIComponent(selectedSlot.end_local)}&event=${encodeURIComponent(event?.title ?? "Meeting")}`);
    } catch (e: any) { setError(e.message ?? "Failed. Try another slot."); setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#006BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const origStart = booking ? dayjs(booking.start_utc).tz(userTz) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[900px] bg-white rounded-2xl overflow-hidden"
           style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
        <div className="flex flex-col lg:flex-row min-h-[520px]">

          {/* Left panel */}
          <div className="lg:w-[280px] flex-shrink-0 p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center
                             text-sm font-bold text-gray-600 mb-4">S</div>
            <p className="text-xs text-gray-500 mb-1">Rescheduling</p>
            <h1 className="text-xl font-bold text-gray-900 mb-5">{event?.title}</h1>

            {origStart && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
                  Current time
                </p>
                <p className="text-sm font-medium text-amber-900">{fmtDate(origStart)}</p>
                <p className="text-xs text-amber-700">{origStart.format("h:mm A")} – {dayjs(booking?.end_utc).tz(userTz).format("h:mm A")}</p>
              </div>
            )}

            {selectedDate && (
              <div className="p-3 rounded-lg bg-[#EBF3FF] border border-[#CCE2FF]">
                <p className="text-xs font-semibold text-[#006BFF] mb-1 uppercase tracking-wide">
                  New time
                </p>
                <p className="text-sm font-medium text-gray-900">{fmtDate(selectedDate)}</p>
                {selectedSlot && <p className="text-xs text-[#006BFF]">{fmtTime(selectedSlot.start_local)} – {fmtTime(selectedSlot.end_local)}</p>}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 p-8">
            {!confirming ? (
              <div className="flex flex-col lg:flex-row gap-8 fade-in">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Select a New Date & Time</h2>
                  <Calendar selectedDate={selectedDate} onSelect={handleDateSelect} />
                </div>
                {selectedDate && (
                  <div className="lg:w-[160px] fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{selectedDate.format("ddd, MMM D")}</h3>
                    <TimeSlots slots={slots} loading={slotsLoading} selectedSlot={selectedSlot} onSelect={handleSlotSelect} />
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-sm fade-in">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Confirm New Time</h2>
                <div className="p-4 rounded-lg bg-[#EBF3FF] border border-[#CCE2FF] mb-5">
                  <p className="text-sm font-semibold text-gray-900">{selectedDate && fmtDate(selectedDate)}</p>
                  {selectedSlot && <p className="text-sm text-[#006BFF]">{fmtTime(selectedSlot.start_local)} – {fmtTime(selectedSlot.end_local)}</p>}
                </div>
                <p className="text-xs text-gray-500 mb-4">The original booking will be cancelled and a new invitation sent.</p>
                {error && <div className="mb-3 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
                <div className="flex gap-3">
                  <button onClick={() => setConfirming(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    Back
                  </button>
                  <button onClick={handleConfirm} disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-[#006BFF] hover:bg-[#0056CC]
                               text-white text-sm font-semibold shadow-cal-btn
                               disabled:opacity-50 transition-all">
                    {submitting ? "Rescheduling…" : "Confirm new time"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-400">
        Powered by <span className="text-[#006BFF] font-medium">Scheduly</span>
      </div>
    </div>
  );
}