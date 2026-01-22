import React, { useState, useEffect } from "react";
import { useMesasContext } from "../context/MesaContext";
import "../styles/mesa.css";

export default function Mesa({ mesa, setMesaSeleccionada }) {
  const { borrarMesa, pedidos } = useMesasContext();
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00");
  const [despachado, setDespachado] = useState(false); // estado visual

  const handleClick = () => setMesaSeleccionada(mesa);

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

  const claseEstado =
    mesa.estado === "libre"
      ? "mesa-libre"
      : mesa.estado === "ocupada"
        ? "mesa-ocupada"
        : "mesa-reservada";

  const pedido = pedidos.find((p) => p.id === mesa.pedidoActual);
  const items = pedido?.productos || pedido?.items || [];

  // Contador de tiempo desde la creación del pedido
  useEffect(() => {
    if (!pedido || !pedido.horaInicio) return;

    const intervalo = setInterval(() => {
      const creado = pedido.horaInicio.toDate();
      const diff = Math.floor((new Date() - creado) / 1000);
      const minutos = String(Math.floor(diff / 60)).padStart(2, "0");
      const segundos = String(diff % 60).padStart(2, "0");
      setTiempoTranscurrido(`${minutos}:${segundos}`);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pedido]);

  const toggleDespachado = (e) => {
    e.stopPropagation();
    setDespachado(!despachado);
  };

  return (
    <div onClick={handleClick} className={`mesa-card ${claseEstado}`}>
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

      {items.length > 0 && (
        <div className="mesa-pedidos-icons">
          {items.map((item, index) =>
            Array.from({ length: item.cantidad || 1 }).map((_, i) => (
              <span
                key={`${index}-${i}`}
                className="icono-hamburguesa"
              >
                🍔
              </span>
            ))
          )}
        </div>
      )}

      {/* Pie de tarjeta con despachado y contador */}
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
