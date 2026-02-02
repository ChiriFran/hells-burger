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

  /* =========================
     🔄 SUSCRIPCIONES
  ========================= */

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

  const subscribePedidos = () => {
    unsubscribePedidosRef.current?.();

    unsubscribePedidosRef.current = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error("Error snapshot pedidos:", error);
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

  /* =========================
     ➕ CREAR MESA
  ========================= */

  const crearMesaPublica = async (nombreMesa) => {
    const ultimoNumero = mesas.length
      ? Math.max(...mesas.map((m) => m.numero || 0))
      : 0;

    const nuevoNumero = ultimoNumero + 1;

    const mesaRef = await addDoc(collection(db, "mesas"), {
      nombre: nombreMesa,
      estado: "libre",
      pedidoActual: null,
      numero: nuevoNumero,
      createdAt: new Date(),
    });

    return {
      id: mesaRef.id,
      nombre: nombreMesa,
      numero: nuevoNumero,
      estado: "libre",
      pedidoActual: null,
    };
  };

  /* =========================
     ✏️ ACTUALIZAR MESA (CLAVE)
  ========================= */

  const actualizarMesa = async (mesaId, data) => {
    await updateDoc(doc(db, "mesas", mesaId), data);
  };

  /* =========================
     ➕ CREAR PEDIDO DESDE MESA
  ========================= */

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

    await actualizarMesa(mesa.id, {
      estado: "ocupada",
      pedidoActual: pedidoRef.id,
    });

    return pedidoRef.id;
  };

  /* =========================
     ❌ BORRAR MESA
  ========================= */

  const borrarMesa = async (mesa) => {
    if (mesa.estado !== "libre" || mesa.pedidoActual) {
      throw new Error("No se puede borrar una mesa ocupada");
    }

    await deleteDoc(doc(db, "mesas", mesa.id));
  };

  /* =========================
     PROVIDER
  ========================= */

  return (
    <MesaContext.Provider
      value={{
        mesas,
        pedidos,
        loadingMesas,
        crearMesaPublica,
        agregarPedidoPublico,
        actualizarMesa, // 👈 AHORA EXISTE
        borrarMesa,
      }}
    >
      {children}
    </MesaContext.Provider>
  );
};

export const useMesasContext = () => useContext(MesaContext);
