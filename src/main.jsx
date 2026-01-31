import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ProductosProvider } from "./context/ProductosContext";
import { PublicCartProvider } from "./context/PublicCartContext";
import { MesaProvider } from "./context/MesaContext"; // <- importamos

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MesaProvider>
      {" "}
      {/* Primero el provider de mesas */}
      <PublicCartProvider>
        {" "}
        {/* Después el carrito */}
        <ProductosProvider>
          <App />
        </ProductosProvider>
      </PublicCartProvider>
    </MesaProvider>
  </React.StrictMode>,
);
