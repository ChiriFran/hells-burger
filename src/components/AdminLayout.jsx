import { useState } from "react";

import MesasBoard from "./MesasBoard";
import CrearMesa from "./CrearMesa";
import DashboardEstadisticas from "./DashboardEstadisticas";
import Caja from "./Caja";
import PedidoModal from "./PedidoModal";
import PedidosLista from "./PedidosLista";
import LogoutButton from "./LogoutButton";
import DescargasFirebase from "./DescargasFirebase";
import ModuloProductos from "./ModuloProductos";

export default function AdminLayout() {
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  return (
    <div className="app-container">
      <div className="app-main">
        <h1 className="app-title">Hells Admin</h1>

        <MesasBoard setMesaSeleccionada={setMesaSeleccionada} />
        <CrearMesa />
        <ModuloProductos />
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
