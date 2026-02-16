import { useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const usePedidos = () => {
  const [loading, setLoading] = useState(false);

  // ➕ Agregar productos
  const agregarProductosAlPedido = async (pedidoId, nuevosProductos) => {
    setLoading(true);
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      const snap = await getDoc(pedidoRef);
      if (!snap.exists()) return;

      const pedido = snap.data();
      const productosActualizados = [
        ...(pedido.productos || []),
        ...nuevosProductos,
      ];

      const totalActualizado = productosActualizados.reduce(
        (acc, p) => acc + (p.subtotal || p.precio * p.cantidad),
        0,
      );

      await updateDoc(pedidoRef, {
        productos: productosActualizados,
        total: totalActualizado,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Obtener pedido
  const obtenerPedidoPorId = async (pedidoId) => {
    const ref = doc(db, "pedidos", pedidoId);
    const snap = await getDoc(ref);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  };

  return {
    agregarProductosAlPedido,
    obtenerPedidoPorId,
    loading,
  };
};
