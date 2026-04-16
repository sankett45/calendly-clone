"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { api, EventType, Slot } from "@/lib/api";
import Calendar from "@/components/calendar/Calendar";
import TimeSlots from "@/components/booking/TimeSlots";
import BookingForm from "@/components/booking/BookingForm";

dayjs.extend(utc);
dayjs.extend(timezone);

type Step = "datetime" | "form";

export default function BookPage() {
const { slug } = useParams<{ slug: string }>();
const searchParams = useSearchParams();
const router = useRouter();

const username = searchParams.get("host") || "demo";
const userTz = "Asia/Kolkata";

const [event, setEvent] = useState<EventType | null>(null);
const [eventLoading, setEventLoading] = useState(true);
const [step, setStep] = useState<Step>("datetime");
const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
const [slots, setSlots] = useState<Slot[]>([]);
const [slotsLoading, setSlotsLoading] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

useEffect(() => {
if (!username || !slug) return;


api.getEventBySlug(username, slug)
  .then(setEvent)
  .catch(() => setEvent(null))
  .finally(() => setEventLoading(false));


}, [username, slug]);

const fetchSlots = useCallback(async (date: Dayjs) => {
if (!username || !slug) return;


setSlotsLoading(true);
setSlots([]);

try {
  const res = await api.getSlots(
    username,
    slug,
    date.format("YYYY-MM-DD"),
    userTz
  );
  setSlots(res);
} catch {
  setSlots([]);
} finally {
  setSlotsLoading(false);
}


}, [username, slug, userTz]);

const handleDateSelect = (date: Dayjs) => {
setSelectedDate(date);
setSelectedSlot(null);
fetchSlots(date);
};

const handleSlotSelect = (slot: Slot) => {
setSelectedSlot(slot);
setStep("form");
};

const handleBook = async (
name: string,
email: string,
notes: string,
answers: { key: string; value: string }[]
) => {
if (!event || !selectedSlot) return;


const booking = await api.createBooking({
  event_type_id: event.id,
  slot_start_utc: selectedSlot.start_utc,
  invitee_email: email,
  invitee_name: name,
  invitee_timezone: userTz,

});

router.push(
  `/confirmation?id=${booking.id}&name=${encodeURIComponent(name)}&start=${encodeURIComponent(selectedSlot.start_local)}&end=${encodeURIComponent(selectedSlot.end_local)}&event=${encodeURIComponent(event.title)}`
);

};

if (eventLoading) {
return ( <div className="min-h-screen bg-white flex items-center justify-center"> <div className="w-8 h-8 rounded-full border-2 border-[#006BFF] border-t-transparent animate-spin" /> </div>
);
}

return ( <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
<div
className="w-full max-w-[900px] bg-white rounded-2xl overflow-hidden"
style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
> <div className="flex flex-col lg:flex-row min-h-[560px]">


      <div className="lg:w-[280px] p-8 border-r border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 uppercase mb-4">
          {username[0]}
        </div>

        <p className="text-xs text-gray-500 mb-1">{username}</p>
        <h1 className="text-xl font-bold text-gray-900 mb-5">
          {event?.title}
        </h1>

        <p className="text-sm text-gray-500">{event?.description}</p>
      </div>

      <div className="flex-1 p-8">
        {step === "datetime" && (
          <div className="flex gap-8">
            <Calendar selectedDate={selectedDate} onSelect={handleDateSelect} />

            {selectedDate && (
              <TimeSlots
                slots={slots}
                loading={slotsLoading}
                selectedSlot={selectedSlot}
                onSelect={handleSlotSelect}
              />
            )}
          </div>
        )}

        {step === "form" && selectedSlot && event && (
          <BookingForm
            event={event}
            slot={selectedSlot}
            selectedDate={selectedDate!}
            onSubmit={handleBook}
            onBack={() => setStep("datetime")}
          />
        )}
      </div>

    </div>
  </div>
</div>


);
}
