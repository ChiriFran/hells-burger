import React, { useState, useEffect } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";

import Login from "./components/Login";
import MesasBoard from "./components/MesasBoard";
import CrearMesa from "./components/CrearMesa";
import DashboardEstadisticas from "./components/DashboardEstadisticas";
import Caja from "./components/Caja";
import PedidoModal from "./components/PedidoModal";
import PedidosLista from "./components/PedidosLista";
import LogoutButton from "./components/LogoutButton";
import DescargasFirebase from "./components/DescargasFirebase";

import { useMesasContext } from "./context/MesaContext";
import "./App.css"; // Tus estilos principales

export default function App() {
  const { mesas } = useMesasContext();
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observador de sesión Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Mientras Firebase verifica la sesión
  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
        }}
      >
        Cargando...
      </div>
    );

  // Si no hay usuario logueado, mostramos el login
  if (!user) return <Login onLogin={setUser} />;

  // Usuario logueado → renderizamos el layout completo
  return (
    <div className="app-container">
      <div className="app-main">
        <h1 className="app-title">Hells Admin</h1>
        <MesasBoard setMesaSeleccionada={setMesaSeleccionada} />
        <CrearMesa />
        <PedidosLista />
      </div>

      <div className="app-sidebar">
        <DashboardEstadisticas />
        <Caja />
        <DescargasFirebase />
        <LogoutButton />
      </div>

      {mesaSeleccionada && (
        <PedidoModal
          mesa={mesaSeleccionada}
          cerrarModal={() => setMesaSeleccionada(null)}
        />
      )}
    </div>
  );
}
