"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";


const NAV = [
  {
    label: "Scheduling", href: "/scheduling",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Meetings", href: "/meetings",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    label: "Availability", href: "/availability",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    label: "Contacts", href: "/contacts",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    label: "Workflows", href: "/workflows",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>,
  },
  {
    label: "Integrations & apps", href: "/integrations",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>,
  },
  {
    label: "Routing", href: "/routing",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
];

const BOTTOM = [
  { label: "Upgrade plan", href: "/upgrade", icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { label: "Analytics",    href: "/analytics", icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: "Admin center", href: "/admin",     icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
const handleLogout = () => {
  console.log("Logout clicked");
};
  return (
    <aside style={{
      width: 240, minWidth: 240, height: "100vh",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#006BFF", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0 }}>
          <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#006BFF", letterSpacing: "-0.3px" }}>
          Scheduly
        </span>
      </div>

      {/* Create button */}
      <div style={{ padding: "12px 16px" }}>
        <button style={{
          width: "100%", height: 36, borderRadius: 20,
          border: "2px solid #d1d5db", background: "#fff",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13, fontWeight: 500, color: "#374151",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6, transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#9ca3af"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db"; }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 8,
              fontSize: 13, fontWeight: 500, textDecoration: "none",
              color: active ? "#006BFF" : "#6b7280",
              background: active ? "#eff6ff" : "transparent",
              marginBottom: 1, transition: "all 0.1s",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <span style={{ color: active ? "#006BFF" : "#9ca3af", display: "flex" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ borderTop: "1px solid #f3f4f6" }}>
        {BOTTOM.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px", fontSize: 13, fontWeight: 500,
            color: "#6b7280", textDecoration: "none", transition: "background 0.1s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f9fafb"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
          >
            <span style={{ color: "#9ca3af", display: "flex" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Help + logout */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 20px", gap: 10 }}>
          <svg width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" strokeWidth="1.75" style={{flexShrink:0}}>
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", flex: 1 }}>Help</span>
          <button onClick={handleLogout} style={{
            fontSize: 11, color: "#9ca3af", background: "none", border: "none",
            cursor: "pointer", padding: "2px 6px", borderRadius: 4,
            transition: "color 0.1s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}