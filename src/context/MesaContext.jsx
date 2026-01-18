import { createContext, useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    const unsubscribeMesas = onSnapshot(collection(db, "mesas"), (snapshot) => {
      setMesas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribePedidos = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        setPedidos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubscribeMesas();
      unsubscribePedidos();
    };
  }, []);

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
      value={{ mesas, pedidos, actualizarMesa, agregarPedido, borrarMesa }}
    >
      {children}
    </MesaContext.Provider>
  );
};

export const useMesasContext = () => useContext(MesaContext);