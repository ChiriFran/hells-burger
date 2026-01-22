import React, { useState } from "react";
import { useCaja } from "../hooks/useCaja";
import CajaEstadisticasModal from "./CajaEstadisticasModal";
import "../styles/caja.css";

export default function Caja() {
  const { caja, agregarGasto, cerrarCaja } = useCaja();

  const [montoGasto, setMontoGasto] = useState("");
  const [openStats, setOpenStats] = useState(false);

  const totalCierre = caja.ingresos - caja.gastos;

  const handleAgregarGasto = () => {
    const valor = Number(montoGasto);
    if (!valor || valor <= 0) return;
    agregarGasto(valor);
    setMontoGasto("");
  };

  return (
    <div className="caja-container">
      {/* HEADER */}
      <header className="caja-header">
        <h2 className="caja-title">💰 Caja del Día</h2>
        <button
          className="dashboard-stats-open-btn"
          onClick={() => setOpenStats(true)}
        >
          📊 Ver estadísticas de caja
        </button>
      </header>

      {/* RESUMEN */}
      <section className="caja-cards">
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
      </section>

      {/* ACCIONES */}
      <section className="caja-actions">
        <div className="gasto-personalizado">
          <input
            type="number"
            placeholder="Monto del gasto"
            value={montoGasto}
            onChange={(e) => setMontoGasto(e.target.value)}
            min="1"
          />
          <button className="btn-gasto" onClick={handleAgregarGasto}>
            ➖ Agregar gasto
          </button>
        </div>

        <button className="btn-cerrar-caja" onClick={cerrarCaja}>
          🔒 Cerrar caja
        </button>
      </section>

      {/* MODAL ESTADÍSTICAS */}
      <CajaEstadisticasModal
        open={openStats}
        onClose={() => setOpenStats(false)}
        caja={caja}
      />
    </div>
  );
}
