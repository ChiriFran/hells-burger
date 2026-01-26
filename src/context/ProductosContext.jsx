import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    onSnapshot,
    doc
} from "firebase/firestore";

const ProductosContext = createContext();

export function ProductosProvider({ children }) {
    const [productos, setProductos] = useState([]);

    // 🔄 Escuchar productos en tiempo real
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "productos"),
            (snapshot) => {
                setProductos(
                    snapshot.docs.map((docu) => ({
                        id: docu.id,
                        ...docu.data(),
                    }))
                );
            }
        );

        return () => unsub();
    }, []);

    // ➕ Crear
    const crearProducto = async (producto) => {
        await addDoc(collection(db, "productos"), producto);
    };

    // ✏️ Editar
    const editarProducto = async (id, data) => {
        const ref = doc(db, "productos", id);
        await updateDoc(ref, data);
    };

    // 🗑 Eliminar (🔥 ACÁ ESTABA EL ERROR)
    const eliminarProducto = async (id) => {
        const ref = doc(db, "productos", id);
        await deleteDoc(ref);
    };

    return (
        <ProductosContext.Provider
            value={{
                productos,
                crearProducto,
                editarProducto,
                eliminarProducto,
            }}
        >
            {children}
        </ProductosContext.Provider>
    );
}

export const useProductos = () => useContext(ProductosContext);
