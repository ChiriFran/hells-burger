import React, { useState } from "react";
import { useCaja } from "../hooks/useCaja";
import "../styles/Caja.css";

export default function Caja() {
  const { caja, agregarGasto, cerrarCaja } = useCaja();
  const [montoGasto, setMontoGasto] = useState("");

  const totalCierre = caja.ingresos - caja.gastos;

  const handleAgregarGasto = () => {
    const valor = Number(montoGasto);
    if (!valor || valor <= 0) return;
    agregarGasto(valor);
    setMontoGasto("");
  };

  return (
    <div className="caja-container">
      <h2 className="caja-title">Caja del Día</h2>

      <div className="caja-cards">
        <div className="caja-card ingresos">
          <div className="caja-icon">💵</div>
          <div>
            <span className="caja-value">${caja.ingresos}</span>
            <span className="caja-label">Ingresos</span>
          </div>
        </div>

        <div className="caja-card gastos">
          <div className="caja-icon">🧾</div>
          <div>
            <span className="caja-value">${caja.gastos}</span>
            <span className="caja-label">Gastos</span>
          </div>
        </div>

        <div className="caja-card cierre">
          <div className="caja-icon">🏁</div>
          <div>
            <span className="caja-value">${totalCierre}</span>
            <span className="caja-label">Cierre</span>
          </div>
        </div>
      </div>

      <div className="caja-actions">
        <div className="gasto-personalizado">
          <input
            type="number"
            placeholder="Monto gasto"
            value={montoGasto}
            onChange={(e) => setMontoGasto(e.target.value)}
            min="1"
          />
          <button className="btn-gasto" onClick={handleAgregarGasto}>
            ➖ Agregar Gasto
          </button>
        </div>

        <button className="btn-cerrar-caja" onClick={cerrarCaja}>
          🔒 Cerrar Caja
        </button>
      </div>
    </div>
  );
}
