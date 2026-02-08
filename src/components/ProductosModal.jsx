import { useState, useMemo } from "react";
import { useProductos } from "../context/ProductosContext";
import "../styles/productosModal.css";

export default function ProductosModal({ cerrar }) {
    const { productos, crearProducto, eliminarProducto } = useProductos();

    const [titulo, setTitulo] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [precio, setPrecio] = useState("");
    const [precioDoble, setPrecioDoble] = useState("");
    const [categoria, setCategoria] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const handleCrear = async () => {
        if (!titulo || !precio || !categoria) return;

        await crearProducto({
            titulo,
            subtitulo,
            categoria,
            precio: Number(precio),
            precioDoble: Number(precioDoble) || 0,
        });

        // limpiar inputs
        setTitulo("");
        setSubtitulo("");
        setPrecio("");
        setPrecioDoble("");
        setCategoria("");
    };

    // 🔎 Filtro + orden PRO
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
        <div className="productos-overlay">
            <div className="productos-modal">

                {/* HEADER */}
                <header className="productos-header">
                    <h2>Gestión de productos</h2>
                    <button className="productos-cerrar" onClick={cerrar}>✖</button>
                </header>

                <div className="productos-body">

                    {/* CREAR */}
                    <section className="productos-crear">
                        <h4>Nuevo producto</h4>

                        <div className="productos-form">
                            <input
                                placeholder="Título"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />

                            <input
                                placeholder="Subtítulo (ej: Irresistible, probala!)"
                                value={subtitulo}
                                onChange={(e) => setSubtitulo(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Precio simple"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Precio doble (opcional)"
                                value={precioDoble}
                                onChange={(e) => setPrecioDoble(e.target.value)}
                            />

                            <input
                                placeholder="Categoría (hamburguesas, papas, bebidas...)"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                            />

                            <button onClick={handleCrear}>
                                ➕ Crear producto
                            </button>
                        </div>
                    </section>

                    {/* BUSCADOR */}
                    <section className="productos-busqueda">
                        <input
                            placeholder="Buscar por nombre o categoría…"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </section>

                    {/* LISTADO */}
                    <section className="productos-listado">
                        {Object.keys(productosOrdenados).length === 0 && (
                            <p className="productos-vacio">No se encontraron productos</p>
                        )}

                        {Object.entries(productosOrdenados).map(([categoria, items]) => (
                            <div key={categoria} className="categoria-bloque">

                                <h5 className="categoria-titulo">
                                    {categoria}
                                    <span className="categoria-count">({items.length})</span>
                                </h5>

                                <ul className="productos-lista">
                                    {items.map((p) => (
                                        <li key={p.id} className="producto-item">
                                            <div className="producto-info">
                                                <strong>{p.titulo}</strong>
                                                {p.subtitulo && <small>{p.subtitulo}</small>}
                                                <span className="producto-precio">
                                                    ${p.precio}
                                                    {p.precioDoble > 0 && ` / Doble $${p.precioDoble}`}
                                                </span>
                                            </div>

                                            <button
                                                className="producto-eliminar"
                                                onClick={() => eliminarProducto(p.id)}
                                            >
                                                🗑
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}
                    </section>

                </div>
            </div>
        </div>
    );
}
