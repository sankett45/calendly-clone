"use client";

import { Slot, fmtTime } from "@/lib/api";

interface Props {
  slots: Slot[]; loading: boolean;
  selectedSlot: Slot | null; onSelect: (slot: Slot) => void;
}

export default function TimeSlots({ slots, loading, selectedSlot, onSelect }: Props) {
  const s: React.CSSProperties = { fontFamily: "'Inter', system-ui, sans-serif" };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, ...s }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            height: 40, borderRadius: 6, background: "#f3f4f6",
            animation: "pulse 1.4s ease-in-out infinite", opacity: 1 - i * 0.13,
          }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.6}50%{opacity:.3}}`}</style>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af", fontSize: 13, ...s }}>
        <div style={{ marginBottom: 6 }}>No times available</div>
        <div style={{ fontSize: 11 }}>Try a different date</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 360, ...s }}>
      {slots.map((slot) => {
        const isSel = selectedSlot?.start_utc === slot.start_utc;
        return (
          <button key={slot.start_utc} onClick={() => onSelect(slot)} style={{
            width: "100%", padding: "9px 12px", borderRadius: 6, textAlign: "center",
            border: `1.5px solid ${isSel ? "#006BFF" : "#d1d5db"}`,
            background: isSel ? "#006BFF" : "#fff",
            color: isSel ? "#fff" : "#006BFF",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.12s",
          }}
            onMouseEnter={e => {
              if (!isSel) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#006BFF";
                (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
              }
            }}
            onMouseLeave={e => {
              if (!isSel) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db";
                (e.currentTarget as HTMLButtonElement).style.background = "#fff";
              }
            }}
          >
            {fmtTime(slot.start_local)}
          </button>
        );
      })}
    </div>
  );
}