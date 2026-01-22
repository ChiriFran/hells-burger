import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export const useCaja = () => {
  const [caja, setCaja] = useState({
    ingresos: 0,
    gastos: 0,
    cierre: 0,
  });

  const [cajas, setCajas] = useState([]); // 👈 HISTÓRICO
  const [loading, setLoading] = useState(true);

  const fecha = new Date().toISOString().slice(0, 10);

  /* ================= CAJA DEL DÍA ================= */
  useEffect(() => {
    const fetchCaja = async () => {
      const cajaRef = doc(db, "caja", fecha);
      const cajaSnap = await getDoc(cajaRef);

      if (cajaSnap.exists()) {
        setCaja(cajaSnap.data());
      } else {
        setCaja({ ingresos: 0, gastos: 0, cierre: 0 });
      }
    };

    fetchCaja();
  }, [fecha]);

  /* ================= HISTÓRICO COMPLETO ================= */
  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "caja"));

        const data = snapshot.docs.map((doc) => ({
          fecha: doc.id,        // 👈 ID = fecha
          ...doc.data(),        // ingresos, gastos, cierre
        }));

        setCajas(data);
      } catch (error) {
        console.error("Error cargando histórico de caja:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCajas();
  }, []);

  /* ================= ACCIONES ================= */
  const agregarGasto = async (monto) => {
    const cajaRef = doc(db, "caja", fecha);
    await updateDoc(cajaRef, { gastos: caja.gastos + monto });

    setCaja((prev) => ({ ...prev, gastos: prev.gastos + monto }));
  };

  const cerrarCaja = async () => {
    const cajaRef = doc(db, "caja", fecha);
    const cierre = caja.ingresos - caja.gastos;

    await updateDoc(cajaRef, { cierre });

    setCaja((prev) => ({ ...prev, cierre }));
  };

  return {
    caja,        // día actual
    cajas,       // 👈 histórico completo
    loading,
    agregarGasto,
    cerrarCaja,
  };
};
