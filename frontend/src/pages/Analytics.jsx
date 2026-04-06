import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../utils/api";
import { formatCurrency, formatMonthYear, COLORS } from "../utils/format";
import { Card, PageLoader, StatCard } from "../components/UI";

const ttStyle = {
  background: "#fff",
  border: "1px solid #E6E3DA",
  borderRadius: 12,
  fontSize: 12,
  color: "#141210",
  boxShadow: "0 4px 20px rgba(20,18,16,0.1)",
};

export default function Analytics() {
  const [trends, setTrends] = useState(null);
  const [cats, setCats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard/trends"), api.get("/dashboard/category-analytics")])
      .then(([t, c]) => { setTrends(t.data); setCats(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const monthly = (trends?.monthly_trends || []).map(t => ({ ...t, period: formatMonthYear(t.period), net: t.income - t.expenses }));
  const expCat = cats?.expense_by_category || [];
  const incCat = cats?.income_by_category || [];
  const totalExp = expCat.reduce((s, c) => s + c.total, 0);
  const totalInc = incCat.reduce((s, c) => s + c.total, 0);
  const avgInc = monthly.length ? monthly.reduce((s, m) => s + m.income, 0) / monthly.length : 0;
  const avgExp = monthly.length ? monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Deep Dive</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>Understand your financial patterns over time.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="stagger">
        <StatCard label="Avg Monthly Income" icon="📆" value={formatCurrency(avgInc)} color="var(--green)" delay={0} />
        <StatCard label="Avg Monthly Expense" icon="📆" value={formatCurrency(avgExp)} color="var(--red)" delay={55} />
        <StatCard
          label="Savings Rate" icon="💰" color="var(--accent)" delay={110}
          value={totalInc > 0 ? `${(((totalInc - totalExp) / totalInc) * 100).toFixed(1)}%` : "—"}
          sub={totalInc > 0 ? (totalInc - totalExp >= 0 ? "Saving ✓" : "Overspending") : ""}
        />
        <StatCard label="Expense Categories" icon="🗂️" value={expCat.length} color="var(--amber)" delay={165} sub={`Top: ${expCat[0]?.category || "—"}`} />
      </div>

      {/* Monthly Overview Bar Chart */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", boxShadow: "var(--shadow-xs)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(61,53,212,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, position: "relative" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Performance</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>Monthly Overview</h3>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[{ label: "Income", color: "#0D9B65" }, { label: "Expenses", color: "#D93025" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,16,0.05)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: "#A09C94", fontSize: 11, fontFamily: "Cabinet Grotesk" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#A09C94", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={ttStyle} formatter={v => formatCurrency(v)} />
            <Bar dataKey="income" fill="#0D9B65" radius={[5, 5, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#D93025" radius={[5, 5, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net Balance Line Chart */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px", boxShadow: "var(--shadow-xs)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Trend</p>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", marginBottom: 20 }}>Net Balance Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,18,16,0.05)" />
            <XAxis dataKey="period" tick={{ fill: "#A09C94", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#A09C94", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={ttStyle} formatter={v => [formatCurrency(v), "Net Balance"]} />
            <Line type="monotone" dataKey="net" stroke="#3D35D4" strokeWidth={2.5} dot={{ fill: "#3D35D4", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#3D35D4", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Expense categories */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-xs)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Spending</p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", marginBottom: 20 }}>Top Expense Categories</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {expCat.slice(0, 6).map((cat, i) => {
              const pct = totalExp > 0 ? (cat.total / totalExp) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.01em" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                      {cat.category}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                      {formatCurrency(cat.total)} <span style={{ color: "var(--text-muted)" }}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 5, background: "var(--bg-hover)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: COLORS[i], width: `${pct}%`, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income sources donut */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-xs)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Sources</p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em", marginBottom: 8 }}>Income Breakdown</h3>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie data={incCat} cx="50%" cy="45%" outerRadius={90} innerRadius={52} paddingAngle={3} dataKey="total" strokeWidth={0} nameKey="category">
                {incCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={ttStyle} />
              <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: 11, fontFamily: "Cabinet Grotesk", fontWeight: 600 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
