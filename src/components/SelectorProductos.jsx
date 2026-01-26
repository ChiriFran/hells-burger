import { useState, useMemo } from "react";
import { useProductos } from "../context/ProductosContext";
import "../styles/selectorProductos.css";

export default function SelectorProductos({ onSelect, cerrar }) {
    const { productos } = useProductos();
    const [busqueda, setBusqueda] = useState("");

    // 🔎 filtro + orden + agrupado (idéntico criterio al modal de productos)
    const productosOrdenados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();

        const filtrados = productos.filter((p) =>
            p.titulo.toLowerCase().includes(texto) ||
            p.categoria?.toLowerCase().includes(texto)
        );

        filtrados.sort((a, b) => {
            const catA = (a.categoria || "").toLowerCase();
            const catB = (b.categoria || "").toLowerCase();

            if (catA !== catB) return catA.localeCompare(catB);
            return a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase());
        });

        return filtrados.reduce((acc, p) => {
            const cat = p.categoria || "Sin categoría";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});
    }, [productos, busqueda]);

    return (
        <div className="selector-overlay">
            <div className="selector-modal">

                {/* HEADER */}
                <header className="selector-header">
                    <h3>Seleccionar producto</h3>
                    <button className="selector-cerrar" onClick={cerrar}>✖</button>
                </header>

                {/* BUSCADOR */}
                <div className="selector-busqueda">
                    <input
                        placeholder="Buscar producto o categoría…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* LISTADO */}
                <div className="selector-body">
                    {Object.keys(productosOrdenados).length === 0 && (
                        <p className="selector-vacio">No se encontraron productos</p>
                    )}

                    {Object.entries(productosOrdenados).map(
                        ([categoria, items]) => (
                            <div key={categoria} className="selector-categoria">

                                <h5 className="selector-categoria-titulo">
                                    {categoria}
                                    <span className="selector-categoria-count">
                                        ({items.length})
                                    </span>
                                </h5>

                                <ul className="selector-lista">
                                    {items.map((p) => (
                                        <li
                                            key={p.id}
                                            className="selector-item"
                                            onClick={() => onSelect(p)}
                                        >
                                            <div className="selector-item-info">
                                                <strong>{p.titulo}</strong>
                                                <span className="selector-precio">
                                                    ${p.precio}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        )
                    )}
                </div>

            </div>
        </div>
    );
}
