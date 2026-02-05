import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import TopNavbar from "./components/layout/TopNavbar";
import ReorderDashboard from "./pages/ReorderDashboard";
// import other pages later

export default function App() {
  return (
    <>
      <TopNavbar />

      {/* Push content below fixed navbar */}
      <div style={{ paddingTop: "70px" }}>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/reorder" />} />

          {/* Pages */}
          <Route path="/reorder" element={<ReorderDashboard />} />
          {/* <Route path="/upload" element={<Upload />} /> */}
          {/* <Route path="/vendors" element={<Vendors />} /> */}
        </Routes>
      </div>
    </>
  );
}