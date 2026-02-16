import { useState } from "react";
import { usePublicCart } from "../context/PublicCartContext";
import { useMesasContext } from "../context/MesaContext";
import "../styles/publicCart.css";
import { db } from "../firebase/config";
import { deleteDoc, doc } from "firebase/firestore";

export default function PublicCartSidebar() {
  const { crearMesaPublica, crearPedidoMesa } = useMesasContext();

  const {
    items,
    open,
    setOpen,
    removeItem,
    total,
    clearCart,
    pedidoCreado,
    setPedidoCreado,
  } = usePublicCart();

  const [loading, setLoading] = useState(false);
  const [nombreMesa, setNombreMesa] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("retiro");
  const [envio, setEnvio] = useState({
    direccion: "",
    barrio: "",
    telefono: "",
  });
  const [comentarios, setComentarios] = useState("");

  const ALIAS_PAGO = "tu.alias.aqui";
  const WHATSAPP = "5491130504515";

  const step = pedidoCreado ? "checkout" : "cart";

  // ================= CREAR PEDIDO =================
  const handleCrearPedido = async () => {
    if (items.length === 0 || loading || pedidoCreado) return;
    if (!nombreMesa.trim()) return alert("Ingresá tu nombre");

    if (tipoEntrega === "envio") {
      if (!envio.direccion || !envio.barrio || !envio.telefono) {
        return alert("Completá los datos de envío");
      }
    }

    let mesaCreada = null;

    try {
      setLoading(true);

      // 1️⃣ Crear mesa
      mesaCreada = await crearMesaPublica(nombreMesa.trim());
      console.log("Mesa creada:", mesaCreada);

      // 2️⃣ Normalizar productos
      const productos = items.map((item) => ({
        nombre: item.titulo,
        cantidad: item.qty,
        precio: item.precio,
        subtotal: item.precio * item.qty,
        extras: item.extras || [],
        comentarioProducto: item.comentarioProducto || "",
      }));

      // 3️⃣ Crear pedido
      const pedidoId = await crearPedidoMesa(mesaCreada, productos);
      console.log("Pedido creado:", pedidoId);

      // 4️⃣ Guardar pedido en contexto
      setPedidoCreado({ pedidoId });
    } catch (error) {
      console.error("ERROR PEDIDO:", error);
      alert(error.message || "Ocurrió un error al crear el pedido");

      // 🔥 rollback mesa si falla pedido
      if (mesaCreada?.id) {
        await deleteDoc(doc(db, "mesas", mesaCreada.id));
        console.warn("Mesa eliminada por rollback");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarCarrito = () => setOpen(false);

  const handleFinalizar = () => {
    clearCart();
    setPedidoCreado(null);
    setOpen(false);
    setNombreMesa("");
    setEnvio({ direccion: "", barrio: "", telefono: "" });
    setComentarios("");
    setTipoEntrega("retiro");
  };

  return (
    <aside className={`public-cart ${open ? "open" : ""}`}>
      {/* HEADER */}
      <header className="public-cart-header">
        <h3>{step === "cart" ? "Tu pedido" : "Finalizar compra"}</h3>
        <button onClick={handleCerrarCarrito}>✕</button>
      </header>

      {/* BODY */}
      <div className="public-cart-body">
        {items.length === 0 && step === "cart" && (
          <p className="public-cart-empty">Carrito vacío</p>
        )}

        {items.map((item) => (
          <div key={item.cartItemId} className="public-cart-item">
            <div>
              <strong>{item.titulo}</strong>
              <span className="qty">× {item.qty}</span>

              {item.extras?.length > 0 && (
                <div className="cart-item-extras">
                  {item.extras.map((extra, i) => (
                    <span key={i} className="extra-chip">
                      + {extra.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="price">${item.precio * item.qty}</div>

            <button
              className="public-cart-remove-btn"
              disabled={loading}
              onClick={() => removeItem(item.cartItemId)}
            >
              🗑
            </button>
          </div>
        ))}

        {/* FORMULARIO */}
        {step === "cart" && items.length > 0 && (
          <>
            {/* Nombre */}
            <div className="mesa-nombre-input">
              <label>Nombre</label>
              <input
                type="text"
                value={nombreMesa}
                onChange={(e) => setNombreMesa(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            {/* Entrega */}
            <div className="entrega-selector">
              <button
                className={tipoEntrega === "retiro" ? "active" : ""}
                onClick={() => setTipoEntrega("retiro")}
              >
                🏪 Retiro en local
              </button>
              <button
                className={tipoEntrega === "envio" ? "active" : ""}
                onClick={() => setTipoEntrega("envio")}
              >
                🛵 Envío a domicilio
              </button>
            </div>

            {/* Envío */}
            {tipoEntrega === "envio" && (
              <div className="envio-form">
                <label>
                  Dirección
                  <input
                    value={envio.direccion}
                    onChange={(e) =>
                      setEnvio({ ...envio, direccion: e.target.value })
                    }
                  />
                </label>

                <label>
                  Barrio
                  <input
                    value={envio.barrio}
                    onChange={(e) =>
                      setEnvio({ ...envio, barrio: e.target.value })
                    }
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    value={envio.telefono}
                    onChange={(e) =>
                      setEnvio({ ...envio, telefono: e.target.value })
                    }
                  />
                </label>
              </div>
            )}

            {/* Comentarios */}
            <div className="comentarios-box">
              <label>Comentarios</label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Ej: sin cebolla, salsa aparte…"
                rows={3}
              />
            </div>
          </>
        )}

        {/* CHECKOUT */}
        {step === "checkout" && pedidoCreado && (
          <div className="checkout-box">
            <div className="checkout-card">
              <h4>💳 Pago en efectivo</h4>

              <div className="checkout-row">
                <span>Total</span>
                <strong>${total}</strong>
              </div>

              <div className="checkout-row">
                <span>Entrega</span>
                <strong>
                  {tipoEntrega === "retiro"
                    ? "Retiro en local"
                    : "Envío a domicilio"}
                </strong>
              </div>

              <div className="checkout-row">
                <span>Alias</span>
                <strong className="alias">{ALIAS_PAGO}</strong>
              </div>

              <p className="checkout-note">
                Enviá el comprobante por WhatsApp para confirmar tu pedido.
              </p>

              <a
                className="checkout-wsp-btn"
                href={`https://wa.me/${WHATSAPP}?text=Pedido%20${pedidoCreado.pedidoId}%20-%20Total%20$${total}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📲 Enviar comprobante
              </a>

              <p className="checkout-id">
                Pedido ID: <strong>{pedidoCreado.pedidoId}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="public-cart-footer">
        {step === "cart" && (
          <>
            <div className="public-cart-total">
              <span>Total</span>
              <strong>${total}</strong>
            </div>

            <button
              className="public-cart-checkout-btn"
              disabled={loading || items.length === 0}
              onClick={handleCrearPedido}
            >
              {loading ? "Procesando..." : "Confirmar pedido"}
            </button>
          </>
        )}

        {step === "checkout" && (
          <button className="public-cart-close-btn" onClick={handleFinalizar}>
            Cerrar pedido
          </button>
        )}
      </footer>
    </aside>
  );
}
