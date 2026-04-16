"use client";

import { useState } from "react";
import { EventType } from "@/lib/api";

const LOC: Record<string, string> = {
  google_meet: "Google Meet", zoom: "Zoom",
  phone: "Phone call", in_person: "In person", custom: "Custom",
};

interface Props { event: EventType; username: string; onCopyLink: (slug: string) => void; }

export default function EventTypeRow({ event, username, onCopyLink }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const handleCopy = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/book/${event.slug}?host=${username}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    onCopyLink(event.slug);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      style={{
        display: "flex", alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8, border: `1px solid ${hovered ? "#d1d5db" : "#e5e7eb"}`,
        boxShadow: hovered ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
        overflow: "visible", position: "relative",
        transition: "border-color 0.15s, box-shadow 0.15s",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Colour bar */}
      <div style={{ width: 4, alignSelf: "stretch", background: event.color, borderRadius: "8px 0 0 8px", flexShrink: 0 }} />

      {/* Checkbox */}
      <div style={{ padding: "14px 10px 14px 14px", display: "flex", alignItems: "flex-start" }}>
        <input type="checkbox" style={{ width: 14, height: 14, accentColor: "#006BFF", cursor: "pointer", marginTop: 2 }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: "12px 0", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 3 }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span>{event.duration_minutes} min</span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span>{LOC[event.location_type] ?? event.location_type}</span>
          <span style={{ color: "#d1d5db" }}>•</span>
          <span>One-on-One</span>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Weekdays, 9 am – 5 pm</div>
      </div>

      {/* Actions — only visible on hover */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "0 16px",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.15s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        {/* Copy link */}
        <button onClick={handleCopy} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 20,
          border: "1px solid #d1d5db", background: "#fff",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12, fontWeight: 500, color: copied ? "#16a34a" : "#374151",
          cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.12s",
        }}>
          {copied ? (
            <><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
          ) : (
            <><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>Copy link</>
          )}
        </button>

        {/* Open booking page */}
        <a href={`/book/${event.slug}?host=${username}`} target="_blank" rel="noopener noreferrer"
           style={{ width: 28, height: 28, borderRadius: 20, border: "1px solid #d1d5db", background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6b7280", textDecoration: "none", transition: "all 0.12s" }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>

        {/* 3-dot */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 28, height: 28, borderRadius: 20, border: "1px solid #d1d5db",
            background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "#6b7280",
          }}>
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: 34, width: 160,
              backgroundColor: "#fff", borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              zIndex: 50, padding: "4px 0",
            }}>
              {["Edit", "Clone", "Share"].map(label => (
                <button key={label} style={{
                  width: "100%", textAlign: "left", padding: "8px 16px",
                  fontSize: 13, color: "#374151", background: "none",
                  border: "none", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                >{label}</button>
              ))}
              <div style={{ borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />
              <button style={{
                width: "100%", textAlign: "left", padding: "8px 16px",
                fontSize: 13, color: "#dc2626", background: "none",
                border: "none", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
              }}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}