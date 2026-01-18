import { useState } from "react";
import { doc, runTransaction, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/CrearMesa.css";

export default function CrearMesa() {
  const [nombre, setNombre] = useState("");

  const crearMesa = async () => {
    if (!nombre.trim()) {
      alert("Poné un nombre a la mesa");
      return;
    }

    const refConfig = doc(db, "config", "mesas");

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(refConfig);

      let ultimo = 0;
      if (snap.exists()) {
        ultimo = snap.data().ultimoNumero || 0;
      }

      const nuevoNumero = ultimo + 1;
      const refMesa = doc(collection(db, "mesas"));

      transaction.set(refMesa, {
        numero: nuevoNumero,
        nombre: nombre.trim(),
        estado: "libre",
        pedidoActual: null,
      });

      transaction.set(refConfig, { ultimoNumero: nuevoNumero });
      alert(`Mesa "${nombre}" creada`);
      setNombre("");
    });
  };

  return (
    <div className="crear-mesa-container">
      <h3 className="crear-mesa-title">Crear Mesa</h3>

      <div className="crear-mesa-form">
        <input
          type="text"
          placeholder="Nombre visible (ej: Ventana, Barra 1)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn-crear-mesa" onClick={crearMesa}>
          ➕ Agregar Mesa
        </button>
      </div>
    </div>
  );
}
