import React from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";
import "./sidebar.css"

export default function SideBar() {
  const navigate = useNavigate();

  const items = [
    {
    //   label: "Dashboard",
      icon: "pi pi-home",
      command: () => navigate("/reorder"),
    },
    {
    //   label: "Vendor Management",
      icon: "pi pi-users",
      command: () => navigate("/vendors"),
    },
    {
    //   label: "Purchase Requests",
      icon: "pi pi-shopping-cart",
      command: () => navigate("/purchase"),
    },
    {
    //   label: "Invoices",
      icon: "pi pi-file",
      command: () => navigate("/invoices"),
    },
    {
    //   label: "PDF Tracking",
      icon: "pi pi-file-pdf",
      command: () => navigate("/pdf"),
    },
  ];

  return (
    <div className="h-full p-2">
      <PanelMenu model={items} className="w-full" />
    </div>
  );
}
