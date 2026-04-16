"use client";


import { useEffect, useState } from "react";

export default function TopBar() {
  const [displayName, setDisplayName] = useState("User");
  const [initials,    setInitials]    = useState("U");

  useEffect(() => {
  const dn = "Demo User";
  setDisplayName(dn);
  setInitials(
    dn
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}, []);

  return (
    <header style={{
      height: 60, backgroundColor: "#fff",
      borderBottom: "1px solid #e5e7eb",
      display: "flex", alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 20px", gap: 10, flexShrink: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Invite icon */}
      <button style={{
        width: 34, height: 34, borderRadius: "50%", border: "none",
        background: "transparent", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#9ca3af",
        transition: "background 0.1s",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      </button>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#e5e7eb", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#4b5563",
        }}>
          {initials}
        </div>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{displayName}</span>
        <svg width="12" height="12" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </header>
  );
}