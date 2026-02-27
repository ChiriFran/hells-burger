import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "../styles/pedidosLista.css";

export default function PedidosLista() {
  const [pedidos, setPedidos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [limpio, setLimpio] = useState(false);
  const [filtroTiempo, setFiltroTiempo] = useState("todos");
  const [filtroEntrega, setFiltroEntrega] = useState("todos"); // 👈 nuevo

  useEffect(() => {
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef, orderBy("horaInicio", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(lista);
      setLimpio(false);
    });

    return () => unsubscribe();
  }, []);

  const cargarMas = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const eliminarPedido = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este pedido?",
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "pedidos", id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el pedido");
    }
  };

  const ahora = Date.now();

  // 🔥 FILTRO COMPLETO (tiempo + entrega)
  const pedidosFiltrados = pedidos.filter((pedido) => {
    // ⏱️ FILTRO TIEMPO
    if (filtroTiempo !== "todos") {
      if (!pedido.horaInicio) return true;

      const pedidoTime = pedido.horaInicio.toMillis
        ? pedido.horaInicio.toMillis()
        : pedido.horaInicio;

      const diffMin = (ahora - pedidoTime) / 60000;

      if (filtroTiempo === "10" && diffMin > 10) return false;
      if (filtroTiempo === "60" && diffMin > 60) return false;
      if (filtroTiempo === "120" && diffMin > 120) return false;
    }

    // 🚚 FILTRO ENTREGA (misma lógica que tu render)
    if (filtroEntrega === "envio" && pedido.tipoEntrega !== "envio") {
      return false;
    }

    if (filtroEntrega === "mesa" && pedido.tipoEntrega === "envio") {
      return false;
    }

    return true;
  });

  // 📊 Contadores dinámicos
  const totalEnvios = pedidos.filter((p) => p.tipoEntrega === "envio").length;

  const totalMesas = pedidos.filter((p) => p.tipoEntrega !== "envio").length;

  const pedidosVisibles = limpio ? [] : pedidosFiltrados.slice(0, visibleCount);

  return (
    <div className="pedidos-lista-container">
      <h2 className="pedidos-lista-title">Pedidos</h2>

      {/* Toolbar cocina */}
      <div className="pedidos-toolbar">
        <button className="toolbar-btn limpiar" onClick={() => setLimpio(true)}>
          🧹 Limpiar vista
        </button>

        <select
          className="toolbar-select"
          value={filtroTiempo}
          onChange={(e) => setFiltroTiempo(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="10">Últimos 10 min</option>
          <option value="60">Última 1 hora</option>
          <option value="120">Últimas 2 horas</option>
        </select>

        {/* 🔥 NUEVO FILTRO ENTREGA */}
        <div className="toolbar-filtros-entrega">
          <button
            className={`toolbar-btn ${
              filtroEntrega === "todos" ? "activo" : ""
            }`}
            onClick={() => setFiltroEntrega("todos")}
          >
            📋 Todos ({pedidos.length})
          </button>

          <button
            className={`toolbar-btn ${
              filtroEntrega === "envio" ? "activo" : ""
            }`}
            onClick={() => setFiltroEntrega("envio")}
          >
            🚚 Envío ({totalEnvios})
          </button>

          <button
            className={`toolbar-btn ${
              filtroEntrega === "mesa" ? "activo" : ""
            }`}
            onClick={() => setFiltroEntrega("mesa")}
          >
            🍽 Local ({totalMesas})
          </button>
        </div>

        <span className="toolbar-count">👀 {pedidosVisibles.length}</span>
      </div>

      {pedidosVisibles.length === 0 ? (
        <p className="pedidos-lista-empty">No hay pedidos visibles</p>
      ) : (
        <>
          <ul className="pedidos-lista">
            {pedidosVisibles.map((pedido) => (
              <li
                key={pedido.id}
                className={`pedido-card ${
                  pedido.tipoEntrega === "envio"
                    ? "pedido-envio"
                    : "pedido-mesa"
                }`}
              >
                <div className="pedido-header">
                  <div className="pedido-mesa">
                    {pedido.tipoEntrega === "envio" ? "🚚 Envío" : "🍽 Mesa"}{" "}
                    {pedido.mesaNombre || pedido.mesaId}
                  </div>

                  <span className={`pedido-estado ${pedido.estado}`}>
                    {pedido.estado}
                  </span>
                </div>

                <ul className="pedido-productos">
                  {pedido.productos?.map((prod, index) => (
                    <li key={index} className="pedido-producto">
                      <span>
                        {prod.cantidad} x {prod.nombre}
                      </span>
                      <span>${prod.subtotal}</span>
                    </li>
                  ))}
                </ul>

                <div className="pedido-footer">
                  <span>Total: ${pedido.total}</span>
                  <span>Pago: {pedido.medioPago || "Pendiente"}</span>
                </div>

                {/* DATOS DE ENVÍO */}
                {pedido.envio && pedido.tipoEntrega === "envio" && (
                  <div className="pedido-envio-box">
                    <h4>📦 Datos de envío</h4>
                    <p>
                      <b>Cliente:</b> {pedido.cliente}
                    </p>
                    <p>
                      <b>Dirección:</b> {pedido.envio.direccion},{" "}
                      {pedido.envio.barrio}
                    </p>
                    <p>
                      <b>Tel:</b> {pedido.envio.telefono}
                    </p>
                  </div>
                )}

                {/* Comentarios */}
                {pedido.comentarios && pedido.comentarios.trim() !== "" && (
                  <div className="pedido-comentarios">
                    💬 {pedido.comentarios}
                  </div>
                )}

                <button
                  className="eliminar-pedido-btn"
                  onClick={() => eliminarPedido(pedido.id)}
                >
                  ⚠️ Eliminar pedido
                </button>
              </li>
            ))}
          </ul>

          {visibleCount < pedidosFiltrados.length && (
            <button className="cargar-mas-btn" onClick={cargarMas}>
              Cargar más
            </button>
          )}
        </>
      )}
    </div>
  );
}
