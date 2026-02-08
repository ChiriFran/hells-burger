import { useEffect, useState } from "react";
import "../styles/publicProductosModal.css";

export default function PublicProductosModal({ product, onClose, onAdd }) {
  const EXTRA_PRICE = 2000;

  const [closing, setClosing] = useState(false);
  const [version, setVersion] = useState("simple");

  const [extras, setExtras] = useState({
    carne: 0,
    cheddar: false,
    papas: false,
  });

  const [comentarioProducto, setComentarioProducto] = useState("");

  if (!product) return null;

  /* ================= PRECIO BASE (BLINDADO) ================= */
  const precioBase =
    Number(version === "doble" ? product.precioDoble : product.precio) || 0;

  const extrasTotal =
    Number(extras.carne || 0) * EXTRA_PRICE +
    (extras.cheddar ? EXTRA_PRICE : 0) +
    (extras.papas ? EXTRA_PRICE : 0);

  const precioFinal = Number(precioBase) + Number(extrasTotal);

  /* ================= CIERRE ================= */
  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* ================= EXTRAS ================= */
  const toggleExtra = (key) =>
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));

  const addCarne = () =>
    setExtras((prev) => ({ ...prev, carne: prev.carne + 1 }));

  const removeCarne = () =>
    setExtras((prev) => ({
      ...prev,
      carne: Math.max(prev.carne - 1, 0),
    }));

  const extrasSeleccionados = [];
  if (extras.carne > 0)
    extrasSeleccionados.push(`Carne extra x${extras.carne}`);
  if (extras.cheddar) extrasSeleccionados.push("Cheddar");
  if (extras.papas) extrasSeleccionados.push("Papas con bacon");

  const extrasLabel =
    extrasSeleccionados.length > 0
      ? ` (+ ${extrasSeleccionados.join(", ")})`
      : "";

  /* ================= AGREGAR ================= */
  const handleAdd = () => {
    onAdd({
      ...product,
      precio: precioFinal, // 👈 PRECIO FINAL ÚNICO
      version,
      titulo: `${product.titulo} (${
        version === "doble" ? "Doble" : "Simple"
      })${extrasLabel}`,
      comentarioProducto: comentarioProducto.trim(),
    });
    handleClose();
  };

  return (
    <div
      className={`product-modal-overlay ${closing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`product-modal-content ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="product-modal-close" onClick={handleClose}>
          &times;
        </button>

        {/* IMAGEN */}
        <div className="product-modal-img">
          <img src={product.imagen} alt={product.titulo} />
        </div>

        <div className="product-modal-info">
          <h2>{product.titulo}</h2>
          <p className="product-modal-subtitle">{product.subtitulo}</p>

          <p className="product-modal-price">
            ${precioFinal}
            {extrasTotal > 0 && (
              <span className="extras-price"> (+${extrasTotal})</span>
            )}
          </p>

          {/* ===== VERSION ===== */}
          <div className="product-modal-options compact">
            <h4>Versión</h4>

            <div className="extra-row">
              <div
                className={`extra-item small half ${
                  version === "simple" ? "active" : ""
                }`}
                onClick={() => setVersion("simple")}
              >
                <p className="extra-title">Simple 🍔</p>
                <span className="extra-price">
                  ${Number(product.precio) || 0}
                </span>
              </div>

              <div
                className={`extra-item small half ${
                  version === "doble" ? "active" : ""
                }`}
                onClick={() => setVersion("doble")}
              >
                <p className="extra-title">Doble 🥩</p>
                <span className="extra-price">
                  ${Number(product.precioDoble) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ===== EXTRAS ===== */}
          <div className="product-modal-options compact">
            <h4>Extras</h4>

            <div className="extra-item small">
              <div>
                <p className="extra-title">Carne extra 🥩</p>
                <span className="extra-desc">Sumá más carne</span>
                <span className="extra-price"> +$2000</span>
              </div>

              <div className="extra-qty">
                <button onClick={removeCarne} disabled={extras.carne === 0}>
                  −
                </button>
                <span>{extras.carne}</span>
                <button onClick={addCarne}>+</button>
              </div>
            </div>

            <div className="extra-row">
              <div
                className={`extra-item small half ${
                  extras.cheddar ? "active" : ""
                }`}
                onClick={() => toggleExtra("cheddar")}
              >
                <p className="extra-title">Papas con Cheddar 🧀</p>
                <span className="extra-price">+$2000</span>
              </div>

              <div
                className={`extra-item small half ${
                  extras.papas ? "active" : ""
                }`}
                onClick={() => toggleExtra("papas")}
              >
                <p className="extra-title">Papas con Bacon 🥓</p>
                <span className="extra-price">+$2000</span>
              </div>
            </div>
          </div>

          {/* ===== COMENTARIO ===== */}
          <div className="product-modal-comment">
            <label>Comentarios para este producto</label>
            <textarea
              placeholder="Ej: sin cebolla, sin sal, sin condimento..."
              value={comentarioProducto}
              onChange={(e) => setComentarioProducto(e.target.value)}
              maxLength={120}
            />
          </div>

          <button className="product-modal-add" onClick={handleAdd}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
