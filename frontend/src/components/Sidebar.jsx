import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/dashboard", label: "Overview", icon: <OverviewIcon />, roles: ["admin", "analyst", "viewer"] },
  { path: "/records",   label: "Records",  icon: <RecordsIcon />,  roles: ["admin", "analyst", "viewer"] },
  { path: "/analytics", label: "Analytics",icon: <AnalyticsIcon />,roles: ["admin", "analyst"] },
  { path: "/users",     label: "Users",    icon: <UsersIcon />,    roles: ["admin"] },
];

const ROLE_COLOR = { admin: "#3D35D4", analyst: "#0D9B65", viewer: "#C97910" };
const ROLE_BG    = { admin: "rgba(61,53,212,0.1)", analyst: "rgba(13,155,101,0.1)", viewer: "rgba(201,121,16,0.1)" };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [logoutHover, setLogoutHover] = useState(false);

  return (
    <aside style={{
      width: "var(--nav-width)",
      height: "100vh",
      position: "fixed",
      left: 0, top: 0,
      background: "#141210",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      overflow: "hidden",
    }}>
      {/* Top glow */}
      <div style={{
        position: "absolute", top: -80, left: "50%",
        transform: "translateX(-50%)",
        width: 220, height: 160,
        background: "radial-gradient(ellipse, rgba(61,53,212,0.22) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 20px 20px", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: "linear-gradient(135deg, #3D35D4, #6B63F5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 18px rgba(61,53,212,0.5)", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="#fff" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
            <path d="M14 7L21 11V17L14 21L7 17V11L14 7Z" fill="#fff" opacity="0.7" />
            <circle cx="14" cy="14" r="3" fill="#fff" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>
            FinVault
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: -1 }}>
            Finance OS
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "0 20px 8px" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.18em" }}>
          Navigation
        </span>
      </div>

      {/* Divider line accent */}
      <div style={{ margin: "0 20px 12px", height: 1, background: "linear-gradient(90deg, rgba(61,53,212,0.5), transparent)" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 3, position: "relative", zIndex: 1 }}>
        {NAV.filter(n => n.roles.includes(user?.role)).map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
            background: isActive ? "rgba(61,53,212,0.22)" : "transparent",
            fontSize: 13.5, fontWeight: isActive ? 700 : 500,
            transition: "all 0.17s",
            textDecoration: "none",
            border: isActive ? "1px solid rgba(61,53,212,0.35)" : "1px solid transparent",
            letterSpacing: "-0.01em",
          })}>
            {({ isActive }) => (
              <>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "rgba(61,53,212,0.3)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "#8B83FF" : "rgba(255,255,255,0.3)",
                  transition: "all 0.17s",
                }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6B63F5", boxShadow: "0 0 8px rgba(61,53,212,0.9)" }} />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom glow */}
      <div style={{
        position: "absolute", bottom: 90, left: "50%",
        transform: "translateX(-50%)",
        width: 160, height: 80,
        background: "radial-gradient(ellipse, rgba(13,155,101,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* User section */}
      <div style={{ margin: "6px 10px 14px", padding: "12px", borderRadius: 13, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${ROLE_COLOR[user?.role]}, ${ROLE_COLOR[user?.role]}99)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 900, color: "#fff",
            boxShadow: `0 0 14px ${ROLE_COLOR[user?.role]}44`,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.02em" }}>
              {user?.name}
            </p>
            <span style={{
              display: "inline-block", fontSize: 9, fontWeight: 800,
              padding: "2px 7px", borderRadius: 20,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: ROLE_COLOR[user?.role], background: ROLE_BG[user?.role], marginTop: 2,
            }}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "8px 0", borderRadius: 8,
            border: `1px solid ${logoutHover ? "rgba(217,48,37,0.5)" : "rgba(217,48,37,0.2)"}`,
            background: logoutHover ? "rgba(217,48,37,0.15)" : "rgba(217,48,37,0.06)",
            color: "#D93025", fontSize: 12.5, fontWeight: 700,
            transition: "all 0.17s", fontFamily: "var(--font-display)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D93025" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function OverviewIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function RecordsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
}
function AnalyticsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
