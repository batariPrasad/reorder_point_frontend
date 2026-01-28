import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import axios from "axios";
import { exportExcel } from "../utils/AvgExcelUtils";

export default function SkuPivotPage() {
  const [pivotData, setPivotData] = useState([]);
  const [dates, setDates] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/pivot/sku-date",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Pivot Data:", res.data);

      // Update state so DataTable renders
      setPivotData(res.data.data || []);
      // Filter out null or undefined dates
      setDates((res.data.dates || []).filter((d) => d != null));
    } catch (err) {
      console.error("Upload Error:", err);
    }
  };

  const exportPivot = () => {
    const rows = pivotData.map((r) => {
      const row = { "SKU Code": r.skuCode };
      dates.forEach((d) => (row[d] = r.counts[d] || ""));
      row["Grand Total"] = r.total;
      row["Average"] = r.average.toFixed(2);
      return row;
    });
    exportExcel(rows);
  };

  return (
    <div className="p-4">
      <h2>SKU Date Pivot (Excel Replacement)</h2>

      <input type="file" accept=".xlsx,.xls" onChange={handleUpload} />

      <Button
        label="Export Pivot"
        icon="pi pi-download"
        className="ml-2"
        onClick={exportPivot}
      />

      <DataTable value={pivotData} scrollable className="mt-4">
        <Column field="skuCode" header="SKU Code" frozen />

        {dates.map((d) => (
          <Column key={d} header={d} body={(row) => row.counts[d] || ""} />
        ))}

        <Column field="total" header="Grand Total" />
        <Column header="Average" body={(row) => row.average.toFixed(2)} />
      </DataTable>
    </div>
  );
}
