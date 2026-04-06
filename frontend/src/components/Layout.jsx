import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{
        marginLeft: "var(--nav-width)",
        flex: 1,
        minHeight: "100vh",
        background: "var(--bg-base)",
        padding: "32px 36px",
        overflowY: "auto",
      }}>
        <Outlet />
      </main>
    </div>
  );
}
