import React from "react";
import TopNavbar from "./TopNavbar";

export default function AppLayout({ children }) {
  return (
    <>
      <TopNavbar />
      <div className="container-fluid" style={{ paddingTop: "70px" }}>
        {children}
      </div>
    </>
  );
}
