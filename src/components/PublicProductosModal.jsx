import { useEffect, useState } from "react";
import "../styles/publicProductosModal.css";

export default function PublicProductosModal({ product, onClose, onAdd }) {
  const EXTRA_PRICE = 2000;

  const [extras, setExtras] = useState({
    carne: 0,
    cheddar: false,
    papas: false,
  });

  const [comentarioProducto, setComentarioProducto] = useState("");

  /* cerrar con ESC */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!product) return null;

  /* handlers */
  const toggleExtra = (key) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addCarne = () => {
    setExtras((prev) => ({
      ...prev,
      carne: prev.carne + 1,
    }));
  };

  const removeCarne = () => {
    setExtras((prev) => ({
      ...prev,
      carne: prev.carne > 0 ? prev.carne - 1 : 0,
    }));
  };

  /* extras seleccionados */
  const extrasSeleccionados = [];

  if (extras.carne > 0)
    extrasSeleccionados.push(`Carne extra x${extras.carne}`);
  if (extras.cheddar) extrasSeleccionados.push("Cheddar");
  if (extras.papas) extrasSeleccionados.push("Papas con bacon");

  const extrasLabel =
    extrasSeleccionados.length > 0
      ? ` (+ ${extrasSeleccionados.join(", ")})`
      : "";

  const extrasTotal =
    extras.carne * EXTRA_PRICE +
    (extras.cheddar ? EXTRA_PRICE : 0) +
    (extras.papas ? EXTRA_PRICE : 0);

  const precioFinal = product.precio + extrasTotal;

  const handleAdd = () => {
    onAdd({
      ...product,
      titulo: product.titulo + extrasLabel,
      precio: precioFinal,
      comentarioProducto: comentarioProducto.trim(), // 👈 CLAVE
    });
    onClose();
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="product-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="product-modal-img">
          <img
            src={product.imagen || "https://i.postimg.cc/HkswT88n/burger.jpg"}
            alt={product.titulo}
          />
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

          {/* EXTRAS */}
          <div className="product-modal-options compact">
            <h4>Extras</h4>

            {/* Carne */}
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

          {/* COMENTARIOS */}
          <div className="product-modal-comment">
            <label>Comentarios para este producto</label>
            <textarea
              placeholder="Ej: sin cebolla, bien cocida..."
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
