import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import "./reorder.css";

import ReorderCards from "./ReorderCard";

import {
  fetchReorder,
  syncInventory,
  syncOrders,
  generateReorder,
  fetchLastInventorySync,
} from "../api/reorderApi";

export const allowedSkus = [
  "1001033","1001049","1001062","1001007","1001059","1001003",
  "1001057","1001041-A","1001058","1001071","1001070","1001035",
  "1001008","1001048","1001010","1001018","1001013","1001017",
  "ACC-01","ACC-02","ACC-03","ACC-04"
];

export const skuDescMap = {
  "1001033":"Pokonut stretch mark cream",
  "1001049":"Dark patch reducer cream",
  "1001062":"Dark Spot removal cream",
  "1001007":"Natural beauty face cream",
  "1001059":"Foot cream",
  "1001003":"Sunscreen Cream",
  "1001057":"Sunscreen Lotion",
  "1001041-A":"Kumkumadi oil",
  "1001058":"Kumkumadi face wash",
  "1001071":"Vita-c face serum",
  "1001070":"Hair growth serum",
  "1001035":"Pokonut stretch mark roll",
  "1001008":"Skin shine Soap-100g",
  "1001048":"Charcoal Detox Soap (100g)",
  "1001010":"Anti Blemish Soap-100gm",
  "1001018":"Golden Glow Soap",
  "1001013":"Anti acne soap",
  "1001017":"D-tan soap",
  "ACC-01":"Derma Roller",
  "ACC-02":"Ice Roller",
  "ACC-03":"Pumice Stone",
  "ACC-04":"Comb",
};

