import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import UserImport from "../components/UserIMport";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../api_s/UserServices";

import { exportUsersToExcel } from "../utils/ExcelUtils";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ name: "", email: "" });
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };

  const openNew = () => {
    setUser({ name: "", email: "" });
    setIsEdit(false);
    setVisible(true);
  };

  const saveUser = async () => {
    if (isEdit) await updateUser(user.id, user);
    else await createUser(user);

    setVisible(false);
    loadUsers();
  };

  const editUser = (data) => {
    setUser(data);
    setIsEdit(true);
    setVisible(true);
  };

  const removeUser = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <h2>User Management</h2>

      <div className="mb-3 flex gap-2">
        <Button
          label="New User"
          icon="pi pi-plus"
          onClick={openNew}
        />

        <Button
          label="Export Excel"
          icon="pi pi-download"
          className="p-button-help"
          onClick={() => exportUsersToExcel(users)}
        />

        <UserImport onComplete={loadUsers} toast={toast} />
      </div>

      <UserList
        users={users}
        onEdit={editUser}
        onDelete={removeUser}
      />

      <UserForm
        visible={visible}
        user={user}
        isEdit={isEdit}
        onChange={setUser}
        onSave={saveUser}
        onHide={() => setVisible(false)}
      />
    </div>
  );
}
