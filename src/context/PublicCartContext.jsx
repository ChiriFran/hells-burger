import { createContext, useContext, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import { useMesasContext } from "./MesaContext";

const PublicCartContext = createContext();
export const usePublicCart = () => useContext(PublicCartContext);

export function PublicCartProvider({ children }) {
  const { agregarPedido } = useMesasContext();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(null);

  const addItem = (producto) => {
    setItems((prev) => [
      ...prev,
      {
        ...producto,
        cartItemId: crypto.randomUUID(),
        qty: 1,
      },
    ]);
    setOpen(true);
  };

  const removeItem = (cartItemId) =>
    setItems((prev) => prev.filter((p) => p.cartItemId !== cartItemId));

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.precio * i.qty, 0);

  // 👇 ahora recibe envio
  const crearPedidoPublico = async (mesaSeleccionada, envio) => {
    if (items.length === 0 || !mesaSeleccionada) return;

    const ahora = new Date();
    const productos = items.map((p) => ({
      nombre: p.titulo,
      precio: p.precio,
      cantidad: p.qty,
      subtotal: p.precio * p.qty,
      hora: ahora.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));

    const pedido = {
      estado: "pagado",
      horaInicio: serverTimestamp(),
      horaCierre: null,
      medioPago: "efectivo",
      mesaId: mesaSeleccionada.id,
      mesaNombre: mesaSeleccionada.nombre,
      productos,
      total,
      envio, // 👈 SE GUARDA EN FIREBASE
    };

    const pedidoId = await agregarPedido(pedido);
    setPedidoCreado({ id: pedidoId, ...pedido });
  };

  return (
    <PublicCartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addItem,
        removeItem,
        clearCart,
        total,
        crearPedidoPublico,
        pedidoCreado,
        setPedidoCreado,
      }}
    >
      {children}
    </PublicCartContext.Provider>
  );
}
