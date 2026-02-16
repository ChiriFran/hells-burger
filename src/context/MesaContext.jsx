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
} from "firebase/firestore";

const MesaContext = createContext();
export const useMesasContext = () => useContext(MesaContext);

export const MesaProvider = ({ children }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loadingMesas, setLoadingMesas] = useState(true);

  const unsubMesas = useRef(null);
  const unsubPedidos = useRef(null);

  // ================== SNAPSHOTS ==================
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

  // ================== CREAR MESA ==================
  const crearMesaPublica = async (nombreMesa) => {
    const ultimoNumero = mesas.length
      ? Math.max(...mesas.map((m) => m.numero || 0))
      : 0;
    const nuevoNumero = ultimoNumero + 1;

    const ref = await addDoc(collection(db, "mesas"), {
      nombre: nombreMesa,
      estado: "libre",
      pedidoActual: null,
      numero: nuevoNumero,
      createdAt: new Date(),
    });

    return { id: ref.id, nombre: nombreMesa, numero: nuevoNumero };
  };

  // ================== UPDATE MESA ==================
  const actualizarMesa = async (mesaId, data) => {
    await updateDoc(doc(db, "mesas", mesaId), data);
  };

  // ================== CREAR PEDIDO DESDE MESA ==================
  const crearPedidoMesa = async (mesa, productos) => {
    const total = productos.reduce((a, p) => a + p.subtotal, 0);

    const pedidoRef = await addDoc(collection(db, "pedidos"), {
      estado: "pendiente",
      horaInicio: new Date(),
      horaCierre: null,
      medioPago: null,
      mesaId: mesa.id,
      mesaNombre: mesa.nombre,
      productos,
      total,
      tipo: "mesa",
    });

    await actualizarMesa(mesa.id, {
      estado: "ocupada",
      pedidoActual: pedidoRef.id,
    });

    return pedidoRef.id;
  };

  // ================== 🔥 CERRAR PEDIDO ATÓMICO ==================
  const cerrarPedidoSeguro = async (pedidoId, medioPago) => {
    await runTransaction(db, async (tx) => {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      const pedidoSnap = await tx.get(pedidoRef);
      if (!pedidoSnap.exists()) throw "Pedido no existe";

      const pedido = pedidoSnap.data();
      const mesaRef = doc(db, "mesas", pedido.mesaId);

      const fecha = new Date().toISOString().slice(0, 10);
      const cajaRef = doc(db, "caja", fecha);
      const cajaSnap = await tx.get(cajaRef); // ✅ READ ANTES DE WRITE

      // calcular ingresos
      const ingresos =
        (cajaSnap.exists() ? cajaSnap.data().ingresos : 0) + pedido.total;

      // ✅ AHORA RECIÉN HACEMOS WRITES
      tx.update(pedidoRef, {
        estado: "pagado",
        medioPago,
        horaCierre: new Date(),
      });

      tx.update(mesaRef, {
        estado: "libre",
        pedidoActual: null,
      });

      tx.set(cajaRef, { ingresos, gastos: 0, cierre: 0 }, { merge: true });
    });
  };

  // ================== BORRAR MESA ==================
  const borrarMesa = async (mesa) => {
    if (mesa.estado !== "libre" || mesa.pedidoActual) {
      throw new Error("No se puede borrar una mesa ocupada");
    }
    await deleteDoc(doc(db, "mesas", mesa.id));
  };

  // ================== 🛠 WATCHDOG ANTI MESAS ZOMBIES ==================
  useEffect(() => {
    mesas.forEach(async (m) => {
      if (m.estado === "ocupada" && m.pedidoActual) {
        const existe = pedidos.find((p) => p.id === m.pedidoActual);
        if (!existe) {
          console.warn("Mesa zombie reparada:", m.id);
          await actualizarMesa(m.id, { estado: "libre", pedidoActual: null });
        }
      }
    });
  }, [mesas, pedidos]);

  /* DESPACHADO */
  const marcarDespachado = async (pedidoId, estado) => {
    const ref = doc(db, "pedidos", pedidoId);
    await updateDoc(ref, { despachado: estado });
  };

  return (
    <MesaContext.Provider
      value={{
        mesas,
        pedidos,
        loadingMesas,
        marcarDespachado,
        crearMesaPublica,
        crearPedidoMesa,
        cerrarPedidoSeguro,
        actualizarMesa,
        borrarMesa,
      }}
    >
      {children}
    </MesaContext.Provider>
  );
};
