import React, { useState, useEffect } from "react";
import { useMesasContext } from "../context/MesaContext";
import "../styles/mesa.css";

export default function Mesa({ mesa, setMesaSeleccionada }) {
  const { borrarMesa, pedidos, marcarDespachado } = useMesasContext();

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00");

  const handleClick = () => setMesaSeleccionada(mesa);

  /* ================= BORRAR MESA ================= */
  const handleBorrar = async (e) => {
    e.stopPropagation();

    if (mesa.estado !== "libre" || mesa.pedidoActual) {
      alert("No se puede borrar una mesa ocupada");
      return;
    }

    if (confirm(`¿Eliminar la mesa ${mesa.numero}?`)) {
      try {
        await borrarMesa(mesa);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  /* ================= CLASES DE ESTADO ================= */
  const claseEstado =
    mesa.estado === "libre"
      ? "mesa-libre"
      : mesa.estado === "ocupada"
        ? "mesa-ocupada"
        : "mesa-reservada";

  /* ================= PEDIDO ================= */
  const pedido = pedidos?.find((p) => p.id === mesa.pedidoActual);
  const items = pedido?.productos || [];

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!pedido?.horaInicio) return;

    const inicio = pedido.horaInicio.toDate?.() || new Date(pedido.horaInicio);

    const intervalo = setInterval(() => {
      const diff = Math.floor((new Date() - inicio) / 1000);
      const minutos = String(Math.floor(diff / 60)).padStart(2, "0");
      const segundos = String(diff % 60).padStart(2, "0");
      setTiempoTranscurrido(`${minutos}:${segundos}`);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pedido]);

  const [despachado, setDespachado] = useState(false);

  /* ================= SINCRONIZAR DESPACHADO ================= */
  useEffect(() => {
    if (pedido?.despachado !== undefined) {
      setDespachado(pedido.despachado);
    }
  }, [pedido]);

  /* ================= DESPACHAR ================= */
  const toggleDespachado = async (e) => {
    e.stopPropagation();
    const nuevo = !despachado;
    setDespachado(nuevo);

    if (pedido) {
      try {
        await marcarDespachado(pedido.id, nuevo);
      } catch (e) {
        console.error("Error despachando:", e);
        setDespachado(!nuevo); // rollback UI
      }
    }
  };

  return (
    <div onClick={handleClick} className={`mesa-card ${claseEstado}`}>
      {/* HEADER */}
      <div className="mesa-header">
        <span className="icono-mesa">🪑</span>

        {mesa.estado === "libre" && !mesa.pedidoActual && (
          <button onClick={handleBorrar} className="mesa-borrar">
            ✕
          </button>
        )}
      </div>

      <h3 className="mesa-nombre">{mesa.nombre}</h3>

      <div className="mesa-body">
        <span className="mesa-estado">{mesa.estado}</span>
      </div>

      {/* ICONOS PEDIDOS (LIMITADO) */}
      {items.length > 0 && (
        <div className="mesa-pedidos-icons">
          {items.slice(0, 6).map((item, index) => (
            <span key={index} className="icono-hamburguesa">
              🍔 x{item.cantidad || 1}
            </span>
          ))}
          {items.length > 6 && <span>+{items.length - 6}</span>}
        </div>
      )}

      {/* FOOTER */}
      {pedido && (
        <div className="mesa-footer">
          <span className="mesa-tiempo">{tiempoTranscurrido}</span>

          <button
            className={`mesa-despachado ${despachado ? "marcado" : ""}`}
            onClick={toggleDespachado}
          >
            {despachado ? "✅ Entregado" : "🚚 Despachar"}
          </button>
        </div>
      )}
    </div>
  );
}
