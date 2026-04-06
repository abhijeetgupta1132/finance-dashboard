import React, { useEffect } from "react";

export function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xs)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Badge({ type, children }) {
  const themes = {
    income:   { color: "#0D9B65", bg: "rgba(13,155,101,0.08)",  border: "rgba(13,155,101,0.2)"  },
    expense:  { color: "#D93025", bg: "rgba(217,48,37,0.08)",   border: "rgba(217,48,37,0.2)"   },
    admin:    { color: "#3D35D4", bg: "rgba(61,53,212,0.08)",   border: "rgba(61,53,212,0.2)"   },
    analyst:  { color: "#0D9B65", bg: "rgba(13,155,101,0.08)",  border: "rgba(13,155,101,0.2)"  },
    viewer:   { color: "#C97910", bg: "rgba(201,121,16,0.08)",  border: "rgba(201,121,16,0.2)"  },
    active:   { color: "#0D9B65", bg: "rgba(13,155,101,0.07)",  border: "rgba(13,155,101,0.15)" },
    inactive: { color: "#D93025", bg: "rgba(217,48,37,0.07)",   border: "rgba(217,48,37,0.15)"  },
  };
  const t = themes[type] || { color: "#6B6760", bg: "rgba(107,103,96,0.08)", border: "rgba(107,103,96,0.18)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 6,
      border: `1px solid ${t.border}`,
      background: t.bg, color: t.color,
      fontSize: 10.5, fontWeight: 800,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.color }} />
      {children}
    </span>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      border: "2px solid var(--border)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

export function PageLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 14 }}>
      <Spinner size={32} />
      <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Loading…</p>
    </div>
  );
}

export function Empty({ icon, title, message, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
        {icon || "📭"}
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {title}
      </p>
      {message && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>{message}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(20,18,16,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div style={{
        width: "100%", maxWidth: width,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-lg)",
        animation: "slideUp 0.25s ease forwards",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px 0" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, color: "var(--text-muted)", fontSize: 16,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-elevated)"}
          >✕</button>
        </div>
        <div style={{ padding: "20px 26px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = "var(--accent)", delay = 0 }) {
  return (
    <div className="animate-fadeIn" style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "22px",
      display: "flex", flexDirection: "column", gap: 6,
      opacity: 0, animationDelay: `${delay}ms`,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
      position: "relative", overflow: "hidden",
      boxShadow: "var(--shadow-xs)",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
    >
      {/* top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: `${color}12`,
        border: `1px solid ${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 8,
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", size = "md", disabled, style, type = "button" }) {
  const v = {
    primary:   { background: "var(--accent)", color: "#fff", border: "1px solid rgba(61,53,212,0.3)", boxShadow: "0 2px 10px rgba(61,53,212,0.2)" },
    secondary: { background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    danger:    { background: "var(--red-subtle)", color: "var(--red)", border: "1px solid rgba(217,48,37,0.2)" },
    success:   { background: "var(--green-subtle)", color: "var(--green)", border: "1px solid rgba(13,155,101,0.2)" },
    ghost:     { background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent" },
  };
  const s = {
    sm: { padding: "5px 12px", fontSize: 12, borderRadius: 7 },
    md: { padding: "8px 16px", fontSize: 13, borderRadius: 9 },
    lg: { padding: "12px 22px", fontSize: 14.5, borderRadius: 11 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "var(--font-display)", fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      letterSpacing: "-0.01em",
      ...v[variant], ...s[size], ...style,
    }}>
      {children}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <input style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${error ? "rgba(217,48,37,0.4)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-md)",
        padding: "10px 14px", color: "var(--text-primary)",
        fontSize: 14, outline: "none", width: "100%",
        transition: "border-color 0.15s",
      }}
        onFocus={e => e.target.style.borderColor = "rgba(61,53,212,0.4)"}
        onBlur={e => e.target.style.borderColor = error ? "rgba(217,48,37,0.4)" : "var(--border-strong)"}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <select style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${error ? "rgba(217,48,37,0.4)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-md)",
        padding: "10px 14px", color: "var(--text-primary)",
        fontSize: 14, outline: "none", cursor: "pointer", width: "100%",
        transition: "border-color 0.15s",
      }}
        onFocus={e => e.target.style.borderColor = "rgba(61,53,212,0.4)"}
        onBlur={e => e.target.style.borderColor = error ? "rgba(217,48,37,0.4)" : "var(--border-strong)"}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}
