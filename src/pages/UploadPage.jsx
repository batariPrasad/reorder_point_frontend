import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { uploadFile } from "../api/uploadApi";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const toast = useRef(null);

  const handleUpload = async (type) => {
    if (!file) {
      toast.current.show({
        severity: "warn",
        summary: "File Required",
        detail: "Please select a file to upload",
      });
      return;
    }

    try {
      setLoading(true);

      await uploadFile(type, file);

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: `${type.toUpperCase()} uploaded successfully`,
        life: 3000,
      });

      // ✅ reset file input
      setFile(null);
      fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: err?.response?.data?.error || "Something went wrong",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <Card title="📤 Upload Vinculum Files" className="w-30rem">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />

        <div className="flex gap-2">
          <Button
            label="Upload Orders"
            icon="pi pi-upload"
            onClick={() => handleUpload("orders")}
            disabled={loading}
          />

          <Button
            label="Upload Inventory"
            icon="pi pi-upload"
            severity="secondary"
            onClick={() => handleUpload("inventory")}
            disabled={loading}
          />
        </div>

        {loading && (
          <div className="flex justify-content-center mt-3">
            <ProgressSpinner style={{ width: "40px", height: "40px" }} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadPage;
