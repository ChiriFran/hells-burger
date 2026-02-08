import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

import "../styles/publicProductos.css";
import { usePublicCart } from "../context/PublicCartContext";

import PublicProductosModal from "./PublicProductosModal";

export default function PublicProductos() {
  const [menuData, setMenuData] = useState({});
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addItem, setOpen } = usePublicCart();

  /* ================== FETCH PRODUCTOS ================== */
  useEffect(() => {
    const fetchMenu = async () => {
      const snap = await getDocs(collection(db, "productos"));
      const grouped = {};

      snap.docs.forEach((doc) => {
        const {
          titulo,
          subtitulo,
          categoria,
          precio,
          precioDoble, // ✅ MUY IMPORTANTE
          imagen,
        } = doc.data();

        if (!grouped[categoria]) grouped[categoria] = [];

        grouped[categoria].push({
          id: doc.id,
          titulo,
          subtitulo: subtitulo || "",
          precio: Number(precio) || 0,
          precioDoble: Number(precioDoble) || 0, // ✅ PASA BIEN
          imagen,
        });
      });

      setMenuData(grouped);
      setMenuLoading(false);
    };

    fetchMenu();
  }, []);

  /* ================== HANDLERS ================== */
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (item) => {
    addItem(item);
    setOpen(true);
    setSelectedProduct(null);
  };

  /* ================== LOADING ================== */
  if (menuLoading) {
    return <div className="public-menu-loading">Cargando menú…</div>;
  }

  /* ================== FILTROS ================== */
  const filteredCategories = selectedCategory
    ? { [selectedCategory]: menuData[selectedCategory] }
    : menuData;

  const categoryOrder = Object.keys(filteredCategories).sort((a, b) => {
    if (a.toLowerCase().includes("hamburguesa")) return -1;
    if (b.toLowerCase().includes("hamburguesa")) return 1;
    if (a.toLowerCase().includes("bebida")) return 1;
    if (b.toLowerCase().includes("bebida")) return -1;
    return 0;
  });

  /* ================== RENDER ================== */
  return (
    <>
      <section className="public-menu-container">
        <h2 className="public-menu-title">Menú</h2>

        <h2 className="public-menu-subtitle">🔥Del infierno a tu mesa🔥</h2>

        {/* CATEGORÍAS */}
        <div className="public-menu-categories-buttons">
          <button
            className="public-menu-category-btn"
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </button>

          {Object.keys(menuData).map((categoria) => (
            <button
              key={categoria}
              className="public-menu-category-btn"
              onClick={() => setSelectedCategory(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>

        {/* PRODUCTOS */}
        {categoryOrder.map((categoria) => (
          <article key={categoria} className="public-menu-category">
            <h3 className="public-menu-category-title">{categoria}</h3>

            <ul className="public-menu-list">
              {filteredCategories[categoria].map((item) => (
                <li
                  key={item.id}
                  className="public-menu-item"
                  onClick={() => handleOpenModal(item)}
                >
                  <div className="public-menu-item-img">
                    <img
                      src={
                        item.imagen ||
                        "https://i.postimg.cc/HkswT88n/burger.jpg"
                      }
                      alt={item.titulo}
                      loading="lazy"
                    />
                  </div>

                  <div className="public-menu-item-info">
                    <span className="public-menu-item-title">
                      {item.titulo}
                    </span>

                    {item.subtitulo && (
                      <span className="public-menu-item-subtitle">
                        {item.subtitulo}
                      </span>
                    )}

                    <span className="public-menu-item-price">
                      ${item.precio}
                    </span>
                  </div>

                  <button
                    className="public-menu-item-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                    aria-label={`Agregar ${item.titulo}`}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* MODAL */}
      {selectedProduct && (
        <PublicProductosModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddToCart}
        />
      )}
    </>
  );
}
