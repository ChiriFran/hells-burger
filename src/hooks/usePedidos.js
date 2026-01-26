import { useState } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { useMesasContext } from "../context/MesaContext";

export const usePedidos = () => {
  const { actualizarMesa } = useMesasContext();
  const [loading, setLoading] = useState(false);

  // 📝 Crear pedido
  const crearPedido = async ({ mesaId, mesaNombre, productos }) => {
    setLoading(true);
    try {
      const total = productos.reduce(
        (acc, p) => acc + p.precio * p.cantidad,
        0
      );

      const pedido = {
        mesaId,
        mesaNombre,
        productos,
        total,
        estado: "pendiente",
        horaInicio: new Date(),
        medioPago: null,
      };

      const pedidoRef = await addDoc(collection(db, "pedidos"), pedido);

      await actualizarMesa(mesaId, {
        estado: "ocupada",
        pedidoActual: pedidoRef.id,
      });

      setLoading(false);
      return pedidoRef.id;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return null;
    }
  };

  // ➕ Agregar productos a pedido existente
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
        (acc, p) => acc + p.precio * p.cantidad,
        0
      );

      await updateDoc(pedidoRef, {
        productos: productosActualizados,
        total: totalActualizado,
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ Cerrar pedido
  const cerrarPedido = async (pedidoId, medioPago) => {
    setLoading(true);
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      const snap = await getDoc(pedidoRef);
      if (!snap.exists()) return;

      const pedido = snap.data();

      await updateDoc(pedidoRef, {
        estado: "pagado",
        medioPago,
        horaCierre: new Date(),
      });

      await actualizarMesa(pedido.mesaId, {
        estado: "libre",
        pedidoActual: null,
      });

      const fecha = new Date().toISOString().slice(0, 10);
      const cajaRef = doc(db, "caja", fecha);
      const cajaSnap = await getDoc(cajaRef);

      if (cajaSnap.exists()) {
        await updateDoc(cajaRef, {
          ingresos: cajaSnap.data().ingresos + pedido.total,
        });
      } else {
        await setDoc(cajaRef, {
          ingresos: pedido.total,
          gastos: 0,
          cierre: 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 🔍 Obtener pedido
  const obtenerPedidoPorId = async (pedidoId) => {
    try {
      const ref = doc(db, "pedidos", pedidoId);
      const snap = await getDoc(ref);
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    crearPedido,
    agregarProductosAlPedido,
    cerrarPedido,
    obtenerPedidoPorId,
    loading,
  };
};
