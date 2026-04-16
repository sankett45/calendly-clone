"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EventTypeRow from "@/components/scheduling/EventTypeRow";
import { api, EventType } from "@/lib/api";

const USERNAME = process.env.NEXT_PUBLIC_DEV_USERNAME ?? "user";

// Mock data fallback
const MOCK_EVENTS: EventType[] = [
  {
    id: "1",
    title: "30 Minute Meeting",
    slug: "30-min",
    description: "A short call to connect and discuss.",
    duration: 30,
  },
  {
    id: "2",
    title: "60 Minute Meeting",
    slug: "60-min",
    description: "An in-depth session.",
    duration: 60,
  },
];

type Tab = "event-types" | "single-use" | "polls";

export default function SchedulingPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("event-types");
  const [toast, setToast] = useState("");

  // ── Load events ─────────────────────
  useEffect(() => {
    api
      .getEventTypes()
      .then((data) => {
        console.log("EVENTS:", data);
        setEvents(data);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setEvents(MOCK_EVENTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = (slug: string) => {
    setToast(`Link copied for "${slug}"`);
    setTimeout(() => setToast(""), 2500);
  };

  // ── Create Event ────────────────────
 const handleCreate = async () => {
  console.log("CLICKED");

  try {
    const res = await fetch("http://localhost:8000/api/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Event",
        slug: "test-" + Date.now(),
        duration_minutes: 30,
      }),
    });

    const data = await res.json();
    console.log("RESPONSE:", data);

    // reload events
    const updated = await fetch("http://localhost:8000/api/v1/events");
    const updatedData = await updated.json();
    setEvents(updatedData);

  } catch (err) {
    console.error("ERROR:", err);
  }
};
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Scheduling</h1>

          {/* ✅ FIXED CREATE BUTTON */}
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            + Create
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          {(["event-types", "single-use", "polls"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "font-bold text-blue-600" : ""}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search event types"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-4 w-full"
        />

        {/* Events */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No events found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((event) => (
              <EventTypeRow
                key={event.id}
                event={event}
                username={USERNAME}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded">
            {toast}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}