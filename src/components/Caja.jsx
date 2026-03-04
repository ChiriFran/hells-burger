import React, { useState } from "react";
import { useCaja } from "../hooks/useCaja";
import "../styles/caja.css";

export default function Caja() {
  const { caja, cajas, agregarGasto, cerrarCaja, refetch, loading } = useCaja();

  const [montoGasto, setMontoGasto] = useState("");
  const [descGasto, setDescGasto] = useState("");
  const [saving, setSaving] = useState(false);
  const [openDay, setOpenDay] = useState(null);

  const totalCierre = (caja?.ingresos || 0) - (caja?.gastos || 0);

  /* ================= AGREGAR GASTO ================= */
  const handleAgregarGasto = async () => {
    const valor = Number(montoGasto);

    if (!valor || valor <= 0 || !descGasto.trim()) {
      alert("⚠️ Completá monto y descripción");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      await agregarGasto({ monto: valor, descripcion: descGasto });
      setMontoGasto("");
      setDescGasto("");
    } catch (err) {
      console.error("Error agregando gasto:", err);
      alert("Error al guardar gasto");
    } finally {
      setSaving(false);
    }
  };

  /* ================= CERRAR CAJA ================= */
  const handleCerrarCaja = async () => {
    if (!window.confirm("⚠️ Seguro que querés cerrar la caja del día?")) return;

    await cerrarCaja();
    await refetch(); // 🔥 actualiza después de cerrar
  };

  /* ================= REFRESH ================= */
  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="caja-container">
      {/* HEADER */}
      <header className="caja-header">
        <h2 className="caja-title">💰 Caja del Día</h2>

        <button
          className="btn-refresh"
          onClick={handleRefresh}
          title="Refrescar"
          disabled={loading}
        >
          ↺
        </button>
      </header>

      {/* STATUS */}
      {!caja?.cierre && (
        <div className="caja-status-abierta">
          <span className="status-dot"></span>
          Caja abierta
        </div>
      )}

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
            <span className="caja-label">Resultado</span>
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
            disabled={saving}
          >
            {saving ? "Guardando..." : "➖ Agregar gasto"}
          </button>
        </div>

        <button className="btn-cerrar-caja" onClick={handleCerrarCaja}>
          🔒 Cerrar caja
        </button>
      </section>

      {/* ================= REGISTRO ================= */}
      {cajas?.length > 0 && (
        <section className="caja-registro">
          <div className="registro-header">
            <h4>Registro</h4>
          </div>

          <div className="registro-lista">
            {[...cajas]
              .sort((a, b) => b.fecha.localeCompare(a.fecha))
              .map((dia) => {
                const resultado = (dia.ingresos || 0) - (dia.gastos || 0);

                const [year, month, day] = dia.fecha.split("-");
                const fechaLocal = new Date(year, month - 1, day);

                const isOpen = openDay === dia.fecha;

                return (
                  <div key={dia.fecha} className="registro-dia">
                    <div
                      className="registro-row"
                      onClick={() => setOpenDay(isOpen ? null : dia.fecha)}
                    >
                      <span className="registro-fecha">
                        {fechaLocal.toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className={`registro-total ${
                          resultado < 0 ? "negativo" : ""
                        }`}
                      >
                        ${resultado}
                      </span>
                    </div>

                    {isOpen && (
                      <div className="registro-panel">
                        <div className="panel-resumen">
                          <div>
                            <span>Ingresos</span>
                            <strong>${dia.ingresos || 0}</strong>
                          </div>
                          <div>
                            <span>Gastos</span>
                            <strong>${dia.gastos || 0}</strong>
                          </div>
                        </div>

                        {dia.gastosDetalle?.length > 0 && (
                          <div className="panel-detalle">
                            <span className="detalle-titulo">
                              Detalle de gastos
                            </span>

                            {dia.gastosDetalle.map((g, i) => {
                              const hora = new Date(
                                g.fechaHora,
                              ).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });

                              return (
                                <div key={i} className="detalle-item">
                                  <div>
                                    <span className="detalle-desc">
                                      {g.descripcion}
                                    </span>
                                    <span className="detalle-hora">
                                      {hora} hs
                                    </span>
                                  </div>
                                  <span className="detalle-monto">
                                    ${g.monto}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
