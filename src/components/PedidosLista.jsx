import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "../styles/PedidosLista.css";

export default function PedidosLista() {
  const [pedidos, setPedidos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // pedidos visibles iniciales

  useEffect(() => {
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef, orderBy("horaInicio", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(lista);
    });

    return () => unsubscribe();
  }, []);

  const cargarMas = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const pedidosVisibles = pedidos.slice(0, visibleCount);

  return (
    <div className="pedidos-lista-container">
      <h2 className="pedidos-lista-title">Pedidos</h2>
      {pedidos.length === 0 ? (
        <p className="pedidos-lista-empty">No hay pedidos recientes</p>
      ) : (
        <>
          <ul className="pedidos-lista">
            {pedidosVisibles.map((pedido) => (
              <li key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <span className="pedido-mesa">
                    {pedido.mesaNombre || "Mesa"} — ID: {pedido.mesaId}
                  </span>
                  <span className="pedido-estado">
                    {pedido.estado === "pagado" ? "✅" : "❌"} {pedido.estado}
                  </span>
                </div>

                <ul className="pedido-productos">
                  {pedido.productos.map((prod, index) => (
                    <li key={index} className="pedido-producto">
                      <span>
                        {prod.cantidad} x {prod.nombre}
                      </span>
                      <span>${prod.subtotal}</span>
                    </li>
                  ))}
                </ul>

                <div className="pedido-footer">
                  <span>Total: ${pedido.total}</span>
                  <span>Pago: {pedido.medioPago}</span>
                </div>
              </li>
            ))}
          </ul>

          {visibleCount < pedidos.length && (
            <button className="cargar-mas-btn" onClick={cargarMas}>
              Cargar más
            </button>
          )}
        </>
      )}
    </div>
  );
}
