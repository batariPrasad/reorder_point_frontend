import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

const App = () => {
  const toast = useRef(null);

  return (
    <BrowserRouter>
      {/* Global Toast */}
      <Toast ref={toast} />

      {/* App with Navbar + Sidebar */}
      <AppRoutes toast={toast} />
    </BrowserRouter>
  );
};

export default App;
