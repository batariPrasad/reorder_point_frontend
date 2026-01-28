import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import UploadPage from "./pages/UploadPage";
import ReorderTable from "./pages/ReorderTable";

const App = () => {
  const toast = useRef(null); // 🔹 Global toast

  return (
    <>
      {/* Global Toast */}
      <Toast ref={toast} />

      <UploadPage toast={toast} />
      <hr />
      <ReorderTable toast={toast} />
    </>
  );
};

export default App;
