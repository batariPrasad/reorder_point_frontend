import React, { useEffect, useMemo, useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  syncInventory,
  syncOrders,
  generateReorder,
  fetchReorder,
} from "../api/reorderApi";

/* 🔹 Allowed SKUs */
const allowedSkus = [
  "1001033","1001049","1001062","1001007","1001059","1001003",
  "1001057","1001041-A","1001058","1001071","1001070","1001035",
  "1001008","1001048","1001010","1001018","1001013","1001017",
  "ACC-01","ACC-02","ACC-03","ACC-04"
];

/* 🔹 SKU → Description */
const skuDescMap = {
  "1001033": "Pokonut stretch mark cream",
  "1001049": "Dark patch reducer cream",
  "1001062": "Dark Spot removal cream",
  "1001007": "Natural beauty face cream",
  "1001059": "Foot cream",
  "1001003": "Sunscreen Cream",
  "1001057": "Sunscreen Lotion",
  "1001041-A": "Kumkumadi oil",
  "1001058": "Kumkumadi face wash",
  "1001071": "Vita-c face serum",
  "1001070": "Hair growth serum",
  "1001035": "Pokonut stretch mark roll",
  "1001008": "Skin shine Soap-100g",
  "1001048": "Charcoal Detox Soap (100g)",
  "1001010": "Anti Blemish Soap-100gm",
  "1001018": "Golden Glow Soap",
  "1001013": "Anti acne soap",
  "1001017": "D-tan soap",
  "ACC-01": "Derma Roller",
  "ACC-02": "Ice Roller",
  "ACC-03": "Pumice Stone",
  "ACC-04": "Comb",
};

const getSkuImage = (sku) => `/images/${sku}.jpg`;

