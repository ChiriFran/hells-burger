import { useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const usePedidos = () => {
  const [loading, setLoading] = useState(false);

  // ==============================
  // ➕ AGREGAR PRODUCTOS
  // ==============================
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
    } catch (error) {
      console.error("Error agregando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔥 ACTUALIZAR PRODUCTOS COMPLETOS
  // ==============================
  const actualizarPedidoProductos = async (pedidoId, productosActualizados) => {
    setLoading(true);
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);

      const totalActualizado = productosActualizados.reduce(
        (acc, p) => acc + (p.subtotal || p.precio * p.cantidad),
        0,
      );

      await updateDoc(pedidoRef, {
        productos: productosActualizados,
        total: totalActualizado,
      });
    } catch (error) {
      console.error("Error actualizando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔍 OBTENER PEDIDO
  // ==============================
  const obtenerPedidoPorId = async (pedidoId) => {
    try {
      const ref = doc(db, "pedidos", pedidoId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo pedido:", error);
      return null;
    }
  };

  return {
    agregarProductosAlPedido,
    actualizarPedidoProductos, // 🔥 IMPORTANTE
    obtenerPedidoPorId,
    loading,
  };
};
