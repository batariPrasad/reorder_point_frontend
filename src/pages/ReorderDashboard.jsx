import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import "./reorder.css";

import ReorderCards from "./ReorderCard";

import {
  fetchReorder,
  syncInventory,
  syncOrders,
  generateReorder,
  fetchLastInventorySync, // ✅ REQUIRED
} from "../api/reorderApi";

/* ===================== SKU CONFIG ===================== */

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

/* ===================== COMPONENT ===================== */

export default function ReorderDashboard() {
  const toast = useRef(null);

  const [data, setData] = useState([]);
  const [warehouse, setWarehouse] = useState("WH3");
  const [search, setSearch] = useState("");
  const [top10Only, setTop10Only] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ✅ ISOLATED LOADERS
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReorder, setLoadingReorder] = useState(false);

  const warehouses = [
    { label: "Bangalore Warehouse", value: "WH3" },
    { label: "Pinjore Warehouse", value: "WH4" },
  ];

  /* ===================== TOAST ===================== */

  const showSuccess = (msg) =>
    toast.current.show({ severity: "success", summary: "Success", detail: msg });

  const showError = (msg) =>
    toast.current.show({ severity: "error", summary: "Error", detail: msg });

  /* ===================== LOAD DATA ===================== */

  const loadData = async () => {
  try {
    const res = await fetchReorder(warehouse);

    const rows = res?.data?.data || [];

    const sorted = rows.sort(
      (a, b) => a.number_of_days - b.number_of_days
    );

    setData(sorted);
  } catch (err) {
    console.error("Reorder load error:", err);
    showError("Failed to load reorder data");
  }
};


  /* ✅ LOAD DATA + LAST INVENTORY SYNC (ON PAGE LOAD) */
  // useEffect(() => {
  //   loadData();

  //   fetchLastInventorySync().then((res) => {
  //     if (res?.data?.lastSync) {
  //       setLastUpdated(new Date(res.data.lastSync));
  //     }
  //   });
  // }, [warehouse]);


  useEffect(() => {
  fetchLastInventorySync().then((res) => {
    if (res?.data?.lastSync) {
      setLastUpdated(new Date(res.data.lastSync));
    }
  });
}, []); // 👈 runs once

useEffect(() => {
  loadData();
}, [warehouse]);

  /* ===================== SYNC HANDLERS ===================== */

 const handleSyncInventory = async () => {
  setLoadingInventory(true);
  try {
    const res = await syncInventory();
    await loadData();

    // ✅ THIS is the ONLY place where timestamp changes
    setLastUpdated(new Date(res.data.lastSync));

    showSuccess(
      `Inventory Synced | Success: ${res.data.success}, Failed: ${res.data.failed}`
    );
  } catch {
    showError("Inventory sync failed");
  } finally {
    setLoadingInventory(false);
  }
};


  const handleSyncOrders = async () => {
    setLoadingOrders(true);
    try {
      await syncOrders();
      showSuccess("Orders synced successfully");
    } catch {
      showError("Orders sync failed");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGenerateReorder = async () => {
    setLoadingReorder(true);
    try {
      await generateReorder();
      await loadData();
      showSuccess("Reorder generated successfully");
    } catch {
      showError("Failed to generate reorder");
    } finally {
      setLoadingReorder(false);
    }
  };

  /* ===================== FILTER ===================== */

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

  /* ===================== UI ===================== */

  return (
    <div className="container-fluid p-3">
      <Toast ref={toast} />

      <h4>📦 Reorder Dashboard</h4>

      {lastUpdated && (
        <small className="text-muted d-block mb-3">
          Inventory last synced at: {lastUpdated.toLocaleString()}
        </small>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Button
          label="Sync Inventory"
          icon="pi pi-refresh"
          loading={loadingInventory}
          onClick={handleSyncInventory}
        />

        <Button
          label="Sync Orders"
          icon="pi pi-refresh"
          loading={loadingOrders}
          onClick={handleSyncOrders}
        />

        <Button
          label="Generate Reorder"
          icon="pi pi-cog"
          loading={loadingReorder}
          onClick={handleGenerateReorder}
        />

        <Dropdown
          value={warehouse}
          options={warehouses}
          onChange={(e) => setWarehouse(e.value)}
        />

        <InputText
          placeholder="Search SKU / Product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          label={top10Only ? "Show All" : "Top 10 Critical"}
          severity="danger"
          outlined
          onClick={() => setTop10Only(!top10Only)}
        />
      </div>

      <ReorderCards data={visibleData} />
    </div>
  );
}
