import React, { useState, useEffect, useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchReorder } from "../api/reorderApi";
import { allowedSkus, skuDescMap } from "./ReorderDashboard";

export default function ReorderTablePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState("WH3");
  const [poRequiredOnly, setPoRequiredOnly] = useState(false);
  const [below45DaysOnly, setBelow45DaysOnly] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const warehouses = [
    { label: "Bangalore Warehouse", value: "WH3" },
    { label: "Pinjore Warehouse", value: "WH4" },
  ];

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchReorder(warehouse);
      const rows = res?.data?.data || [];
      const sorted = rows.sort((a, b) => a.number_of_days - b.number_of_days);
      setData(sorted);
    } catch (err) {
      console.error("Reorder load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouse]);

  // Filtered table data
  const tableData = useMemo(() => {
    let result = [...(data || [])].filter(r => allowedSkus.includes(r.sku_code));
    if (poRequiredOnly) result = result.filter(r => r.suggested_reorder_qty > 0);
    if (below45DaysOnly) result = result.filter(r => r.number_of_days < 45);
    return result;
  }, [data, poRequiredOnly, below45DaysOnly]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: tableData.length,
      critical: tableData.filter(r => r.number_of_days < 30).length,
      warning: tableData.filter(r => r.number_of_days >= 30 && r.number_of_days < 45).length,
      needsPO: tableData.filter(r => r.suggested_reorder_qty > 0).length,
    };
  }, [tableData]);

  // Column templates
  const productBody = (row) => (
    <div>
      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
        {skuDescMap[row.sku_code]}
      </div>
      <Tag value={row.sku_code} severity="info" style={{ fontSize: '0.75rem' }} />
    </div>
  );

  const stockBody = (row) => (
    <div style={{ fontWeight: '600', fontSize: '1rem' }}>
      {row.current_stock}
    </div>
  );

  const avgSalesBody = (row) => (
    <div>{row.avg_daily_sales?.toFixed(1) || '0.0'}</div>
  );

  const daysBody = (row) => {
    const severity =
      row.number_of_days < 30 ? "danger" : row.number_of_days < 45 ? "warning" : "success";
    return (
      <Tag 
        value={`${row.number_of_days} Days`} 
        severity={severity}
        icon={row.number_of_days < 30 ? "pi pi-exclamation-triangle" : undefined}
      />
    );
  };

  const reorderPointBody = (row) => (
    <div style={{ color: '#6b7280' }}>{row.reorder_point}</div>
  );

  const suggestedQtyBody = (row) => (
    <div style={{ 
      fontWeight: '700', 
      fontSize: '1.1rem',
      color: row.suggested_reorder_qty > 0 ? '#ef4444' : '#10b981'
    }}>
      {row.suggested_reorder_qty || 0}
    </div>
  );

  const poBody = (row) =>
    row.suggested_reorder_qty > 0 ? (
      <Tag value="YES" severity="danger" icon="pi pi-shopping-cart" />
    ) : (
      <Tag value="NO" severity="success" icon="pi pi-check" />
    );

  // Export to Excel
  const exportExcel = () => {
    const exportData = tableData.map(r => ({
      SKU: r.sku_code,
      Product: skuDescMap[r.sku_code],
      'Current Stock': r.current_stock,
      'Daily Avg Sales': r.avg_daily_sales?.toFixed(2),
      'Days Until Stockout': r.number_of_days,
      'Reorder Point': r.reorder_point,
      'Suggested Qty': r.suggested_reorder_qty,
      'PO Required': r.suggested_reorder_qty > 0 ? 'YES' : 'NO',
    }));

    const sheet = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Reorder");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer]), 
      `reorder_${warehouse}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Header with search
  const header = (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="m-0">📊 Reorder Analysis Table</h4>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            icon="pi pi-file-excel"
            label="Export"
            severity="success"
            outlined
            onClick={exportExcel}
            size="small"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="data-summary" style={{ marginBottom: 0 }}>
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.critical}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.warning}</div>
          <div className="stat-label">Warning</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.needsPO}</div>
          <div className="stat-label">Needs PO</div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <Dropdown
          value={warehouse}
          options={warehouses}
          onChange={(e) => setWarehouse(e.value)}
          placeholder="Select Warehouse"
        />

        <InputText
          placeholder="🔍 Search table..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ minWidth: '200px' }}
        />

        <Button
          label={poRequiredOnly ? "All SKUs" : "PO Required Only"}
          icon={poRequiredOnly ? "pi pi-filter-slash" : "pi pi-filter"}
          severity="warning"
          outlined={!poRequiredOnly}
          size="small"
          onClick={() => setPoRequiredOnly(!poRequiredOnly)}
        />

        <Button
          label={below45DaysOnly ? "All Days" : "Below 45 Days"}
          icon={below45DaysOnly ? "pi pi-filter-slash" : "pi pi-filter"}
          severity="danger"
          outlined={!below45DaysOnly}
          size="small"
          onClick={() => setBelow45DaysOnly(!below45DaysOnly)}
        />
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <Card className="fade-in" style={{ marginTop: '1rem' }}>
        <DataTable
          value={tableData}
          paginator
          rows={15}
          rowsPerPageOptions={[10, 15, 25, 50]}
          responsiveLayout="scroll"
          loading={loading}
          emptyMessage="No products found for the selected filters"
          header={header}
          globalFilter={globalFilter}
          stripedRows
          showGridlines
          size="normal"
        >
          <Column 
            header="Product" 
            body={productBody} 
            sortable 
            sortField="sku_code"
            style={{ minWidth: '250px' }}
          />
          
          <Column 
            field="current_stock" 
            header="Stock" 
            body={stockBody}
            sortable
            style={{ minWidth: '100px' }}
          />
          
          <Column 
            field="avg_daily_sales" 
            header="Avg Sales/Day" 
            body={avgSalesBody}
            sortable
            style={{ minWidth: '120px' }}
          />
          
          <Column 
            field="number_of_days" 
            header="Days Remaining" 
            body={daysBody} 
            sortable
            style={{ minWidth: '150px' }}
          />
          
          <Column 
            field="reorder_point" 
            header="Reorder Point" 
            body={reorderPointBody}
            sortable
            style={{ minWidth: '130px' }}
          />
          
          <Column 
            field="suggested_reorder_qty" 
            header="Suggested Qty" 
            body={suggestedQtyBody}
            sortable
            style={{ minWidth: '130px' }}
          />
          
          <Column 
            header="PO Required" 
            body={poBody}
            style={{ minWidth: '120px' }}
          />
        </DataTable>
      </Card>
    </div>
  );
}
