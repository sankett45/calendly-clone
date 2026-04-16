"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api, Booking, getUserTz } from "@/lib/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN ?? "";

type MeetingTab = "upcoming" | "past" | "all";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<MeetingTab>("upcoming");
  const userTz = getUserTz();

useEffect(() => {
  api
    .getUpcoming()
    .then(setMeetings)
    .catch((err) => {
      console.error("MEETINGS ERROR:", err);
      setMeetings([]);
    })
    .finally(() => setLoading(false));
}, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Meetings</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {(["upcoming", "past", "all"] as MeetingTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
                tab === t
                  ? "text-[#006BFF] border-[#006BFF]"
                  : "text-gray-600 border-transparent hover:text-gray-900",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-2xl">
              📅
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No upcoming meetings</h3>
            <p className="text-sm text-gray-500">
              Share your booking link to start receiving meetings.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {meetings.map((m, i) => {
              const start = dayjs(m.start_utc).tz(userTz);
              const end   = dayjs(m.end_utc).tz(userTz);
              const isToday = start.isSame(dayjs(), "day");
              return (
                <div
                  key={m.id}
                  className={[
                    "flex items-center justify-between px-5 py-4",
                    i < meetings.length - 1 ? "border-b border-gray-100" : "",
                    "hover:bg-gray-50 transition-colors",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="w-12 text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {start.format("MMM")}
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-none">
                        {start.format("D")}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    {/* Info */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.invitee_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isToday ? "Today" : start.format("ddd")},{" "}
                        {start.format("h:mm A")} – {end.format("h:mm A")}
                      </p>
                      <p className="text-xs text-gray-400">{m.invitee_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/reschedule/${m.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600
                                 border border-gray-300 rounded-full hover:bg-gray-50 transition-all"
                    >
                      Reschedule
                    </a>
                    <button
                      className="px-3 py-1.5 text-xs font-medium text-red-600
                                 border border-red-200 rounded-full hover:bg-red-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}