import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import './index.css';

const container = document.getElementById("root");
const root = createRoot(container); // only once
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
