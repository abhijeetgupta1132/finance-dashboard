import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DEMOS = [
  { role: "Admin",   email: "admin@finance.com",   password: "admin123",   color: "#3D35D4" },
  { role: "Analyst", email: "analyst@finance.com", password: "analyst123", color: "#0D9B65" },
  { role: "Viewer",  email: "viewer@finance.com",  password: "viewer123",  color: "#C97910" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "#F7F5F0", position: "relative", overflow: "hidden",
    }}>
      {/* Grid pattern background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(20,18,16,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,18,16,0.04) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        pointerEvents: "none",
      }} />

      {/* Left — dark brand panel */}
      <div style={{
        width: "45%", minHeight: "100vh",
        background: "#141210",
        padding: "48px 56px",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        animation: "fadeInLeft 0.6s ease forwards",
      }}>
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -100, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,53,212,0.2) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,155,101,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: "linear-gradient(135deg, #3D35D4, #6B63F5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(61,53,212,0.5)",
          }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="#fff" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
              <path d="M14 7L21 11V17L14 21L7 17V11L14 7Z" fill="#fff" opacity="0.7" />
              <circle cx="14" cy="14" r="3" fill="#fff" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>FinVault</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Finance OS</div>
          </div>
        </div>

        {/* Main copy */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 12px", borderRadius: 20,
            background: "rgba(61,53,212,0.2)", border: "1px solid rgba(61,53,212,0.35)",
            marginBottom: 24, width: "fit-content",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6B63F5", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8B83FF", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Live Dashboard
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 3.5vw, 48px)",
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: "-0.05em",
            color: "#fff", marginBottom: 18,
          }}>
            Financial<br />
            <span style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic", fontWeight: 400,
              background: "linear-gradient(135deg, #8B83FF, #6B63F5)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>intelligence</span><br />
            at your control.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.75, maxWidth: 320, marginBottom: 52 }}>
            Track, analyze, and govern your financial data with precision — across every role and permission level.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 28 }}>
            {[["₹2.4M", "Monthly Volume"], ["99.9%", "Uptime SLA"], ["3", "Access Roles"]].map(([v, l], i) => (
              <div key={l} style={{ flex: 1, paddingRight: 24, borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingLeft: i > 0 ? 24 : 0 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, fontWeight: 600 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 56px",
        animation: "fadeIn 0.6s 0.15s ease both",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: 6 }}>
              Sign in
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14.5, fontWeight: 500 }}>
              Access your financial dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email address</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@company.com" required
                style={{
                  background: "#fff", border: "1.5px solid var(--border-strong)",
                  borderRadius: 11, padding: "13px 16px",
                  color: "var(--text-primary)", fontSize: 14, outline: "none",
                  transition: "border-color 0.15s", boxShadow: "var(--shadow-xs)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(61,53,212,0.5)"}
                onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
              <input
                type="password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••" required
                style={{
                  background: "#fff", border: "1.5px solid var(--border-strong)",
                  borderRadius: 11, padding: "13px 16px",
                  color: "var(--text-primary)", fontSize: 14, outline: "none",
                  transition: "border-color 0.15s", boxShadow: "var(--shadow-xs)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(61,53,212,0.5)"}
                onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                background: loading ? "var(--accent)" : "#141210",
                color: "#fff",
                fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
                padding: "14px 24px", borderRadius: 11, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1, transition: "all 0.2s",
                boxShadow: "0 4px 18px rgba(20,18,16,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                letterSpacing: "-0.02em",
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = "#2A2820")}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = "#141210")}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Signing in…
                </>
              ) : "Sign in →"}
            </button>
          </form>

          {/* Demo quick-access */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: 14 }}>
              Quick Demo Access
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {DEMOS.map(d => (
                <button
                  key={d.role}
                  onClick={() => setForm({ email: d.email, password: d.password })}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    background: "#fff", border: `1.5px solid ${d.color}22`,
                    borderRadius: 9, padding: "9px 12px",
                    cursor: "pointer", color: "var(--text-primary)",
                    fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                    boxShadow: "var(--shadow-xs)", fontFamily: "var(--font-display)",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${d.color}55`; e.currentTarget.style.boxShadow = `0 4px 14px ${d.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${d.color}22`; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
