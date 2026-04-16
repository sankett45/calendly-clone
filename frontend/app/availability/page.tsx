"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_SCHEDULE = [
  { day: "Sunday",    active: false, start: "09:00", end: "17:00" },
  { day: "Monday",    active: true,  start: "09:00", end: "17:00" },
  { day: "Tuesday",   active: true,  start: "09:00", end: "17:00" },
  { day: "Wednesday", active: true,  start: "09:00", end: "17:00" },
  { day: "Thursday",  active: true,  start: "09:00", end: "17:00" },
  { day: "Friday",    active: true,  start: "09:00", end: "17:00" },
  { day: "Saturday",  active: false, start: "09:00", end: "17:00" },
];

type DaySchedule = typeof DEFAULT_SCHEDULE[number];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [saved, setSaved] = useState(false);

  const toggleDay = (idx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, active: !d.active } : d))
    );
  };

  const updateTime = (idx: number, field: "start" | "end", value: string) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  // ✅ NEW: Load availability from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/availability")
      .then((res) => res.json())
      .then((data) => {
        const updated = DEFAULT_SCHEDULE.map((day, idx) => {
          const match = data.find((d: any) => d.day_of_week === idx);

          if (!match) {
            return { ...day, active: false };
          }

          return {
            ...day,
            active: true,
            start: match.start_time.slice(0, 5),
            end: match.end_time.slice(0, 5),
          };
        });

        setSchedule(updated);
      })
      .catch((err) => console.error("Failed to load availability", err));
  }, []);

  // ✅ Already correct
  const handleSave = async () => {
    try {
 const payload = schedule
  .map((d, idx) => ({
    day_of_week: idx,
    start_time: d.active ? `${d.start}:00` : null,
    end_time: d.active ? `${d.end}:00` : null,
    timezone,
  }))
  .filter((d) => d.start_time && d.end_time);

      await fetch("http://localhost:8000/api/v1/availability/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save availability failed", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#006BFF] hover:bg-[#0056CC] text-white
                       text-sm font-semibold rounded-lg shadow-cal-btn transition-all"
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-[#006BFF] bg-white"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="Europe/London">London</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {schedule.map((day, idx) => (
            <div key={day.day} className="flex items-center gap-4 px-5 py-4">
              <button
                onClick={() => toggleDay(idx)}
                className={`w-9 h-5 rounded-full ${day.active ? "bg-[#006BFF]" : "bg-gray-200"}`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full ${
                    day.active ? "ml-4" : "ml-0"
                  }`}
                />
              </button>

              <span className="w-28 text-sm">{day.day}</span>

              {day.active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={day.start}
                    onChange={(e) => updateTime(idx, "start", e.target.value)}
                  />
                  <span>–</span>
                  <input
                    type="time"
                    value={day.end}
                    onChange={(e) => updateTime(idx, "end", e.target.value)}
                  />
                </div>
              ) : (
                <span className="text-gray-400 flex-1">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}