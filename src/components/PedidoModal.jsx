import React, { useEffect, useState, useRef } from "react";
import { usePedidos } from "../hooks/usePedidos";
import { useProductos } from "../context/ProductosContext";
import { useMesasContext } from "../context/MesaContext";
import "../styles/pedidoModal.css";

export default function PedidoModal({ mesa, cerrarModal }) {
  // 🔥 PEDIDOS SOLO PARA CONSULTAS
  const { obtenerPedidoPorId, agregarProductosAlPedido } = usePedidos();

  // 🔥 MESAS CONTEXT = CREAR Y CERRAR
  const { crearPedidoMesa, cerrarPedidoSeguro } = useMesasContext();

  const { productos: productosDisponibles } = useProductos();

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [medioPago, setMedioPago] = useState("efectivo");
  const [showProductos, setShowProductos] = useState(false);

  const EXTRA_PRICE = 2000;

  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const [submitting, setSubmitting] = useState(false);
  const lockRef = useRef(false);

  // ===================== 🔥 NOMBRE CON EXTRAS =====================
  const buildNombreConExtras = (p) => {
    let nombre = p.nombreBase || p.nombre;

    if (p.usarDoble) nombre += " Doble";

    const extras = [];
    if (p.extras?.carne > 0) extras.push(`Carne x${p.extras.carne}`);
    if (p.extras?.cheddar) extras.push("Papas Cheddar");
    if (p.extras?.bacon) extras.push("Papas Bacon");

    if (extras.length > 0) nombre += " - " + extras.join(", ");

    return nombre;
  };

  // ===================== CARGAR PEDIDO =====================
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

  // ===================== AGREGAR MANUAL =====================
  const agregarProducto = async () => {
    if (!nombre || !precio || cantidad < 1 || submitting) return;

    const item = {
      nombre: nombre.trim(),
      nombreBase: nombre.trim(),
      precio: Number(precio),
      cantidad: Number(cantidad),
      subtotal: Number(precio) * Number(cantidad),
      hora: new Date().toLocaleTimeString(),
      extras: { carne: 0, cheddar: false, bacon: false },
      precioDoble: null,
      usarDoble: false,
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

  // ===================== AGREGAR DESDE LISTA =====================
  const agregarProductoDirecto = async (producto) => {
    if (submitting) return;

    const item = {
      nombre: producto.titulo,
      nombreBase: producto.titulo,
      precio: Number(producto.precio),
      precioDoble: producto.precioDoble || null,
      usarDoble: false,
      cantidad: 1,
      hora: new Date().toLocaleTimeString(),
      extras: { carne: 0, cheddar: false, bacon: false },
      subtotal: Number(producto.precio),
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

    setShowProductos(false);
  };

  // ===================== SUBTOTAL =====================
  const calcularSubtotal = (p) => {
    const base = p.usarDoble && p.precioDoble ? p.precioDoble : p.precio;
    const extrasTotal =
      (p.extras?.carne || 0) * EXTRA_PRICE +
      (p.extras?.cheddar ? EXTRA_PRICE : 0) +
      (p.extras?.bacon ? EXTRA_PRICE : 0);

    return (base + extrasTotal) * p.cantidad;
  };

  // ===================== UPDATE =====================
  const updateProducto = (index, changes) => {
    setProductos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...changes } : p)),
    );
  };

  const updateExtras = (index, changes) => {
    setProductos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, extras: { ...p.extras, ...changes } } : p,
      ),
    );
  };

  const total = productos.reduce((acc, p) => acc + calcularSubtotal(p), 0);

  // ===================== CREAR PEDIDO =====================
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
      const productosFinal = productos.map((p) => ({
        ...p,
        nombre: buildNombreConExtras(p),
        subtotal: calcularSubtotal(p),
      }));

      await crearPedidoMesa(mesa, productosFinal);

      cerrarModal();
    } finally {
      setSubmitting(false);
      lockRef.current = false;
    }
  };

  // ===================== CERRAR PEDIDO =====================
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
      await cerrarPedidoSeguro(mesa.pedidoActual, medioPago);
      cerrarModal();
    } finally {
      setSubmitting(false);
      lockRef.current = false;
    }
  };

  // ===================== FILTROS =====================
  const categorias = [
    "todas",
    ...new Set(productosDisponibles.map((p) => p.categoria || "Sin categoría")),
  ];

  const productosFiltrados = productosDisponibles.filter((p) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      p.titulo.toLowerCase().includes(texto) ||
      (p.categoria || "").toLowerCase().includes(texto);
    const coincideCategoria =
      categoriaActiva === "todas" || p.categoria === categoriaActiva;
    return coincideTexto && coincideCategoria;
  });

  const productosPorCategoria = productosFiltrados.reduce((acc, prod) => {
    const cat = prod.categoria || "Sin categoría";
    acc[cat] = acc[cat] || [];
    acc[cat].push(prod);
    return acc;
  }, {});

  // ===================== RENDER =====================
  return (
    <div className="pedido-overlay">
      <div className="pedido-modal">
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Mesa {mesa.nombre}</h2>
            <span className={`estado-pill ${mesa.estado}`}>{mesa.estado}</span>
          </div>
          <button className="btn-cerrar" onClick={cerrarModal}>
            ✖
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {productos.length > 0 && (
            <>
              <h4 className="section-title">Productos</h4>

              <ul className="pedido-lista">
                {productos.map((p, i) => (
                  <li key={i} className="pedido-item">
                    <div className="item-info">
                      <strong>{buildNombreConExtras(p)}</strong>

                      <span className="item-meta">
                        {p.cantidad} × $
                        {p.usarDoble && p.precioDoble
                          ? p.precioDoble
                          : p.precio}
                      </span>

                      {p.precioDoble && (
                        <label className="doble-switch">
                          <input
                            type="checkbox"
                            checked={p.usarDoble}
                            onChange={(e) =>
                              updateProducto(i, { usarDoble: e.target.checked })
                            }
                          />
                          Doble
                        </label>
                      )}

                      <details className="extras-box">
                        <summary>Extras</summary>

                        <div className="extra-row">
                          Carne extra 🥩
                          <button
                            onClick={() =>
                              updateExtras(i, {
                                carne: Math.max((p.extras?.carne || 0) - 1, 0),
                              })
                            }
                          >
                            −
                          </button>
                          <span>{p.extras?.carne || 0}</span>
                          <button
                            onClick={() =>
                              updateExtras(i, {
                                carne: (p.extras?.carne || 0) + 1,
                              })
                            }
                          >
                            +
                          </button>
                        </div>

                        <label>
                          <input
                            type="checkbox"
                            checked={p.extras?.cheddar || false}
                            onChange={(e) =>
                              updateExtras(i, { cheddar: e.target.checked })
                            }
                          />
                          Papas con Cheddar (+$2000)
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={p.extras?.bacon || false}
                            onChange={(e) =>
                              updateExtras(i, { bacon: e.target.checked })
                            }
                          />
                          Papas con Bacon (+$2000)
                        </label>
                      </details>
                    </div>

                    <div className="item-right">
                      <span className="item-subtotal">
                        ${calcularSubtotal(p)}
                      </span>
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

          {/* AGREGAR */}
          <div className="pedido-form-card">
            <h4>Agregar producto</h4>

            <button
              className="btn-secundario"
              onClick={() => setShowProductos(true)}
            >
              📦 Elegir de productos
            </button>

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

      {/* MODAL PRODUCTOS */}
      {showProductos && (
        <div className="pedido-overlay">
          <div className="pedido-modal">
            <div className="modal-header">
              <h3>Seleccionar producto</h3>
              <button
                className="btn-cerrar"
                onClick={() => setShowProductos(false)}
              >
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="filtros-productos">
                <input
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                  value={categoriaActiva}
                  onChange={(e) => setCategoriaActiva(e.target.value)}
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {Object.entries(productosPorCategoria).map(
                ([categoria, items]) => (
                  <div key={categoria}>
                    <h4 className="categoria-titulo">{categoria}</h4>

                    <ul className="pedido-lista">
                      {items.map((p) => (
                        <li
                          key={p.id}
                          className="pedido-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => agregarProductoDirecto(p)}
                        >
                          <div>
                            <strong>{p.titulo}</strong>
                            <div className="item-meta">
                              ${p.precio}
                              {p.precioDoble && ` | Doble $${p.precioDoble}`}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
