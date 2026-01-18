import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MesaProvider } from "./context/MesaContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MesaProvider>
      <App />
    </MesaProvider>
  </React.StrictMode>
);
