import React, { useEffect, useState } from "react";
import { useMesasContext } from "../context/MesaContext";
import "../styles/DashboardEstadisticas.css";

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
          if (!p.horaCierre) return false;
          // Convertimos Timestamp de Firebase a Date
          const fechaCierre = p.horaCierre.toDate
            ? p.horaCierre.toDate()
            : new Date(p.horaCierre);
          return (
            fechaCierre.getFullYear() === hoyAnio &&
            fechaCierre.getMonth() === hoyMes &&
            fechaCierre.getDate() === hoyDia
          );
        })
      : pedidos;

    const libres = mesas.filter((m) => m.estado === "libre").length;
    const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
    const activos = pedidosFiltrados.filter(
      (p) => p.estado !== "pagado"
    ).length;
    const completados = pedidosFiltrados.filter(
      (p) => p.estado === "pagado"
    ).length;
    const totalProductos = pedidosFiltrados.reduce(
      (acc, p) => acc + (p.productos?.length || 0),
      0
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

  const items = [
    {
      label: "Mesas libres",
      value: stats.libres || 0,
      icon: "🪑",
      className: "libres",
    },
    {
      label: "Mesas ocupadas",
      value: stats.ocupadas || 0,
      icon: "👥",
      className: "ocupadas",
    },
    {
      label: "Pedidos activos",
      value: stats.activos || 0,
      icon: "📋",
      className: "activos",
    },
    {
      label: "Pedidos completados",
      value: stats.completados || 0,
      icon: "✅",
      className: "completados",
    },
    {
      label: "Productos vendidos",
      value: stats.totalProductos || 0,
      icon: "🛍️",
      className: "productos",
    },
    {
      label: "Ticket promedio",
      value: `$${stats.promedioTicket?.toFixed(2) || "0.00"}`,
      icon: "📈",
      className: "ticket",
    },
    {
      label: modoDiario ? "Ingresos del día" : "Ingresos totales",
      value: `$${stats.ingresos?.toFixed(2) || "0.00"}`,
      icon: "💰",
      className: "ingresos",
    },
    {
      label: modoDiario ? "Efectivo del día" : "Total efectivo",
      value: `$${stats.efectivoTotal?.toFixed(2) || "0.00"}`,
      icon: "💵",
      className: "efectivo",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          Estadísticas {modoDiario ? "del Día" : "Generales"}
        </h2>
        <button
          className="dashboard-toggle-button"
          onClick={() => setModoDiario(!modoDiario)}
        >
          {modoDiario ? "Ver Generales" : "Ver Diario"}
        </button>
      </div>
      <div className="dashboard-grid">
        {items.map((item, i) => (
          <div key={i} className={`dashboard-card ${item.className}`}>
            <div className="dashboard-icon">{item.icon}</div>
            <div className="dashboard-info">
              <span className="dashboard-value">{item.value}</span>
              <span className="dashboard-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
