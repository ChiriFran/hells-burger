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

  useEffect(() => {
    const fetchMenu = async () => {
      const snap = await getDocs(collection(db, "productos"));
      const grouped = {};

      snap.docs.forEach((doc) => {
        const {
          titulo,
          subtitulo, // ✅ AHORA SÍ
          categoria,
          precio,
          imagen,
        } = doc.data();

        if (!grouped[categoria]) grouped[categoria] = [];

        grouped[categoria].push({
          id: doc.id,
          titulo,
          subtitulo: subtitulo || "", // ✅ SEGURIDAD
          precio,
          imagen,
        });
      });

      setMenuData(grouped);
      setMenuLoading(false);
    };

    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addItem(item);
    setOpen(true);
    setSelectedProduct(null);
  };

  if (menuLoading) {
    return <div className="public-menu-loading">Cargando menú…</div>;
  }

  const filteredCategories = selectedCategory
    ? { [selectedCategory]: menuData[selectedCategory] }
    : menuData;

  // Ordenar categorías
  const categoryOrder = Object.keys(filteredCategories).sort((a, b) => {
    if (a.toLowerCase().includes("hamburguesa")) return -1;
    if (b.toLowerCase().includes("hamburguesa")) return 1;
    if (a.toLowerCase().includes("bebida")) return 1;
    if (b.toLowerCase().includes("bebida")) return -1;
    return 0;
  });

  return (
    <>
      <section className="public-menu-container">
        <h2 className="public-menu-title">Menú</h2>

        {/* Categorías */}
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

        {/* Productos */}
        {categoryOrder.map((categoria) => (
          <article key={categoria} className="public-menu-category">
            <h3 className="public-menu-category-title">{categoria}</h3>

            <ul className="public-menu-list">
              {filteredCategories[categoria].map((item) => (
                <li key={item.id} className="public-menu-item">
                  <div className="public-menu-item-img">
                    <img
                      src={
                        item.imagen ||
                        "https://i.postimg.cc/jSXMXrPy/burger.jpg"
                      }
                      alt={item.titulo}
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
                    onClick={() => setSelectedProduct(item)}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Modal */}
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
