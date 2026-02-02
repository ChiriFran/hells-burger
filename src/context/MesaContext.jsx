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

  // 🔄 Suscripción a mesas
  const subscribeMesas = () => {
    setLoadingMesas(true);
    unsubscribeMesasRef.current?.();

    unsubscribeMesasRef.current = onSnapshot(
      collection(db, "mesas"),
      (snapshot) => {
        setMesas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingMesas(false);
      },
      (error) => {
        console.error("Error snapshot mesas:", error);
        setLoadingMesas(false);
      },
    );
  };

  // 🔄 Suscripción a pedidos
  const subscribePedidos = () => {
    unsubscribePedidosRef.current?.();

    unsubscribePedidosRef.current = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
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

  // ➕ Crear mesa
  const crearMesaPublica = async (nombreMesa) => {
    const ultimoNumero = mesas.length
      ? Math.max(...mesas.map((m) => m.numero || 0))
      : 0;

    const nuevoNumero = ultimoNumero + 1;

    const mesaRef = await addDoc(collection(db, "mesas"), {
      nombre: nombreMesa,
      estado: "libre",
      createdAt: new Date(),
      pedidoActual: null,
      numero: nuevoNumero,
    });

    return { id: mesaRef.id, nombre: nombreMesa, numero: nuevoNumero };
  };

  // ➕ Crear pedido y vincular mesa
  const agregarPedidoPublico = async (mesa, items) => {
    const horaInicio = new Date();
    const horaStr = horaInicio.toLocaleTimeString();

    const productos = items.map((i) => ({
      nombre: i.titulo,
      precio: Number(i.precio),
      cantidad: Number(i.qty),
      subtotal: Number(i.precio) * Number(i.qty),
      hora: horaStr,
    }));

    const pedidoRef = await addDoc(collection(db, "pedidos"), {
      estado: "pendiente",
      horaInicio,
      horaCierre: null,
      medioPago: null,
      mesaId: mesa.id,
      mesaNombre: mesa.nombre,
      productos,
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
    });

    await updateDoc(doc(db, "mesas", mesa.id), {
      pedidoActual: pedidoRef.id,
      estado: "ocupada",
    });

    return { ...mesa, pedidoId: pedidoRef.id };
  };

  // ❌ Borrar mesa (solo si está libre)
  const borrarMesa = async (mesa) => {
    if (mesa.estado !== "libre" || mesa.pedidoActual) {
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
        crearMesaPublica,
        agregarPedidoPublico,
        borrarMesa,
      }}
    >
      {children}
    </MesaContext.Provider>
  );
};

export const useMesasContext = () => useContext(MesaContext);
