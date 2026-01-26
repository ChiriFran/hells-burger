import { useState } from "react";
import ProductosModal from "./ProductosModal";

export default function ModuloProductos() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="btn-secundario" onClick={() => setOpen(true)}>
                📦 Módulo de Productos
            </button>

            {open && <ProductosModal cerrar={() => setOpen(false)} />}
        </>
    );
}
