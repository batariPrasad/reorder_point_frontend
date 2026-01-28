import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

export default function UserList({ users, onEdit, onDelete }) {

  const actionTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-info mr-2"
        onClick={() => onEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-danger"
        onClick={() => onDelete(rowData.id)}
      />
    </>
  );

  return (
    <DataTable value={users} paginator rows={5} responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column field="name" header="Name" />
      <Column field="email" header="Email" />
      <Column header="Actions" body={actionTemplate} />
    </DataTable>
  );
}
