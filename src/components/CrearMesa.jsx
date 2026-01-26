import { useState, useRef } from "react";
import { doc, runTransaction, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { useMesasContext } from "../context/MesaContext";
import "../styles/crearMesa.css";

export default function CrearMesa() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const lockRef = useRef(false);

  const { mesas } = useMesasContext(); // 👈 usamos el contexto

  const crearMesa = async () => {
    if (loading || lockRef.current) return;

    const nombreLimpio = nombre.trim().toLowerCase();

    if (!nombreLimpio) {
      alert("Poné un nombre a la mesa");
      return;
    }

    // ✅ VALIDACIÓN REAL
    const existe = mesas.some(
      (m) => m.nombre?.trim().toLowerCase() === nombreLimpio
    );

    if (existe) {
      alert("⚠️ Ya existe una mesa con ese nombre");
      return;
    }

    setLoading(true);
    lockRef.current = true;

    try {
      const refConfig = doc(db, "config", "mesas");

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(refConfig);
        const ultimo = snap.exists() ? snap.data().ultimoNumero || 0 : 0;

        const nuevoNumero = ultimo + 1;
        const refMesa = doc(collection(db, "mesas"));

        transaction.set(refMesa, {
          numero: nuevoNumero,
          nombre: nombre.trim(),
          estado: "libre",
          pedidoActual: null,
          createdAt: new Date(),
        });

        transaction.set(refConfig, { ultimoNumero: nuevoNumero });
      });

      setNombre("");
      alert("Mesa creada correctamente ✅");
    } catch (error) {
      console.error("Error creando mesa:", error);
      alert("Error al crear la mesa");
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
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
          disabled={loading}
        />

        <button
          className="btn-crear-mesa"
          onClick={crearMesa}
          disabled={loading}
        >
          {loading ? "Creando..." : "➕ Agregar Mesa"}
        </button>
      </div>
    </div>
  );
}
