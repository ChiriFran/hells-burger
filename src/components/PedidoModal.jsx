import React, { useEffect, useState, useRef } from "react";
import { usePedidos } from "../hooks/usePedidos";
import "../styles/pedidoModal.css";

export default function PedidoModal({ mesa, cerrarModal }) {
  const {
    crearPedido,
    cerrarPedido,
    obtenerPedidoPorId,
    agregarProductosAlPedido,
  } = usePedidos();

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [medioPago, setMedioPago] = useState("efectivo");

  const [submitting, setSubmitting] = useState(false);
  const lockRef = useRef(false);

  // 🔄 Cargar pedido existente
  useEffect(() => {
    const cargar = async () => {
      if (mesa.pedidoActual) {
        const pedido = await obtenerPedidoPorId(mesa.pedidoActual);
        setProductos(pedido?.productos || []);
      } else {
        setProductos([]);
      }
    };
    cargar();
  }, [mesa]);

  // ➕ Agregar producto
  const agregarProducto = async () => {
    if (!nombre || !precio || cantidad < 1 || submitting) return;

    const item = {
      nombre: nombre.trim(),
      precio: Number(precio),
      cantidad: Number(cantidad),
      subtotal: Number(precio) * Number(cantidad),
      hora: new Date().toLocaleTimeString(),
    };

    if (mesa.estado === "ocupada" && mesa.pedidoActual) {
      setSubmitting(true);
      try {
        await agregarProductosAlPedido(mesa.pedidoActual, [item]);
        setProductos((prev) => [...prev, item]);
      } finally {
        setSubmitting(false);
      }
    } else {
      setProductos((prev) => [...prev, item]);
    }

    setNombre("");
    setPrecio("");
    setCantidad(1);
  };

  const total = productos.reduce((acc, p) => acc + p.subtotal, 0);

  // 📝 Crear pedido
  const handleCrear = async () => {
    if (
      submitting ||
      lockRef.current ||
      mesa.estado !== "libre" ||
      productos.length === 0
    )
      return;

    setSubmitting(true);
    lockRef.current = true;

    try {
      await crearPedido({
        mesaId: mesa.id,
        mesaNombre: mesa.nombre,
        productos,
      });
      cerrarModal();
    } finally {
      setSubmitting(false);
      lockRef.current = false;
    }
  };

  // ✅ Cerrar pedido
  const handleCerrar = async () => {
    if (
      submitting ||
      lockRef.current ||
      mesa.estado !== "ocupada" ||
      !mesa.pedidoActual
    )
      return;

    setSubmitting(true);
    lockRef.current = true;

    try {
      await cerrarPedido(mesa.pedidoActual, medioPago);
      cerrarModal();
    } finally {
      setSubmitting(false);
      lockRef.current = false;
    }
  };

  return (
    <div className="pedido-overlay">
      <div className="pedido-modal">

        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Mesa {mesa.nombre}</h2>
            <span className={`estado-pill ${mesa.estado}`}>
              {mesa.estado}
            </span>
          </div>

          <button className="btn-cerrar" onClick={cerrarModal}>✖</button>
        </div>

        {/* BODY SCROLL */}
        <div className="modal-body">

          {productos.length > 0 && (
            <>
              <h4 className="section-title">Productos</h4>

              <ul className="pedido-lista">
                {productos.map((p, i) => (
                  <li key={i} className="pedido-item">
                    <div className="item-info">
                      <strong>{p.nombre}</strong>
                      <span className="item-meta">
                        {p.cantidad} × ${p.precio}
                      </span>
                    </div>

                    <div className="item-right">
                      <span className="item-subtotal">${p.subtotal}</span>
                      <span className="hora">{p.hora}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="pedido-total">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </>
          )}

          {/* FORM */}
          <div className="pedido-form-card">
            <h4>Agregar producto</h4>

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

              <button onClick={agregarProducto} disabled={submitting}>
                ➕ Agregar
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="acciones">

          {mesa.estado === "libre" && (
            <button
              className="btn-primario"
              onClick={handleCrear}
              disabled={productos.length === 0 || submitting}
            >
              📝 Crear Pedido
            </button>
          )}

          {mesa.estado === "ocupada" && (
            <>
              <div className="medio-pago">
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

              <button
                className="btn-secundario"
                onClick={handleCerrar}
                disabled={submitting}
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
    </div>
  );
}
