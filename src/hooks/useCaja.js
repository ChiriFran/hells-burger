import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const useCaja = () => {
  const [caja, setCaja] = useState({ ingresos: 0, gastos: 0, cierre: 0 });

  const fecha = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchCaja = async () => {
      const cajaRef = doc(db, "caja", fecha);
      const cajaSnap = await getDoc(cajaRef);
      if (cajaSnap.exists()) setCaja(cajaSnap.data());
      else setCaja({ ingresos: 0, gastos: 0, cierre: 0 });
    };
    fetchCaja();
  }, [fecha]);

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

  return { caja, agregarGasto, cerrarCaja };
};
