import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { uploadFile } from "../api/uploadApi";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const toast = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async (type) => {
    if (!file) {
      toast.current.show({
        severity: "warn",
        summary: "File Required",
        detail: "Please select a file to upload",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const result = await uploadFile(type, file);

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: result.message || "File uploaded successfully",
        life: 5000,
      });

      // Reset
      setFile(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: err?.response?.data?.message || "Something went wrong",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />

      <div className="upload-container fade-in">
        <div className="upload-header">
          <h3>📤 File Upload</h3>
          <p className="text-muted">Upload order files or inventory data</p>
        </div>

        {/* Upload Area */}
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".xlsx,.xls,.csv"
          />

          <div className="upload-icon">
            <i className="pi pi-cloud-upload"></i>
          </div>

          <div className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <small className="text-muted">
            Excel files (.xlsx, .xls) or CSV files
          </small>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="file-info fade-in">
            <div className="file-info-text">
              <i className="pi pi-file-excel" style={{ fontSize: '1.5rem', color: '#10b981' }}></i>
              <div>
                <div style={{ fontWeight: '600' }}>{file.name}</div>
                <small className="text-muted">{formatFileSize(file.size)}</small>
              </div>
            </div>
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              onClick={handleClearFile}
              disabled={loading}
            />
          </div>
        )}

        {/* Upload Actions */}
        <div className="upload-actions">
          <Button
            label={loading ? "Uploading..." : "Upload as Orders"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
            onClick={() => handleUpload("orders")}
            loading={loading}
            disabled={!file || loading}
            severity="info"
            size="large"
          />

          <Button
            label={loading ? "Uploading..." : "Upload as Inventory"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
            onClick={() => handleUpload("inventory")}
            loading={loading}
            disabled={!file || loading}
            severity="success"
            size="large"
          />
        </div>

        {/* Instructions */}
        <Card className="mt-4" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <h5 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
            <i className="pi pi-info-circle me-2" style={{ color: '#3b82f6' }}></i>
            Upload Instructions
          </h5>
          <ul style={{ marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li className="mb-2">
              <strong>Orders:</strong> Upload order data to sync with the system
            </li>
            <li className="mb-2">
              <strong>Inventory:</strong> Upload current stock levels for all SKUs
            </li>
            <li className="mb-2">
              Supported formats: Excel (.xlsx, .xls) and CSV files
            </li>
            <li>
              Maximum file size: 10 MB
            </li>
          </ul>
        </Card>

        {/* Recent Uploads (Optional - you can add this feature) */}
        {/* <Card className="mt-3">
          <h5 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
            Recent Uploads
          </h5>
          <small className="text-muted">No recent uploads</small>
        </Card> */}
      </div>
    </div>
  );
};

export default UploadPage;
