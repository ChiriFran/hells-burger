import React, { useEffect, useState } from "react";
import { useMesasContext } from "../context/MesaContext";
import DashboardEstadisticasAvanzado from "./DashboardEstadisticasAvanzado";
import "../styles/dashboardEstadisticas.css";

export default function DashboardEstadisticas() {
  const { mesas = [], pedidos = [] } = useMesasContext();
  const [stats, setStats] = useState({});
  const [modoDiario, setModoDiario] = useState(true);

  useEffect(() => {
    const hoy = new Date();
    const hoyAnio = hoy.getFullYear();
    const hoyMes = hoy.getMonth();
    const hoyDia = hoy.getDate();

    const pedidosFiltrados = modoDiario
      ? pedidos.filter((p) => {
          if (!p.horaInicio) return false;

          const fechaInicio = p.horaInicio.toDate
            ? p.horaInicio.toDate()
            : new Date(p.horaInicio);

          return (
            fechaInicio.getFullYear() === hoyAnio &&
            fechaInicio.getMonth() === hoyMes &&
            fechaInicio.getDate() === hoyDia
          );
        })
      : pedidos;

    const libres = mesas.filter((m) => m.estado === "libre").length;
    const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
    const activos = pedidosFiltrados.filter(
      (p) => p.estado !== "pagado",
    ).length;
    const completados = pedidosFiltrados.filter(
      (p) => p.estado === "pagado",
    ).length;

    const totalProductos = pedidosFiltrados.reduce(
      (acc, p) => acc + (p.productos?.length || 0),
      0,
    );

    const ingresos = pedidosFiltrados
      .filter((p) => p.estado === "pagado")
      .reduce((acc, p) => acc + (p.total || 0), 0);

    const promedioTicket = completados ? ingresos / completados : 0;

    const efectivoTotal = pedidosFiltrados
      .filter((p) => p.medioPago === "efectivo")
      .reduce((acc, p) => acc + (p.total || 0), 0);

    setStats({
      libres,
      ocupadas,
      activos,
      completados,
      totalProductos,
      ingresos,
      promedioTicket,
      efectivoTotal,
    });
  }, [mesas, pedidos, modoDiario]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          📊 Estadísticas {modoDiario ? "del Día" : "Generales"}
        </h2>

        <button
          className="dashboard-toggle-button"
          onClick={() => setModoDiario(!modoDiario)}
        >
          {modoDiario ? "Ver Generales" : "Ver Diario"}
        </button>
      </div>

      <DashboardEstadisticasAvanzado stats={stats} modoDiario={modoDiario} />
    </div>
  );
}
