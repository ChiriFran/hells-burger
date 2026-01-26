import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProductosProvider } from "./context/ProductosContext";
import { MesaProvider } from "./context/MesaContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProductosProvider >
      <MesaProvider>
        <App />
      </MesaProvider>
    </ProductosProvider>
  </React.StrictMode>
);
