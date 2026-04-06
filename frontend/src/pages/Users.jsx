import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { formatDate } from "../utils/format";
import { Card, Badge, PageLoader, Empty, Modal, Button, Input, Select } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/users"); setUsers(r.data.users); }
    catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/auth/register", form);
      toast.success("User created");
      setModal(false);
      setForm({ name: "", email: "", password: "", role: "viewer" });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setSaving(false); }
  };

  const changeRole = async (id, role) => {
    try { await api.patch(`/users/${id}/role`, { role }); toast.success("Role updated"); load(); }
    catch (e) { toast.error(e.response?.data?.error || "Failed"); }
  };

  const toggleStatus = async (id, status) => {
    try { await api.patch(`/users/${id}/status`, { status }); toast.success("Status updated"); load(); }
    catch (e) { toast.error(e.response?.data?.error || "Failed"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/users/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.error || "Failed"); }
  };

  const counts = users.reduce((a, u) => ({ ...a, [u.role]: (a[u.role] || 0) + 1 }), {});

  const ROLE_META = [
    { role: "admin",   label: "Admins",   color: "#3D35D4", bg: "rgba(61,53,212,0.07)",  icon: "🔑" },
    { role: "analyst", label: "Analysts", color: "#0D9B65", bg: "rgba(13,155,101,0.07)", icon: "📊" },
    { role: "viewer",  label: "Viewers",  color: "#C97910", bg: "rgba(201,121,16,0.07)", icon: "👀" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeIn 0.4s ease" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Access Control</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: 4 }}>User Management</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>{users.length} users in the system</p>
        </div>
        <Button onClick={() => setModal(true)} style={{ gap: 6, padding: "10px 18px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </Button>
      </div>

      {/* Role stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="stagger">
        {ROLE_META.map(({ role, label, color, bg, icon }, i) => (
          <div key={role} className="animate-fadeIn" style={{
            background: "#fff", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "20px 22px",
            display: "flex", alignItems: "center", gap: 16,
            opacity: 0, animationDelay: `${i * 55}ms`,
            boxShadow: "var(--shadow-xs)", transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative", overflow: "hidden",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.05em", lineHeight: 1 }}>{counts[role] || 0}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 4 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
        {loading ? <PageLoader /> : users.length === 0 ? (
          <Empty icon="👥" title="No users" action={<Button onClick={() => setModal(true)}>Add User</Button>} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.12s", animation: `fadeIn 0.3s ${i * 25}ms ease both` }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                          background: u.id === me.id ? "var(--accent)" : "var(--bg-hover)",
                          border: u.id === me.id ? "none" : "1px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 900,
                          color: u.id === me.id ? "#fff" : "var(--text-secondary)",
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 7, letterSpacing: "-0.02em" }}>
                            {u.name}
                            {u.id === me.id && (
                              <span style={{ fontSize: 9.5, color: "var(--accent)", background: "var(--accent-subtle)", padding: "2px 7px", borderRadius: 4, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>You</span>
                            )}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 1 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      {u.id !== me.id ? (
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{
                          background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                          borderRadius: 8, padding: "6px 10px", color: "var(--text-primary)",
                          fontSize: 12.5, cursor: "pointer", outline: "none", fontFamily: "var(--font-display)", fontWeight: 600,
                        }}>
                          <option value="admin">Admin</option>
                          <option value="analyst">Analyst</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : <Badge type={u.role}>{u.role}</Badge>}
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      <Badge type={u.status}>{u.status}</Badge>
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 400 }}>{formatDate(u.created_at)}</span>
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      {u.id !== me.id && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Button variant={u.status === "active" ? "danger" : "success"} size="sm" onClick={() => toggleStatus(u.id, u.status === "active" ? "inactive" : "active")}>
                            {u.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>Delete</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New User">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" required minLength={2} />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" required />
          <Input label="Password *" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} />
          <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="viewer">Viewer</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </Select>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
            <Button variant="ghost" onClick={() => setModal(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create User"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
