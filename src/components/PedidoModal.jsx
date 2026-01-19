import React, { useEffect, useState } from "react";
import { usePedidos } from "../hooks/usePedidos";
import "../styles/pedidoModal.css";

export default function PedidoModal({ mesa, cerrarModal }) {
  const { crearPedido, cerrarPedido, obtenerPedidoPorId, loading } =
    usePedidos();

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [medioPago, setMedioPago] = useState("efectivo");

  useEffect(() => {
    const cargarPedido = async () => {
      if (mesa.pedidoActual) {
        const pedido = await obtenerPedidoPorId(mesa.pedidoActual);
        if (pedido?.productos) setProductos(pedido.productos);
      } else {
        setProductos([]);
      }
    };
    cargarPedido();
  }, [mesa]);

  const agregarProducto = () => {
    if (!nombre || !precio || cantidad < 1) return;
    const item = {
      nombre,
      precio: Number(precio),
      cantidad: Number(cantidad),
      subtotal: Number(precio) * Number(cantidad),
      hora: new Date().toLocaleTimeString(),
    };
    setProductos([...productos, item]);
    setNombre("");
    setPrecio("");
    setCantidad(1);
  };

  const total = productos.reduce((acc, p) => acc + (p.subtotal || 0), 0);

  const handleCrear = async () => {
    if (mesa.estado !== "libre" || productos.length === 0) return;
    await crearPedido({
      mesaId: mesa.id,
      mesaNombre: mesa.nombre,
      productos,
      total,
    });
    cerrarModal();
  };

  const handleCerrar = async (pago) => {
    if (!mesa.pedidoActual || mesa.estado !== "ocupada") return;
    await cerrarPedido(mesa.pedidoActual, pago);
    cerrarModal();
  };

  return (
    <div className="pedido-overlay">
      <div className="pedido-modal">
        <div className="modal-header">
          <span className="mesa-icon">🍽️</span>
          <h2>Mesa {mesa.nombre}</h2>
          <button className="btn-cerrar" onClick={cerrarModal}>
            ✖
          </button>
        </div>

        <p className={`estado-mesa ${mesa.estado}`}>Estado: {mesa.estado}</p>

        {productos.length > 0 && (
          <>
            <h4>Productos</h4>
            <ul className="pedido-lista">
              {productos.map((p, i) => (
                <li key={i}>
                  🛒 {p.nombre} × {p.cantidad} = ${p.subtotal}
                  <span className="hora">{p.hora}</span>
                </li>
              ))}
            </ul>
            <p className="pedido-total">💰 Total: ${total}</p>
          </>
        )}

        {mesa.estado === "libre" && (
          <>
            {productos.length === 0 && (
              <div className="pedido-alerta">
                ⚠️ Debes agregar productos antes de crear el pedido
              </div>
            )}
            <div className="pedido-form">
              <input
                placeholder="Producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
              <button onClick={agregarProducto}>➕ Agregar</button>
            </div>

            <button
              className="btn-primario"
              onClick={handleCrear}
              disabled={loading || productos.length === 0}
            >
              📝 Crear Pedido
            </button>
          </>
        )}

        {mesa.estado === "ocupada" && (
          <>
            <div className="medio-pago">
              <span>💳 Seleccionar medio de pago:</span>
              <div className="medio-botones">
                <button
                  className={medioPago === "efectivo" ? "activo" : ""}
                  onClick={() => setMedioPago("efectivo")}
                >
                  💵 Efectivo
                </button>
                <button
                  className={medioPago === "otro" ? "activo" : ""}
                  onClick={() => setMedioPago("otro")}
                >
                  💳 Otro
                </button>
              </div>
            </div>

            <button
              className="btn-secundario"
              onClick={() => handleCerrar(medioPago)}
              disabled={loading}
            >
              ✅ Cerrar Pedido
            </button>
          </>
        )}

        <button className="btn-cancelar" onClick={cerrarModal}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
