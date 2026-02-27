import React, { useState, useEffect, useMemo } from "react";
import { useMesasContext } from "../context/MesaContext";
import "../styles/mesa.css";

export default function Mesa({ mesa, setMesaSeleccionada }) {
  const { borrarMesa, pedidos, marcarDespachado } = useMesasContext();

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00");
  const [despachado, setDespachado] = useState(false);

  const handleClick = () => setMesaSeleccionada(mesa);

  /* ================= PEDIDO ACTUAL ================= */
  const pedido = useMemo(() => {
    return pedidos.find((p) => p.id === mesa.pedidoActual);
  }, [pedidos, mesa.pedidoActual]);

  const items = pedido?.productos || [];

  /* ================= BORRAR MESA ================= */
  const handleBorrar = async (e) => {
    e.stopPropagation();

    if (mesa.estado !== "libre" || mesa.pedidoActual) {
      alert("No se puede borrar una mesa ocupada");
      return;
    }

    if (window.confirm(`¿Eliminar la mesa ${mesa.nombre}?`)) {
      try {
        await borrarMesa(mesa);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!pedido?.horaInicio) return;

    const inicio = pedido.horaInicio?.toDate?.() || new Date(pedido.horaInicio);

    const intervalo = setInterval(() => {
      const diff = Math.floor((new Date() - inicio) / 1000);
      const minutos = String(Math.floor(diff / 60)).padStart(2, "0");
      const segundos = String(diff % 60).padStart(2, "0");
      setTiempoTranscurrido(`${minutos}:${segundos}`);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pedido]);

  /* ================= SINCRONIZAR DESPACHADO ================= */
  useEffect(() => {
    if (pedido?.despachado !== undefined) {
      setDespachado(pedido.despachado);
    }
  }, [pedido]);

  /* ================= DESPACHAR ================= */
  const toggleDespachado = async (e) => {
    e.stopPropagation();

    if (!pedido) return;

    const nuevo = !despachado;
    setDespachado(nuevo);

    try {
      await marcarDespachado(pedido.id, nuevo);
    } catch (error) {
      console.error("Error al despachar:", error);
      setDespachado(!nuevo); // rollback visual
    }
  };

  /* ================= CLASE VISUAL ================= */
  const claseEstado =
    mesa.estado === "libre"
      ? "mesa-libre"
      : mesa.estado === "ocupada"
        ? "mesa-ocupada"
        : "mesa-default";

  const estadoPedido = pedido?.estado || null;

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

      {/* NOMBRE */}
      <h3 className="mesa-nombre">{mesa.nombre}</h3>

      {/* ESTADO */}
      <div className="mesa-body">
        <span className="mesa-estado">
          {mesa.estado === "libre" && "Libre"}
          {mesa.estado === "ocupada" && "Ocupada"}
        </span>

        {estadoPedido && (
          <span className={`pedido-estado estado-${estadoPedido}`}>
            {estadoPedido}
          </span>
        )}
      </div>

      {/* ICONOS PEDIDO */}
      {items.length > 0 && (
        <div className="mesa-pedidos-icons">
          {items.slice(0, 5).map((item, index) => (
            <span key={index} className="icono-item">
              🍔 x{item.cantidad || 1}
            </span>
          ))}

          {items.length > 5 && (
            <span className="icono-mas">+{items.length - 5}</span>
          )}
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
