import React from "react";
import { Button } from "primereact/button";
import { importUsersFromExcel } from "../utils/ExcelUtils";
import { createUser } from "../api_s/UserServices";

export default function UserImport({ onComplete, toast }) {

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const users = await importUsersFromExcel(file);
    console.log("Excel data:", users);

    for (const user of users) {
      if (user.name && user.email) {
        try {
          await createUser({ name: user.name, email: user.email });
        } catch (err) {
          console.error("Duplicate or invalid user:", user.email);
        }
      }
    }

    toast.current.show({
      severity: "success",
      summary: "Imported",
      detail: `${users.length} users processed`
    });

    onComplete();
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls"
        hidden
        id="excelUpload"
        onChange={handleImport}
      />
      <Button
        label="Import Excel"
        icon="pi pi-upload"
        className="p-button-success mr-2"
        onClick={() => document.getElementById("excelUpload").click()}
      />
    </>
  );
}
