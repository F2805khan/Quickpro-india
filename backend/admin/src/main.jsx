import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "../../../frontend/src/index.css";
import OwnerPanel from "../../../frontend/src/pages/OwnerPanel.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <OwnerPanel />
    </BrowserRouter>
  </React.StrictMode>
);