export default function ReorderDashboard() {
  const toast = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSku, setSelectedSku] = useState(null);

  const [search, setSearch] = useState("");
  const [top10Only, setTop10Only] = useState(false);

  const [warehouse, setWarehouse] = useState("WH3");

  /* 🔹 TABLE ONLY FILTERS */
  const [poRequiredOnly, setPoRequiredOnly] = useState(false);
  const [below45DaysOnly, setBelow45DaysOnly] = useState(false);

  const warehouses = [
    { label: "Bangalore Warehouse", value: "WH3" },
    { label: "Pinjore Warehouse", value: "WH4" },
  ];

  /* 🔹 Load Warehouse Data */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchReorder(warehouse);
      const sorted = (res?.data || []).sort(
        (a, b) => a.number_of_days - b.number_of_days
      );
      setData(sorted);
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 Reset table filters on warehouse change */
  useEffect(() => {
    loadData();
    setPoRequiredOnly(false);
    setBelow45DaysOnly(false);
  }, [warehouse]);

  /* 🔹 Cards Data (Warehouse + Search + Top10) */
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
      result = result.filter((r) => r.number_of_days < 30).slice(0, 10);
    }

    return result;
  }, [data, search, top10Only]);

  /* 🔹 TABLE DATA (Warehouse + Table Filters ONLY) */
  const tableData = useMemo(() => {
    let result = [...visibleData];

    if (poRequiredOnly) {
      result = result.filter((r) => r.suggested_reorder_qty > 0);
    }

    if (below45DaysOnly) {
      result = result.filter((r) => r.number_of_days < 45);
    }

    return result;
  }, [visibleData, poRequiredOnly, below45DaysOnly]);

  /* 🔹 Table UI Helpers */
  const daysBody = (row) => {
    const severity =
      row.number_of_days < 30
        ? "danger"
        : row.number_of_days < 45
        ? "warning"
        : "success";

    return <Tag value={`${row.number_of_days} Days`} severity={severity} />;
  };

  const poBody = (row) =>
    row.suggested_reorder_qty > 0 ? (
      <Tag value="YES" severity="danger" />
    ) : (
      <Tag value="NO" severity="success" />
    );

  /* 🔹 Excel Export (TABLE DATA ONLY) */
  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      tableData.map((r) => ({
        SKU: r.sku_code,
        Product: skuDescMap[r.sku_code],
        Stock: r.current_stock,
        Average_Daily_sales :r.avg_daily_sales,
        Days: r.number_of_days,
        ReorderPoint: r.reorder_point,
        SuggestedQty: r.suggested_reorder_qty,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Reorder");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "reorder_list.xlsx");
  };

  return (
    <div className="p-3">
      <Toast ref={toast} />

      <h3 className="mb-3">📦 Reorder Dashboard</h3>

      {/* 🔹 GLOBAL CONTROLS */}
      <div className="flex flex-wrap gap-2 mb-3">
  <Button
    label="Sync Inventory"
    onClick={async () => {
      try {
        setLoading(true);
        await syncInventory(); // call API
        await loadData(); // reload dashboard data

        toast.current.show({
          severity: "success",
          summary: "Inventory Synced",
          detail: "Inventory sync completed successfully",
          life: 3000,
        });
      } catch (err) {
        console.error(err);
        toast.current.show({
          severity: "error",
          summary: "Sync Failed",
          detail: err?.response?.data?.message || "Something went wrong",
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    }}
  />

  <Button
    label="Sync Orders"
    onClick={async () => {
      try {
        setLoading(true);
        await syncOrders();
        await loadData();

        toast.current.show({
          severity: "success",
          summary: "Orders Synced",
          detail: "Orders sync completed successfully",
          life: 3000,
        });
      } catch (err) {
        console.error(err);
        toast.current.show({
          severity: "error",
          summary: "Sync Failed",
          detail: err?.response?.data?.message || "Something went wrong",
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    }}
  />

  <Button
    label="Generate Reorder"
    onClick={async () => {
      try {
        setLoading(true);
        await generateReorder();
        await loadData();

        toast.current.show({
          severity: "success",
          summary: "Reorder Generated",
          detail: "Reorder generation completed successfully",
          life: 3000,
        });
      } catch (err) {
        console.error(err);
        toast.current.show({
          severity: "error",
          summary: "Generation Failed",
          detail: err?.response?.data?.message || "Something went wrong",
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    }}
  />

  <Button icon="pi pi-file-excel" severity="success" onClick={exportExcel} />

  <Dropdown
    value={warehouse}
    options={warehouses}
    onChange={(e) => setWarehouse(e.value)}
    className="w-15rem"
  />

  <span className="p-input-icon-left">
    <i className="pi pi-search" />
    <InputText
      placeholder="Search SKU / Product"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </span>

  <Button
    label={top10Only ? "Show All" : "Top 10 Critical"}
    severity="danger"
    outlined
    onClick={() => setTop10Only(!top10Only)}
  />
</div>


      {/* 🔹 CARDS */}
      <div className="grid">
        {visibleData.map((r) => (
          <div key={r.sku_code} className="col-12 sm:col-6 md:col-4 lg:col-3">
            <Card onClick={() => setSelectedSku(r)}>
              <img
                src={getSkuImage(r.sku_code)}
                onError={(e) => (e.target.src = "/images/default.jpg")}
                className="sku-image"
              />
          
              <div className="sku-desc">{skuDescMap[r.sku_code]}</div>
             




              <div className="sku-days"> Stock: <b>{r.current_stock}</b> <br /> Number of Days: <b>{r.number_of_days}</b> </div>
            </Card>
          </div>
        ))}
      </div>

      {/* 🔹 TABLE (FILTERS ABOVE TABLE ONLY) */}
      <Card className="mt-4">
        <div className="flex justify-content-between align-items-center mb-2">
          <h4 className="m-0">📊 Reorder Table</h4>

          <div className="flex gap-2">
            <Button
              label={poRequiredOnly ? "All SKUs" : "PO Required"}
              severity="warning"
              outlined
              size="small"
              onClick={() => setPoRequiredOnly(!poRequiredOnly)}
            />
            <Button
              label={below45DaysOnly ? "All SKUs" : "Below 45 Days"}
              severity="danger"
              outlined
              size="small"
              onClick={() => setBelow45DaysOnly(!below45DaysOnly)}
            />
          </div>
        </div>

        <DataTable
          value={tableData}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 50]}
          responsiveLayout="scroll"
          loading={loading}
          emptyMessage="No data for selected warehouse"
          onRowClick={(e) => setSelectedSku(e.data)}
        >
          <Column field="sku_code" header="SKU" sortable />
          <Column header="Product" body={(r) => skuDescMap[r.sku_code]} />
          <Column field="current_stock" header="Stock" sortable />
          <Column field="avg_daily_sales" header="Avg Sales" sortable />
          <Column header="Days" body={daysBody} sortable />
          <Column field="reorder_point" header="Reorder Point" />
          <Column field="suggested_reorder_qty" header="Suggested Qty" />
          <Column header="PO Required" body={poBody} />
        </DataTable>
      </Card>

      {/* 🔹 PRIME REACT DIALOG */}
      <Dialog
        header={`SKU Details - ${selectedSku?.sku_code}`}
        visible={!!selectedSku}
        modal
        style={{ width: "400px" }}
        onHide={() => setSelectedSku(null)}
      >
        {selectedSku && (
          <>
            <img
              src={getSkuImage(selectedSku.sku_code)}
              onError={(e) => (e.target.src = "/images/default.jpg")}
              className="sku-image mb-3"
            />
            <p><b>Product:</b> {skuDescMap[selectedSku.sku_code]}</p>
            <p><b>Stock:</b> {selectedSku.current_stock}</p>
            <p><b>Avg Daily Sales:</b> {selectedSku.avg_daily_sales}</p>
            <p><b>Reorder Point:</b> {selectedSku.reorder_point}</p>
            <p><b>Suggested Qty:</b> {selectedSku.suggested_reorder_qty}</p>
            <Button label="Close" onClick={() => setSelectedSku(null)} />
          </>
        )}
      </Dialog>
    </div>
  );
}
