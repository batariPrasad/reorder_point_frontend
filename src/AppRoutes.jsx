import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

import UploadPage from "./pages/UploadPage";
import ReorderTable from "./pages/ReorderTable";
import ReorderDashboard from "./pages/ReorderDashboard";

const VendorManagement = () => <h3>Vendor Management</h3>;
const PurchaseRequests = () => <h3>Purchase Requests</h3>;
const Invoices = () => <h3>Invoices</h3>;
const PdfTracking = () => <h3>PDF Tracking</h3>;

export default function AppRoutes({ toast }) {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* 🔥 FORCE DEFAULT */}
        <Route path="/" element={<Navigate to="/reorder" replace />} />

        <Route path="/reorder" element={<ReorderDashboard toast={toast} />} />
        <Route path="/upload" element={<UploadPage toast={toast} />} />
        <Route path="/reorderTable" element={<ReorderTable toast={toast} />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/purchase" element={<PurchaseRequests />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/pdf" element={<PdfTracking />} />
      </Route>
    </Routes>
  );
}