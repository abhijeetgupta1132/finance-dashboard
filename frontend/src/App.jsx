import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-base)",
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
          }}
        />
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
            },
            success: {
              iconTheme: {
                primary: "#22d3a5",
                secondary: "var(--bg-elevated)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff5569",
                secondary: "var(--bg-elevated)",
              },
            },
          }}
        />
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="records" element={<Records />} />
            <Route
              path="analytics"
              element={
                <RequireRole roles={["admin", "analyst"]}>
                  <Analytics />
                </RequireRole>
              }
            />
            <Route
              path="users"
              element={
                <RequireRole roles={["admin"]}>
                  <Users />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
