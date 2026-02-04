import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        {/* Left Logo / Title */}
        <span
          className="navbar-brand fw-bold cursor-pointer"
          onClick={() => navigate("/reorder")}
          style={{ cursor: "pointer" }}
        >
          Reorder System
        </span>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/reorder">
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/reorderTable">
                Reorder Table
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/upload">
                Upload File
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/vendors">
                Vendors
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/purchase">
                Purchase
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/invoices">
                Invoices
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/pdf">
                PDF Tracking
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
