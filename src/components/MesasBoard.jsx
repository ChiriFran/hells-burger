import React from "react";
import { useMesasContext } from "../context/MesaContext";
import Mesa from "./Mesa";
import "../styles/mesasBoard.css";

export default function MesasBoard({ setMesaSeleccionada }) {
  const { mesas } = useMesasContext();

  return (
    <div className="mesas-board-wrapper">
      <div className="mesas-board-container">
        {mesas.map((m) => (
          <Mesa key={m.id} mesa={m} setMesaSeleccionada={setMesaSeleccionada} />
        ))}
      </div>
    </div>
  );
}
