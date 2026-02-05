import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleNavbar = () => setIsExpanded(!isExpanded);
  const closeNavbar = () => setIsExpanded(false);

  const navLinks = [
    { to: "/reorder", label: "Dashboard", icon: "pi pi-chart-bar" },
    { to: "/reorderTable", label: "Table View", icon: "pi pi-table" },
    { to: "/upload", label: "Upload", icon: "pi pi-upload" },
    { to: "/vendors", label: "Vendors", icon: "pi pi-users" },
    { to: "/purchase", label: "Purchase", icon: "pi pi-shopping-cart" },
    { to: "/invoices", label: "Invoices", icon: "pi pi-file" },
    { to: "/pdf", label: "PDF Tracking", icon: "pi pi-eye" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        {/* Logo / Brand */}
        <span
          className="navbar-brand fw-bold cursor-pointer d-flex align-items-center"
          onClick={() => {
            navigate("/reorder");
            closeNavbar();
          }}
          style={{ cursor: "pointer" }}
        >
          <i className="pi pi-box me-2" style={{ fontSize: '1.5rem' }}></i>
          <span className="d-none d-sm-inline">Reorder System</span>
          <span className="d-inline d-sm-none">RS</span>
        </span>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isExpanded ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink 
                  className="nav-link d-flex align-items-center" 
                  to={link.to}
                  onClick={closeNavbar}
                >
                  <i className={`${link.icon} me-2`}></i>
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
