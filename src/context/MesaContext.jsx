import { createContext, useContext, useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const MesaContext = createContext();

export const MesaProvider = ({ children }) => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loadingMesas, setLoadingMesas] = useState(true);

  const unsubscribeMesasRef = useRef(null);
  const unsubscribePedidosRef = useRef(null);

  const subscribeMesas = () => {
    setLoadingMesas(true);

    // cortar listener anterior si existe
    if (unsubscribeMesasRef.current) {
      unsubscribeMesasRef.current();
    }

    unsubscribeMesasRef.current = onSnapshot(
      collection(db, "mesas"),
      (snapshot) => {
        setMesas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingMesas(false);
      },
      (error) => {
        console.error("Error snapshot mesas:", error);
        setLoadingMesas(false);
      }
    );
  };

  const subscribePedidos = () => {
    if (unsubscribePedidosRef.current) {
      unsubscribePedidosRef.current();
    }

    unsubscribePedidosRef.current = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
  };

  useEffect(() => {
    subscribeMesas();
    subscribePedidos();

    return () => {
      unsubscribeMesasRef.current?.();
      unsubscribePedidosRef.current?.();
    };
  }, []);

  // 🔄 para botón "Sincronizar"
  const refetchMesas = () => {
    subscribeMesas();
  };

  const actualizarMesa = async (mesaId, data) => {
    await updateDoc(doc(db, "mesas", mesaId), data);
  };

  const agregarPedido = async (pedidoData) => {
    const ref = await addDoc(collection(db, "pedidos"), pedidoData);
    await actualizarMesa(pedidoData.mesaId, {
      estado: "ocupada",
      pedidoActual: ref.id,
    });
    return ref.id;
  };

  const borrarMesa = async (mesa) => {
    if (mesa.estado === "ocupada" || mesa.pedidoActual) {
      throw new Error("No se puede borrar una mesa ocupada");
    }
    await deleteDoc(doc(db, "mesas", mesa.id));
  };

  return (
    <MesaContext.Provider
      value={{
        mesas,
        pedidos,
        loadingMesas,
        refetchMesas,
        actualizarMesa,
        agregarPedido,
        borrarMesa,
      }}
    >
      {children}
    </MesaContext.Provider>
  );
};

export const useMesasContext = () => useContext(MesaContext);
