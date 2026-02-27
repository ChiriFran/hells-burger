import { createContext, useContext, useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

const MesaContext = createContext();
export const useMesasContext = () => useContext(MesaContext);

export const MesaProvider = ({ children }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loadingMesas, setLoadingMesas] = useState(true);

  const unsubMesas = useRef(null);
  const unsubPedidos = useRef(null);

  // ================= SNAPSHOTS =================
  useEffect(() => {
    unsubMesas.current = onSnapshot(collection(db, "mesas"), (snap) => {
      setMesas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingMesas(false);
    });

    unsubPedidos.current = onSnapshot(collection(db, "pedidos"), (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMesas.current?.();
      unsubPedidos.current?.();
    };
  }, []);

  // ================= CREAR MESA =================
  const crearMesa = async (nombre) => {
    const ref = await addDoc(collection(db, "mesas"), {
      nombre,
      estado: "libre",
      pedidoActual: null,
      createdAt: serverTimestamp(),
    });

    return { id: ref.id, nombre };
  };

  // ================= CREAR PEDIDO UNIFICADO =================
  const crearPedido = async ({
    mesa,
    productos,
    total,
    tipoEntrega = "salon",
    envio = null,
    comentarios = "",
    cliente = "",
    tipo = "salon", // salon | publico | delivery
  }) => {
    if (!mesa?.id) throw new Error("Mesa inválida");

    const pedidoRef = await addDoc(collection(db, "pedidos"), {
      estado: "pendiente",
      despachado: false,
      horaInicio: serverTimestamp(),
      horaCierre: null,
      medioPago: null,

      mesaId: mesa.id,
      mesaNombre: mesa.nombre,

      productos,
      total,

      tipoEntrega,
      envio,
      comentarios,
      cliente,
      tipo,
    });

    await updateDoc(doc(db, "mesas", mesa.id), {
      estado: "ocupada",
      pedidoActual: pedidoRef.id,
    });

    return pedidoRef.id;
  };

  // ================= MARCAR DESPACHADO =================
  const marcarDespachado = async (pedidoId, estado) => {
    await updateDoc(doc(db, "pedidos", pedidoId), {
      despachado: estado,
      estado: estado ? "despachado" : "pendiente",
    });
  };

  // ================= CERRAR PEDIDO ATÓMICO =================
  const cerrarPedido = async (pedidoId, medioPago) => {
    await runTransaction(db, async (tx) => {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      const pedidoSnap = await tx.get(pedidoRef);

      if (!pedidoSnap.exists()) throw new Error("Pedido no existe");

      const pedido = pedidoSnap.data();
      const mesaRef = doc(db, "mesas", pedido.mesaId);

      const fecha = new Date().toISOString().slice(0, 10);
      const cajaRef = doc(db, "caja", fecha);
      const cajaSnap = await tx.get(cajaRef);

      const ingresos =
        (cajaSnap.exists() ? cajaSnap.data().ingresos : 0) + pedido.total;

      tx.update(pedidoRef, {
        estado: "pagado",
        medioPago,
        horaCierre: serverTimestamp(),
      });

      tx.update(mesaRef, {
        estado: "libre",
        pedidoActual: null,
      });

      tx.set(cajaRef, { ingresos, gastos: 0, cierre: 0 }, { merge: true });
    });
  };

  // ================= BORRAR MESA =================
  const borrarMesa = async (mesa) => {
    if (mesa.estado !== "libre" || mesa.pedidoActual)
      throw new Error("Mesa ocupada");

    await deleteDoc(doc(db, "mesas", mesa.id));
  };

  return (
    <MesaContext.Provider
      value={{
        mesas,
        pedidos,
        loadingMesas,
        crearMesa,
        crearPedido,
        marcarDespachado,
        cerrarPedido,
        borrarMesa,
      }}
    >
      {children}
    </MesaContext.Provider>
  );
};
