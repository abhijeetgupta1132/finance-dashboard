import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../utils/api";
import { formatCurrency, formatDate, formatMonthYear, COLORS } from "../utils/format";
import { PageLoader, Badge } from "../components/UI";
import { useAuth } from "../context/AuthContext";

const ttStyle = {
  background: "#fff",
  border: "1px solid #E6E3DA",
  borderRadius: 12,
  fontSize: 12,
  color: "#141210",
  boxShadow: "0 4px 20px rgba(20,18,16,0.12)",
};

function StatCard({ label, value, sub, icon, accentColor, delay = 0, badge }) {
  return (
    <div
      className="animate-fadeIn"
      style={{
        position: "relative", overflow: "hidden",
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "22px 24px",
        opacity: 0, animationDelay: `${delay}ms`,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default", boxShadow: "var(--shadow-xs)",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
    >
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)` }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${accentColor}10`, border: `1px solid ${accentColor}20`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
        }}>
          {icon}
        </div>
        {badge && (
          <span style={{
            fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
            background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}22`,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{badge}</span>
        )}
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: sub ? 5 : 0 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!["admin","analyst"].includes(user?.role)) { setLoading(false); return; }
    Promise.all([api.get("/dashboard/summary"), api.get("/dashboard/trends")])
      .then(([s, t]) => { setSummary(s.data); setTrends(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <PageLoader />;

  if (user?.role === "viewer") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, animation: "fadeIn 0.5s ease" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--accent-subtle)", border: "1px solid rgba(61,53,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👀</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>Viewer Access</h2>
      <p style={{ color: "var(--text-secondary)", maxWidth: 340, textAlign: "center", lineHeight: 1.7 }}>
        You have read-only access. Visit Records to view financial data.
      </p>
      <a href="/records" style={{ padding: "10px 22px", background: "var(--accent)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
        View Records →
      </a>
    </div>
  );

  const { summary: s, category_breakdown, recent_activity } = summary || {};
  const monthly = (trends?.monthly_trends || []).map(t => ({ ...t, period: formatMonthYear(t.period) }));
  const pieData = (category_breakdown || []).filter(c => c.type === "expense").slice(0, 6).map(c => ({ name: c.category, value: c.total }));
  const savingsRate = s?.total_income > 0 ? ((s.net_balance / s.total_income) * 100).toFixed(1) : 0;
  const score = Math.max(0, Math.min(100, Math.round(parseFloat(savingsRate))));
  const greet = ["morning","afternoon","evening"][Math.min(2, Math.floor(new Date().getHours() / 8))];
  const avgInc = monthly.length ? monthly.reduce((a, m) => a + m.income, 0) / monthly.length : 0;
  const avgExp = monthly.length ? monthly.reduce((a, m) => a + m.expenses, 0) / monthly.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 6 }}>
            Good {greet}, {user?.name?.split(" ")[0]}.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>Here's your financial overview for today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s ease infinite" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)" }}>All systems operational</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="Total Income" icon="↑" value={formatCurrency(s?.total_income || 0)} sub={`${s?.income_count || 0} transactions`} accentColor="#0D9B65" delay={0} badge="All time" />
        <StatCard label="Total Expenses" icon="↓" value={formatCurrency(s?.total_expenses || 0)} sub={`${s?.expense_count || 0} transactions`} accentColor="#D93025" delay={60} />
        <StatCard label="Net Balance" icon="⚖" value={formatCurrency(s?.net_balance || 0)} sub={(s?.net_balance || 0) >= 0 ? "↑ Positive balance" : "↓ In deficit"} accentColor={(s?.net_balance || 0) >= 0 ? "#0D9B65" : "#D93025"} delay={120} />
        <StatCard label="Savings Rate" icon="%" value={`${savingsRate}%`} sub="Of total income" accentColor="#3D35D4" delay={180} badge={score > 20 ? "🔥 Great" : score > 0 ? "On track" : "Review"} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Area Chart */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          padding: "24px 28px", boxShadow: "var(--shadow-xs)", position: "relative", overflow: "hidden",
        }}>
          {/* subtle dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(61,53,212,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none", borderRadius: "var(--radius-lg)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, position: "relative" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Cash Flow</p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>Income vs Expenses</h3>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ label: "Income", color: "#0D9B65" }, { label: "Expenses", color: "#D93025" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 20, height: 3, borderRadius: 2, background: l.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9B65" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0D9B65" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D93025" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#D93025" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,16,0.05)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#A09C94", fontSize: 11, fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A09C94", fontSize: 11, fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={v => formatCurrency(v)} />
              <Area type="monotone" dataKey="income" stroke="#0D9B65" strokeWidth={2.5} fill="url(#incG)" name="Income" dot={false} activeDot={{ r: 5, fill: "#0D9B65", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expenses" stroke="#D93025" strokeWidth={2.5} fill="url(#expG)" name="Expenses" dot={false} activeDot={{ r: 5, fill: "#D93025", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-xs)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Breakdown</p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", marginBottom: 4 }}>Expense Categories</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={ttStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {pieData.map((item, i) => {
                  const total = pieData.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{item.name}</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: "var(--bg-hover)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 99, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--text-muted)" }}>No expense data yet</p></div>}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 16 }}>
        {/* Recent Activity */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Live Feed</p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Recent Activity</h3>
            </div>
            <a href="/records" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, letterSpacing: "-0.01em" }}>View all →</a>
          </div>
          {(recent_activity || []).slice(0, 8).map((rec, i) => (
            <div key={rec.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 22px", borderBottom: i < 7 ? "1px solid var(--border)" : "none", transition: "background 0.12s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: rec.type === "income" ? "rgba(13,155,101,0.1)" : "rgba(217,48,37,0.08)",
                  border: `1px solid ${rec.type === "income" ? "rgba(13,155,101,0.2)" : "rgba(217,48,37,0.15)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700,
                  color: rec.type === "income" ? "var(--green)" : "var(--red)",
                }}>
                  {rec.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 1, letterSpacing: "-0.01em" }}>{rec.category}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 400 }}>{formatDate(rec.date)}</p>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, color: rec.type === "income" ? "var(--green)" : "var(--red)" }}>
                {rec.type === "income" ? "+" : "-"}{formatCurrency(rec.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Right panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Monthly averages */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-xs)" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Monthly Averages</p>
            {[{ label: "Avg Income", value: avgInc, color: "var(--green)" }, { label: "Avg Expense", value: avgExp, color: "var(--red)" }].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 3, height: 18, borderRadius: 2, background: item.color, display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{item.label}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: item.color }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 4, height: 6, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ flex: s?.income_count || 1, background: "var(--green)" }} />
              <div style={{ flex: s?.expense_count || 1, background: "var(--red)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11.5, color: "var(--green)", fontWeight: 700 }}>● {s?.income_count || 0} income</span>
              <span style={{ fontSize: 11.5, color: "var(--red)", fontWeight: 700 }}>{s?.expense_count || 0} expense ●</span>
            </div>
          </div>

          {/* Health score */}
          <div style={{ background: "linear-gradient(135deg, rgba(61,53,212,0.06), rgba(13,155,101,0.04))", border: "1px solid rgba(61,53,212,0.12)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Financial Health</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.06em" }}>{score}</span>
              <span style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 6 }}>/100</span>
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${score}%`, background: "linear-gradient(90deg, #3D35D4, #0D9B65)", borderRadius: 99, transition: "width 1.2s ease" }} />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>
              {score > 30 ? "🌟 Excellent discipline" : score > 10 ? "✅ On the right track" : score > 0 ? "⚡ Room to improve" : "⚠️ Review your expenses"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
