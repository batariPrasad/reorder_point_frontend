import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { uploadFile } from "../api/uploadApi";

const UploadPage = ({ toast }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ REQUIRED
  const fileRef = useRef(null);

  const handleUpload = async (type) => {
    if (!file) {
      toast.current.show({
        severity: "warn",
        summary: "File Required",
        detail: "Please select a file",
      });
      return;
    }

    try {
      setLoading(true); // ✅ NOW DEFINED

      const result = await uploadFile(type, file);

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: result.message || "File uploaded successfully",
      });

      setFile(null);
      fileRef.current.value = "";
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: err?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false); // ✅ NOW DEFINED
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileRef}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <Button
        label={loading ? "Uploading..." : "Upload"}
        onClick={() => handleUpload("orders")}
        loading={loading}
      />
    </div>
  );
};

export default UploadPage;
