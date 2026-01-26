import { useMesasContext } from "../context/MesaContext";
import Mesa from "./Mesa";
import "../styles/mesasBoard.css";

export default function MesasBoard({ setMesaSeleccionada }) {
  const { mesas, loadingMesas, refetchMesas } = useMesasContext();

  if (loadingMesas) {
    return <p className="mesas-loading">Sincronizando mesas…</p>;
  }

  if (mesas.length === 0) {
    return (
      <div className="mesas-empty">
        <p>No se encontraron mesas cargadas</p>
        <button className="btn-sync" onClick={refetchMesas}>
          🔄 Sincronizar mesas
        </button>
      </div>
    );
  }

  return (
    <div className="mesas-board-wrapper">
      <div className="mesas-board-container">
        {mesas.map((m) => (
          <Mesa
            key={m.id}
            mesa={m}
            setMesaSeleccionada={setMesaSeleccionada}
          />
        ))}
      </div>
    </div>
  );
}
