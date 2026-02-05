import React, { useState } from "react";
import { skuDescMap, allowedSkus } from "./ReorderDashboard";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

const getSkuImage = (sku) => `/images/${sku}.jpg`;

export default function ReorderCards({ data }) {
  const [selectedSku, setSelectedSku] = useState(null);

  const getDaysSeverity = (days) => {
    if (days < 30) return { severity: "danger", label: "Critical", color: "#ef4444" };
    if (days < 45) return { severity: "warning", label: "Warning", color: "#f59e0b" };
    return { severity: "success", label: "Good", color: "#10b981" };
  };

  return (
    <>
      <div className="reorder-card-grid fade-in">
        {data.map((r) => {
          const dayInfo = getDaysSeverity(r.number_of_days);
          
          return (
            <div
              key={r.sku_code}
              className="reorder-card"
              onClick={() => setSelectedSku(r)}
            >
              {/* Product Image */}
              <img
                src={getSkuImage(r.sku_code)}
                className="reorder-card-image"
                alt={skuDescMap[r.sku_code]}
                onError={(e) => (e.target.src = "/images/default.jpg")}
              />

              {/* Card Body */}
              <div className="reorder-card-body">
                {/* Product Title */}
                <h6 className="reorder-card-title">
                  {skuDescMap[r.sku_code] || r.sku_code}
                </h6>

                {/* SKU Code Badge */}
                <div className="mb-3">
                  <Tag 
                    value={r.sku_code} 
                    severity="info" 
                    style={{ fontSize: '0.75rem' }}
                  />
                </div>

                {/* Stats Grid */}
                <div className="reorder-card-stats">
                  {/* Current Stock */}
                  <div className="stat-box">
                    <div className="stat-box-label">Stock</div>
                    <div className="stat-box-value">{r.current_stock}</div>
                  </div>

                  {/* Days Remaining */}
                  <div className="stat-box">
                    <div className="stat-box-label">Days</div>
                    <div className={`stat-box-value ${dayInfo.severity === 'danger' ? 'critical' : dayInfo.severity === 'warning' ? 'warning' : 'good'}`}>
                      {r.number_of_days}
                    </div>
                  </div>

                  {/* Average Daily Sales */}
                  <div className="stat-box">
                    <div className="stat-box-label">Avg Sales</div>
                    <div className="stat-box-value">{r.avg_daily_sales?.toFixed(1) || '0'}</div>
                  </div>

                  {/* Suggested Reorder */}
                  <div className="stat-box">
                    <div className="stat-box-label">Reorder</div>
                    <div className={`stat-box-value ${r.suggested_reorder_qty > 0 ? 'critical' : 'good'}`}>
                      {r.suggested_reorder_qty || 0}
                    </div>
                  </div>
                </div>

                {/* Status Tag */}
                {r.suggested_reorder_qty > 0 && (
                  <div className="mt-3 text-center">
                    <Tag 
                      value="PO REQUIRED" 
                      severity="danger" 
                      icon="pi pi-exclamation-triangle"
                      style={{ width: '100%', justifyContent: 'center' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SKU Details Dialog */}
      <Dialog
        header={
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {skuDescMap[selectedSku?.sku_code]}
            </div>
            <Tag value={selectedSku?.sku_code} severity="info" />
          </div>
        }
        visible={!!selectedSku}
        modal
        className="sku-dialog"
        onHide={() => setSelectedSku(null)}
        dismissableMask
      >
        {selectedSku && (
          <div>
            {/* Product Image */}
            <img
              src={getSkuImage(selectedSku.sku_code)}
              onError={(e) => (e.target.src = "/images/default.jpg")}
              className="sku-dialog-image"
              alt={skuDescMap[selectedSku.sku_code]}
            />

            {/* Product Details */}
            <div className="sku-dialog-content">
              <p>
                <b>Current Stock</b>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  {selectedSku.current_stock}
                </span>
              </p>
              
              <p>
                <b>Average Daily Sales</b>
                <span>{selectedSku.avg_daily_sales?.toFixed(2) || '0.00'}</span>
              </p>
              
              <p>
                <b>Days Until Stockout</b>
                <span>
                  <Tag 
                    value={`${selectedSku.number_of_days} Days`}
                    severity={getDaysSeverity(selectedSku.number_of_days).severity}
                  />
                </span>
              </p>
              
              <p>
                <b>Reorder Point</b>
                <span>{selectedSku.reorder_point}</span>
              </p>
              
              <p>
                <b>Suggested Reorder Qty</b>
                <span style={{ 
                  fontWeight: '700', 
                  fontSize: '1.1rem',
                  color: selectedSku.suggested_reorder_qty > 0 ? '#ef4444' : '#10b981'
                }}>
                  {selectedSku.suggested_reorder_qty || 0}
                </span>
              </p>

              {selectedSku.suggested_reorder_qty > 0 && (
                <div className="mt-3 p-3 bg-danger-subtle rounded text-center">
                  <i className="pi pi-exclamation-triangle me-2 text-danger"></i>
                  <strong className="text-danger">Purchase Order Required</strong>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mt-3">
              <Button 
                label="Close" 
                icon="pi pi-times"
                onClick={() => setSelectedSku(null)}
                outlined
                className="flex-1"
              />
              {selectedSku.suggested_reorder_qty > 0 && (
                <Button 
                  label="Create PO" 
                  icon="pi pi-shopping-cart"
                  severity="success"
                  className="flex-1"
                  onClick={() => {
                    // Add your PO creation logic here
                    console.log("Create PO for", selectedSku.sku_code);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
