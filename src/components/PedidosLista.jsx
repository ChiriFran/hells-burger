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
  const [filtroEntrega, setFiltroEntrega] = useState("todos");

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

  // 🖨 FUNCIÓN DE IMPRESIÓN COMPACTA
  const imprimirPedido = (pedido) => {
    const WIDTH = 32;

    const centerText = (text) => {
      const spaces = Math.max(0, Math.floor((WIDTH - text.length) / 2));
      return " ".repeat(spaces) + text;
    };

    const line = "=".repeat(WIDTH);
    const separator = "-".repeat(WIDTH);

    const fecha = pedido.horaInicio?.toDate
      ? pedido.horaInicio.toDate()
      : new Date(pedido.horaInicio);

    const hora = fecha.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const productos = pedido.productos
      ?.map((p) => `${p.cantidad}x ${p.nombre}`)
      .join("\n");

    // Alinear total a la derecha
    const totalText = `TOTAL: $${pedido.total}`;
    const totalAligned =
      "TOTAL:" +
      " ".repeat(WIDTH - 7 - pedido.total.toString().length - 1) +
      `$${pedido.total}`;

    const envio =
      pedido.tipoEntrega === "envio" && pedido.envio
        ? `\n${pedido.cliente}\n${pedido.envio.direccion}\n${pedido.envio.barrio}`
        : "";

    const ticket = `
${line}
${centerText("PEDIDO #" + pedido.id.slice(0, 6))}
${centerText(hora + "  " + (pedido.tipoEntrega === "envio" ? "ENVIO" : "MESA"))}
${line}

${productos}

${separator}
${totalAligned}
${separator}
${envio}

`;

    const ventana = window.open("", "", "width=400,height=600");
    ventana.document.write(`
    <pre style="
      font-family: monospace;
      font-size: 12px;
      margin: 0;
    ">
${ticket}
    </pre>
  `);
    ventana.document.close();
    ventana.print();
  };

  const ahora = Date.now();

  const pedidosFiltrados = pedidos.filter((pedido) => {
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

    if (filtroEntrega === "envio" && pedido.tipoEntrega !== "envio") {
      return false;
    }

    if (filtroEntrega === "mesa" && pedido.tipoEntrega === "envio") {
      return false;
    }

    return true;
  });

  const totalEnvios = pedidos.filter((p) => p.tipoEntrega === "envio").length;
  const totalMesas = pedidos.filter((p) => p.tipoEntrega !== "envio").length;

  const pedidosVisibles = limpio ? [] : pedidosFiltrados.slice(0, visibleCount);

  return (
    <div className="pedidos-lista-container">
      <h2 className="pedidos-lista-title">Pedidos</h2>

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
                  <div className="pedido-mesa-nombre">
                    {pedido.tipoEntrega === "envio"
                      ? "🚚 Envío"
                      : `🍽 ${pedido.mesaNombre || pedido.mesaId}`}
                  </div>

                  <span className={`pedido-estado ${pedido.estado}`}>
                    {pedido.estado}
                  </span>
                  <button
                    className="imprimir-pedido-btn"
                    onClick={() => imprimirPedido(pedido)}
                  >
                    🖨️
                  </button>
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
                </div>

                {pedido.envio && pedido.tipoEntrega === "envio" && (
                  <div className="pedido-envio-box">
                    <p>
                      <b>Cliente:</b> {pedido.cliente}
                    </p>
                    <p>
                      <b>Dirección:</b> {pedido.envio.direccion},{" "}
                      {pedido.envio.barrio}
                    </p>
                  </div>
                )}

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
