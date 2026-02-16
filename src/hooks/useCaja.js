import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  arrayUnion,
} from "firebase/firestore";

export const useCaja = () => {
  const [caja, setCaja] = useState({
    ingresos: 0,
    gastos: 0,
    cierre: 0,
    gastosDetalle: [],
  });

  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fecha = new Date().toISOString().slice(0, 10);

  /* ================= CAJA DEL DÍA ================= */
  useEffect(() => {
    const fetchCaja = async () => {
      const ref = doc(db, "caja", fecha);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setCaja(snap.data());
      } else {
        const inicial = {
          ingresos: 0,
          gastos: 0,
          cierre: 0,
          gastosDetalle: [],
        };
        await setDoc(ref, inicial);
        setCaja(inicial);
      }
    };

    fetchCaja();
  }, [fecha]);

  /* ================= HISTÓRICO ================= */
  useEffect(() => {
    const fetchCajas = async () => {
      const snapshot = await getDocs(collection(db, "caja"));
      const data = snapshot.docs.map((d) => ({
        fecha: d.id,
        ...d.data(),
      }));
      setCajas(data);
      setLoading(false);
    };

    fetchCajas();
  }, []);

  /* ================= INGRESOS ================= */
  const agregarIngreso = async (monto) => {
    const ref = doc(db, "caja", fecha);
    const nuevo = (caja.ingresos || 0) + monto;

    await setDoc(ref, { ingresos: nuevo }, { merge: true });
    setCaja((prev) => ({ ...prev, ingresos: nuevo }));
  };

  /* ================= GASTOS ================= */
  const agregarGasto = async ({ monto, descripcion }) => {
    const ref = doc(db, "caja", fecha);
    const nuevoTotal = (caja.gastos || 0) + monto;

    const gastoObj = {
      monto,
      descripcion,
      fechaHora: new Date().toISOString(),
    };

    await setDoc(
      ref,
      {
        gastos: nuevoTotal,
        gastosDetalle: arrayUnion(gastoObj),
      },
      { merge: true },
    );

    setCaja((prev) => ({
      ...prev,
      gastos: nuevoTotal,
      gastosDetalle: [...(prev.gastosDetalle || []), gastoObj],
    }));
  };

  /* ================= CIERRE ================= */
  const cerrarCaja = async () => {
    const ref = doc(db, "caja", fecha);
    const cierre = (caja.ingresos || 0) - (caja.gastos || 0);

    await setDoc(ref, { cierre }, { merge: true });
    setCaja((prev) => ({ ...prev, cierre }));
  };

  return {
    caja,
    cajas,
    loading,
    agregarIngreso,
    agregarGasto,
    cerrarCaja,
  };
};
