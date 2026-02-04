import React, { useState, useEffect, useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchReorder } from "../api/reorderApi";
import { allowedSkus, skuDescMap } from "./ReorderDashboard";
import { Dropdown } from "primereact/dropdown";

export default function ReorderTablePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState("WH3");
  const [poRequiredOnly, setPoRequiredOnly] = useState(false);
  const [below45DaysOnly, setBelow45DaysOnly] = useState(false);

  const warehouses = [
    { label: "Bangalore Warehouse", value: "WH3" },
    { label: "Pinjore Warehouse", value: "WH4" },
  ];

  // 🔹 Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchReorder(warehouse);
      const sorted = (res?.data || []).sort((a, b) => a.number_of_days - b.number_of_days);
      setData(sorted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouse]);

  // 🔹 Filtered table data
  const tableData = useMemo(() => {
    let result = [...(data || [])].filter(r => allowedSkus.includes(r.sku_code));
    if (poRequiredOnly) result = result.filter(r => r.suggested_reorder_qty > 0);
    if (below45DaysOnly) result = result.filter(r => r.number_of_days < 45);
    return result;
  }, [data, poRequiredOnly, below45DaysOnly]);

  const daysBody = (row) => {
    const severity =
      row.number_of_days < 30 ? "danger" : row.number_of_days < 45 ? "warning" : "success";
    return <Tag value={`${row.number_of_days} Days`} severity={severity} />;
  };

  const poBody = (row) =>
    row.suggested_reorder_qty > 0 ? <Tag value="YES" severity="danger" /> : <Tag value="NO" severity="success" />;

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      tableData.map(r => ({
        SKU: r.sku_code,
        Product: skuDescMap[r.sku_code],
        Daily_Avg :r.avg_daily_sales,
        Stock: r.current_stock,
        Days: r.number_of_days,
        SuggestedQty: r.suggested_reorder_qty,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Reorder");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "reorder_list.xlsx");
  };

  return (
    <Card className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="m-0">📊 Reorder Table</h4>

        <div className="d-flex gap-2">
          <Dropdown
            value={warehouse}
            options={warehouses}
            onChange={(e) => setWarehouse(e.value)}
          />

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
          <Button icon="pi pi-file-excel" severity="success" outlined size="small" onClick={exportExcel} />
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
  );
}
