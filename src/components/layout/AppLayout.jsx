import React from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "./TopNavbar";

export default function AppLayout() {
  return (
    <>
      <TopNavbar />
      <div style={{ paddingTop: "70px" }}>
        <Outlet />
      </div>
    </>
  );
}