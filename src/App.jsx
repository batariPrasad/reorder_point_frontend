import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import AppRoutes from "./AppRoutes";

export default function App() {
  const toast = useRef(null);

  return (
    <>
      <Toast ref={toast} />
      <AppRoutes toast={toast} />
    </>
  );
}