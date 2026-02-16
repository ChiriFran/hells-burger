import React, { useState } from "react";
import { useCaja } from "../hooks/useCaja";
import CajaEstadisticasModal from "./CajaEstadisticasModal";
import "../styles/caja.css";

export default function Caja() {
  const { caja, cajas, agregarGasto, cerrarCaja } = useCaja();

  const [montoGasto, setMontoGasto] = useState("");
  const [descGasto, setDescGasto] = useState("");
  const [openStats, setOpenStats] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalCierre = (caja?.ingresos || 0) - (caja?.gastos || 0);

  /* ================= AGREGAR GASTO ================= */
  const handleAgregarGasto = async () => {
    const valor = Number(montoGasto);

    if (!valor || valor <= 0 || !descGasto.trim()) {
      alert("⚠️ Completá monto y descripción");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await agregarGasto({ monto: valor, descripcion: descGasto });
      setMontoGasto("");
      setDescGasto("");
    } catch (err) {
      console.error("Error agregando gasto:", err);
      alert("Error al guardar gasto");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CERRAR CAJA ================= */
  const handleCerrarCaja = () => {
    if (!window.confirm("⚠️ Seguro que querés cerrar la caja del día?")) return;
    cerrarCaja();
  };

  return (
    <div className="caja-container">
      {/* HEADER */}
      <header className="caja-header">
        <h2 className="caja-title">💰 Caja del Día</h2>
      </header>

      {/* TARJETAS */}
      <section className="caja-cards">
        <div className="caja-card ingresos">
          <div className="caja-icon">💵</div>
          <div>
            <span className="caja-value">${caja?.ingresos || 0}</span>
            <span className="caja-label">Ingresos</span>
          </div>
        </div>

        <div className="caja-card gastos">
          <div className="caja-icon">🧾</div>
          <div>
            <span className="caja-value">${caja?.gastos || 0}</span>
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
            type="text"
            placeholder="Descripción del gasto"
            value={descGasto}
            onChange={(e) => setDescGasto(e.target.value)}
          />

          <input
            type="number"
            placeholder="Monto del gasto"
            value={montoGasto}
            onChange={(e) => setMontoGasto(e.target.value)}
            min="1"
          />

          <button
            className="btn-gasto"
            onClick={handleAgregarGasto}
            disabled={loading}
          >
            {loading ? "Guardando..." : "➖ Agregar gasto"}
          </button>
        </div>

        <button className="btn-cerrar-caja" onClick={handleCerrarCaja}>
          🔒 Cerrar caja
        </button>

        <button
          className="dashboard-stats-open-btn"
          onClick={() => setOpenStats(true)}
        >
          📊 Ver estadísticas
        </button>
      </section>

      {/* MODAL */}
      <CajaEstadisticasModal
        open={openStats}
        onClose={() => setOpenStats(false)}
        caja={caja}
        cajas={cajas}
      />
    </div>
  );
}
