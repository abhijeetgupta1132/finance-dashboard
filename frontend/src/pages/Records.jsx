import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { formatCurrency, formatDate, CATEGORIES } from "../utils/format";
import { Card, Badge, PageLoader, Empty, Modal, Button, Input, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EMPTY = { amount: "", type: "income", category: "", date: new Date().toISOString().split("T")[0], notes: "" };

function RecordForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return toast.error("Fill required fields");
    onSave({ ...form, amount: parseFloat(form.amount) });
  };
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Input label="Amount *" type="number" step="0.01" min="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" required />
        <Select label="Type *" value={form.type} onChange={e => { set("type", e.target.value); set("category", ""); }}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Select label="Category *" value={form.category} onChange={e => set("category", e.target.value)} required>
          <option value="">Select category</option>
          {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Date *" type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
      </div>
      <Input label="Notes" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional…" maxLength={500} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : initial?.id ? "Update Record" : "Create Record"}</Button>
      </div>
    </form>
  );
}

export default function Records() {
  const { user } = useAuth();
  const canEdit = ["admin","analyst"].includes(user?.role);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [page, setPage] = useState(1);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const r = await api.get("/records", { params });
      setRecords(r.data.records);
      setPagination(r.data.pagination);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      modal?.mode === "edit" ? await api.put(`/records/${modal.record.id}`, form) : await api.post("/records", form);
      toast.success(modal?.mode === "edit" ? "Record updated" : "Record created");
      setModal(null); fetchRecords();
    } catch (err) { toast.error(err.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/records/${delTarget.id}`);
      toast.success("Deleted"); setDelTarget(null); fetchRecords();
    } catch (err) { toast.error(err.response?.data?.error || "Delete failed"); }
  };

  const inputSt = {
    background: "#fff", border: "1px solid var(--border-strong)",
    borderRadius: 9, padding: "8px 13px",
    color: "var(--text-primary)", fontSize: 13, outline: "none",
    fontFamily: "var(--font-display)", fontWeight: 500, transition: "border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>All Transactions</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: 4 }}>Financial Records</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>{pagination.total} total records found</p>
        </div>
        {canEdit && (
          <Button onClick={() => setModal({ mode: "create" })} style={{ gap: 6, padding: "10px 18px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Record
          </Button>
        )}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[
            { label: "Type", el: (
              <select value={filters.type} onChange={e => { setFilters(p => ({ ...p, type: e.target.value })); setPage(1); }} style={inputSt}>
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            )},
            { label: "Category", el: (
              <input value={filters.category} onChange={e => { setFilters(p => ({ ...p, category: e.target.value })); setPage(1); }} placeholder="Search category…" style={{ ...inputSt, width: 180 }} />
            )},
            { label: "From", el: (
              <input type="date" value={filters.startDate} onChange={e => { setFilters(p => ({ ...p, startDate: e.target.value })); setPage(1); }} style={inputSt} />
            )},
            { label: "To", el: (
              <input type="date" value={filters.endDate} onChange={e => { setFilters(p => ({ ...p, endDate: e.target.value })); setPage(1); }} style={inputSt} />
            )},
          ].map(f => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{f.label}</label>
              {f.el}
            </div>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => { setFilters({ type: "", category: "", startDate: "", endDate: "" }); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)", alignSelf: "flex-end" }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
        {loading ? <PageLoader /> : records.length === 0 ? (
          <Empty icon="📋" title="No records found" message="Try adjusting your filters or create a new record."
            action={canEdit && <Button onClick={() => setModal({ mode: "create" })}>Create Record</Button>}
          />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Type", "Category", "Amount", "Notes", "By", "Actions"].map(h => (
                      <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <tr key={rec.id}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.12s", animation: `fadeIn 0.3s ${i * 20}ms ease both` }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 500 }}>{formatDate(rec.date)}</span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <Badge type={rec.type}>{rec.type}</Badge>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{rec.category}</span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: rec.type === "income" ? "var(--green)" : "var(--red)" }}>
                          {rec.type === "income" ? "+" : "-"}{formatCurrency(rec.amount)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", maxWidth: 160 }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontWeight: 500 }}>
                          {rec.notes || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>{rec.created_by_name || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {canEdit && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <Button variant="secondary" size="sm" onClick={() => setModal({ mode: "edit", record: rec })}>Edit</Button>
                            <Button variant="danger" size="sm" onClick={() => setDelTarget(rec)}>Delete</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "Edit Record" : "New Record"}>
        <RecordForm initial={modal?.record} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />
      </Modal>

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Record" width={400}>
        <p style={{ color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.7, fontSize: 14 }}>
          Are you sure you want to permanently delete this record? This action cannot be undone.
        </p>
        {delTarget && (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 11, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{delTarget.category}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{formatDate(delTarget.date)}</p>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: delTarget.type === "income" ? "var(--green)" : "var(--red)" }}>
                {formatCurrency(delTarget.amount)}
              </span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setDelTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Record</Button>
        </div>
      </Modal>
    </div>
  );
}
