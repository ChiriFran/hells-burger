import { useEffect, useState } from "react";
import "../styles/publicProductosModal.css";

export default function PublicProductosModal({ product, onClose, onAdd }) {
  const EXTRA_PRICE = 2000;

  const [extras, setExtras] = useState({
    carne: false,
    cheddar: false,
    papas: false,
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!product) return null;

  const extrasSeleccionados = [];
  let extrasLabel = "";

  if (extras.carne) extrasSeleccionados.push("Carne extra");
  if (extras.cheddar) extrasSeleccionados.push("Cheddar");
  if (extras.papas) extrasSeleccionados.push("Papas con bacon");

  if (extrasSeleccionados.length > 0) {
    extrasLabel = ` (+ ${extrasSeleccionados.join(", ")})`;
  }

  const extrasTotal = extrasSeleccionados.length * EXTRA_PRICE;
  const precioFinal = product.precio + extrasTotal;

  const toggleExtra = (key) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAdd = () => {
    onAdd({
      ...product,

      // ⬅️ IMPORTANTE: el nombre ya incluye los extras
      titulo: product.titulo + extrasLabel,

      // precio final ya cerrado
      precio: precioFinal,
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
            src={
              product.imagen ||
              "https://i.postimg.cc/j2VVh0Bf/imagen-de-producto.png"
            }
            alt={product.titulo}
          />
        </div>

        <div className="product-modal-info">
          <h2>{product.titulo}</h2>

          <p className="product-modal-price">{product.subtitulo}</p>

          <p className="product-modal-price">
            ${precioFinal}
            {extrasTotal > 0 && (
              <span className="extras-price"> (+${extrasTotal})</span>
            )}
          </p>

          <div className="product-modal-options">
            <h4>Extras</h4>

            <label>
              <input
                type="checkbox"
                checked={extras.carne}
                onChange={() => toggleExtra("carne")}
              />
              Carne extra (+$2000)
            </label>

            <label>
              <input
                type="checkbox"
                checked={extras.cheddar}
                onChange={() => toggleExtra("cheddar")}
              />
              Cheddar (+$2000)
            </label>

            <label>
              <input
                type="checkbox"
                checked={extras.papas}
                onChange={() => toggleExtra("papas")}
              />
              Papas con bacon (+$2000)
            </label>
          </div>

          <button className="product-modal-add" onClick={handleAdd}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
