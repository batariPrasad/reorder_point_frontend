import React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function UserForm({
  visible,
  user,
  isEdit,
  onChange,
  onSave,
  onHide
}) {
  return (
    <Dialog
      header={isEdit ? "Edit User" : "New User"}
      visible={visible}
      style={{ width: "400px" }}
      modal
      onHide={onHide}
    >
      <div className="field mb-3">
        <label>Name</label>
        <InputText
          value={user.name}
          onChange={(e) => onChange({ ...user, name: e.target.value })}
          className="w-full"
        />
      </div>

      <div className="field mb-3">
        <label>Email</label>
        <InputText
          value={user.email}
          onChange={(e) => onChange({ ...user, email: e.target.value })}
          className="w-full"
        />
      </div>

      <Button label="Save" icon="pi pi-check" onClick={onSave} />
    </Dialog>
  );
}