export default function ReorderDashboard() {
  const toast = useRef(null);

  const [data, setData] = useState([]);
  const [warehouse, setWarehouse] = useState("WH3");
  const [search, setSearch] = useState("");
  const [top10Only, setTop10Only] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReorder, setLoadingReorder] = useState(false);
  
  const [syncStatus, setSyncStatus] = useState(null);

  const warehouses = [
    { label: "Bangalore Warehouse", value: "WH3" },
    { label: "Pinjore Warehouse", value: "WH4" },
  ];

  const showSuccess = (msg) =>
    toast.current.show({ severity: "success", summary: "Success", detail: msg, life: 5000 });

  const showError = (msg) =>
    toast.current.show({ severity: "error", summary: "Error", detail: msg, life: 5000 });

  const showInfo = (msg) =>
    toast.current.show({ severity: "info", summary: "Info", detail: msg, life: 5000 });

  const loadData = async () => {
    try {
      const res = await fetchReorder(warehouse);
      const rows = res?.data?.data || [];
      const sorted = rows.sort((a, b) => a.number_of_days - b.number_of_days);
      setData(sorted);
    } catch (err) {
      console.error("Reorder load error:", err);
      showError("Failed to load reorder data");
    }
  };

  useEffect(() => {
    fetchLastInventorySync().then((res) => {
      if (res?.data?.lastSync) {
        setLastUpdated(new Date(res.data.lastSync));
      }
    }).catch(err => {
      console.error("Failed to fetch last sync time:", err);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [warehouse]);

  const handleSyncInventory = async () => {
    setLoadingInventory(true);
    setSyncStatus("Syncing inventory...");
    
    try {
      const res = await syncInventory();
      await loadData();

      setLastUpdated(new Date(res.data.lastSync));

      showSuccess(
        `Inventory Synced | Success: ${res.data.success}, Failed: ${res.data.failed}`
      );
      setSyncStatus(null);
    } catch (err) {
      console.error("Inventory sync error:", err);
      showError(err.response?.data?.message || "Inventory sync failed");
      setSyncStatus(null);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleSyncOrders = async () => {
    setLoadingOrders(true);
    setSyncStatus("Fetching orders from Vinculum API... This may take several minutes for large datasets.");
    
    try {
      const res = await syncOrders();
      
      if (res.data.success) {
        const { pages_processed, inserted, raw_records } = res.data.data || {};
        showSuccess(
          `Orders synced successfully! Processed ${pages_processed} pages, inserted ${inserted} orders (${raw_records} raw records fetched)`
        );
        setSyncStatus(null);
      } else {
        showError(res.data.message || "Orders sync failed");
        setSyncStatus(null);
      }
    } catch (err) {
      console.error("Orders sync error:", err);
      showError(err.response?.data?.message || "Orders sync failed");
      setSyncStatus(null);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGenerateReorder = async () => {
    setLoadingReorder(true);
    setSyncStatus("Generating reorder calculations...");
    
    try {
      await generateReorder();
      await loadData();
      showSuccess("Reorder generated successfully");
      setSyncStatus(null);
    } catch (err) {
      console.error("Generate reorder error:", err);
      showError(err.response?.data?.message || "Failed to generate reorder");
      setSyncStatus(null);
    } finally {
      setLoadingReorder(false);
    }
  };

  const visibleData = useMemo(() => {
    let result = data
      .filter((r) => allowedSkus.includes(r.sku_code))
      .filter(
        (r) =>
          r.sku_code.toLowerCase().includes(search.toLowerCase()) ||
          (skuDescMap[r.sku_code] || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );

    if (top10Only) {
      result = result
        .filter((r) => r.number_of_days < 30)
        .slice(0, 10);
    }

    return result;
  }, [data, search, top10Only]);

  const stats = useMemo(() => {
    const filtered = data.filter((r) => allowedSkus.includes(r.sku_code));
    return {
      total: filtered.length,
      critical: filtered.filter(r => r.number_of_days < 30).length,
      warning: filtered.filter(r => r.number_of_days >= 30 && r.number_of_days < 45).length,
      needsReorder: filtered.filter(r => r.suggested_reorder_qty > 0).length,
    };
  }, [data]);

  const anyLoading = loadingInventory || loadingOrders || loadingReorder;

  return (
    <div className="container-fluid">
      <Toast ref={toast} />

      {/* <div className="dashboard-header fade-in">
        <h4>📦 Reorder Dashboard</h4>
        {lastUpdated && (
          <small>
            Last inventory sync: {lastUpdated.toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </small>
        )}
      </div> */}

      {syncStatus && (
        <div className="sync-status-container fade-in">
          <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
          <small className="text-info d-block mt-2">
            <i className="pi pi-spin pi-spinner me-2"></i>
            {syncStatus}
          </small>
        </div>
      )}

      <div className="control-panel fade-in">
        <div className="d-flex flex-wrap gap-2">
          <Button
            label="Sync Inventory"
            icon="pi pi-refresh"
            loading={loadingInventory}
            onClick={handleSyncInventory}
            disabled={anyLoading}
            className="p-button-primary"
          />

          <Button
            label="Sync Orders"
            icon="pi pi-download"
            loading={loadingOrders}
            onClick={handleSyncOrders}
            disabled={anyLoading}
            severity="info"
          />

          <Button
            label="Generate Reorder"
            icon="pi pi-cog"
            loading={loadingReorder}
            onClick={handleGenerateReorder}
            disabled={anyLoading}
            severity="success"
          />

          <Dropdown
            value={warehouse}
            options={warehouses}
            onChange={(e) => setWarehouse(e.value)}
            disabled={anyLoading}
            placeholder="Select Warehouse"
          />

          <InputText
            placeholder="🔍 Search SKU / Product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '200px' }}
          />

          <Button
            label={top10Only ? "Show All" : "Top 10 Critical"}
            icon={top10Only ? "pi pi-list" : "pi pi-exclamation-triangle"}
            severity={top10Only ? "secondary" : "danger"}
            outlined
            onClick={() => setTop10Only(!top10Only)}
          />
        </div>
      </div>

      <div className="data-summary fade-in">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.critical}</div>
          <div className="stat-label">Critical (&lt;30d)</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.warning}</div>
          <div className="stat-label">Warning (30-45d)</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.needsReorder}</div>
          <div className="stat-label">Needs Reorder</div>
        </div>
      </div>

      <div className="mb-3">
        <small className="text-muted">
          <i className="pi pi-filter me-1"></i>
          Showing <strong>{visibleData.length}</strong> of <strong>{stats.total}</strong> products
          {top10Only && " (Top 10 Critical)"}
          {search && ` matching "${search}"`}
        </small>
      </div>

      {visibleData.length > 0 ? (
        <ReorderCards data={visibleData} />
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No products found</div>
          <div className="empty-state-subtext">
            {search ? "Try adjusting your search criteria" : "No data available for the selected warehouse"}
          </div>
        </div>
      )}
    </div>
  );
}
