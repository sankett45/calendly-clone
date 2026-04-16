"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDS    = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

interface CalendarProps { selectedDate: Dayjs | null; onSelect: (date: Dayjs) => void; }

export default function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const [cursor, setCursor] = useState<Dayjs>(dayjs().startOf("month"));
  const today = dayjs().startOf("day");
  const start = cursor.startOf("month").startOf("week");
  const end   = cursor.endOf("month").endOf("week");

  const days: Dayjs[] = [];
  let d = start;
  while (d.isBefore(end) || d.isSame(end, "day")) { days.push(d); d = d.add(1, "day"); }

  const prevDisabled = cursor.isSame(dayjs().startOf("month"), "month");

  return (
    <div style={{ width: "100%", fontFamily: "'Inter', system-ui, sans-serif", userSelect: "none" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => !prevDisabled && setCursor(cursor.subtract(1, "month"))}
          style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent",
                   cursor: prevDisabled ? "not-allowed" : "pointer", color: "#6b7280",
                   opacity: prevDisabled ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
          {MONTHS[cursor.month()]} {cursor.year()}
        </span>
        <button onClick={() => setCursor(cursor.add(1, "month"))}
          style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent",
                   cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {WDS.map(w => (
          <div key={w} style={{ textAlign: "center", fontSize: 10, fontWeight: 600,
                                color: "#9ca3af", textTransform: "uppercase",
                                letterSpacing: "0.04em", padding: "2px 0" }}>{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day) => {
          const inMonth = day.month() === cursor.month();
          const isPast  = day.isBefore(today);
          const isSel   = selectedDate?.format("YYYY-MM-DD") === day.format("YYYY-MM-DD");
          const isToday = day.isSame(today, "day");
          const clickable = inMonth && !isPast;

          let bg    = "transparent";
          let color = "#374151";
          let fw    = 400;
          if (!inMonth) { color = "transparent"; }
          else if (isSel)  { bg = "#006BFF"; color = "#fff"; fw = 600; }
          else if (isPast) { color = "#d1d5db"; }
          else if (isToday){ bg = "#eff6ff"; color = "#006BFF"; fw = 600; }

          return (
            <div key={day.format("YYYY-MM-DD")} style={{ aspectRatio: "1/1", padding: 2 }}>
              <button
                onClick={() => clickable && onSelect(day)}
                style={{
                  width: "100%", height: "100%",
                  borderRadius: "50%", border: "none",
                  background: bg, color, fontWeight: fw,
                  fontSize: 13, cursor: clickable ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.1s",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  opacity: !inMonth ? 0 : 1,
                  pointerEvents: !inMonth ? "none" : "auto",
                }}
                onMouseEnter={e => {
                  if (clickable && !isSel && !isToday) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = bg;
                }}
              >
                {day.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}