import React, { useState } from "react";
import { skuDescMap, allowedSkus } from "./ReorderDashboard";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

const getSkuImage = (sku) => `/images/${sku}.jpg`;

export default function ReorderCards({ data }) {
  const [selectedSku, setSelectedSku] = useState(null);

  return (
    <>
      <div className="row g-3">
        {data.map((r) => (
          <div key={r.sku_code} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className="card h-100 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedSku(r)}
            >
              <img
                src={getSkuImage(r.sku_code)}
                className="card-img-top"
                style={{ height: "150px", objectFit: "contain" }}
                onError={(e) => (e.target.src = "/images/default.jpg")}
              />
              <div className="card-body text-center">
                <h6>{skuDescMap[r.sku_code]}</h6>
                <p className="mb-1"><b>Stock:</b> {r.current_stock}</p>
                <p className="mb-0">
                  <b>Days:</b>{" "}
                  <span className={
                    r.number_of_days < 30 ? "text-danger" :
                    r.number_of_days < 45 ? "text-warning" : "text-success"
                  }>
                    {r.number_of_days}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 SKU Dialog */}
      <Dialog
        header={`SKU Details - ${selectedSku?.sku_code}`}
        visible={!!selectedSku}
        modal
        className="sku-dialog"
        onHide={() => setSelectedSku(null)}
      >
        {selectedSku && (
          <>
            <img
              src={getSkuImage(selectedSku.sku_code)}
              onError={(e) => (e.target.src = "/images/default.jpg")}
              className="sku-dialog-image"
            />
            <div className="sku-dialog-content">
              <p><b>Product:</b> {skuDescMap[selectedSku.sku_code]}</p>
              <p><b>Stock:</b> {selectedSku.current_stock}</p>
              <p><b>Avg Daily Sales:</b> {selectedSku.avg_daily_sales}</p>
              <p><b>Reorder Point:</b> {selectedSku.reorder_point}</p>
              <p><b>Suggested Qty:</b> {selectedSku.suggested_reorder_qty}</p>
            </div>
            <Button label="Close" onClick={() => setSelectedSku(null)} className="mt-2" />
          </>
        )}
      </Dialog>
    </>
  );
}
