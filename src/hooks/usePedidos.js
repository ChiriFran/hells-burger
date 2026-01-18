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

  const crearPedido = async ({ mesaId, mesaNombre, productos }) => {
    setLoading(true);
    try {
      const total = productos.reduce(
        (acc, p) => acc + p.precio * p.cantidad,
        0
      );

      const pedido = {
        mesaId,
        mesaNombre, // 👈 ahora se guarda
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

  const cerrarPedido = async (pedidoId, medioPago) => {
    setLoading(true);
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      const pedidoSnap = await getDoc(pedidoRef);
      if (!pedidoSnap.exists()) return;

      const pedido = pedidoSnap.data();

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
        const caja = cajaSnap.data();
        await updateDoc(cajaRef, { ingresos: caja.ingresos + pedido.total });
      } else {
        await setDoc(cajaRef, { ingresos: pedido.total, gastos: 0, cierre: 0 });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

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

  return { crearPedido, cerrarPedido, obtenerPedidoPorId, loading };
};
