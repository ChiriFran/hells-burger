import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  arrayUnion,
  serverTimestamp,
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

  /* ================= FECHA LOCAL ARGENTINA ================= */
  const getFechaLocal = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const fecha = getFechaLocal();

  /* ================= FUNCIÓN CENTRAL DE CARGA ================= */
  const cargarDatos = useCallback(async () => {
    setLoading(true);

    try {
      /* 🔹 Caja del día */
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
          createdAt: serverTimestamp(),
        };

        await setDoc(ref, inicial);
        setCaja(inicial);
      }

      /* 🔹 Histórico */
      const snapshot = await getDocs(collection(db, "caja"));

      const data = snapshot.docs.map((d) => ({
        fecha: d.id, // ID = YYYY-MM-DD
        ...d.data(),
      }));

      // 🔥 ORDEN CORRECTO SIN new Date()
      data.sort((a, b) => b.fecha.localeCompare(a.fecha));

      setCajas(data);
    } catch (error) {
      console.error("Error cargando caja:", error);
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  /* ================= LOAD INICIAL ================= */
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /* ================= INGRESOS ================= */
  const agregarIngreso = async (monto) => {
    const ref = doc(db, "caja", fecha);
    const nuevo = (caja.ingresos || 0) + monto;

    await setDoc(
      ref,
      {
        ingresos: nuevo,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    setCaja((prev) => ({ ...prev, ingresos: nuevo }));
  };

  /* ================= GASTOS ================= */
  const agregarGasto = async ({ monto, descripcion }) => {
    const ref = doc(db, "caja", fecha);
    const nuevoTotal = (caja.gastos || 0) + monto;

    const gastoObj = {
      monto,
      descripcion,
      fechaHora: new Date().toISOString(), // esto está bien para detalle
    };

    await setDoc(
      ref,
      {
        gastos: nuevoTotal,
        gastosDetalle: arrayUnion(gastoObj),
        updatedAt: serverTimestamp(),
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

    await setDoc(
      ref,
      {
        cierre,
        fechaCierre: serverTimestamp(),
      },
      { merge: true },
    );

    setCaja((prev) => ({ ...prev, cierre }));
  };

  return {
    caja,
    cajas,
    loading,
    agregarIngreso,
    agregarGasto,
    cerrarCaja,
    refetch: cargarDatos,
  };
};
