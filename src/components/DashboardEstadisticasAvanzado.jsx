import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/DashboardEstadisticasAvanzado.css";

const COLORS = ["#1e7e34", "#c62828"];

export default function DashboardEstadisticasAvanzado({ stats, modoDiario }) {
  const totalMesas = (stats.libres || 0) + (stats.ocupadas || 0);
  const noHayMesas = totalMesas === 0;

  const mesasData = [
    { name: "Libres", value: stats.libres || 0 },
    { name: "Ocupadas", value: stats.ocupadas || 0 },
  ];

  const pedidosData = [
    { name: "Activos", value: stats.activos || 0 },
    { name: "Listos", value: stats.completados || 0 },
  ];

  return (
    <div className="sidebar-stats">
      {/* HEADER */}
      <div className="sidebar-header">
        <h3>Resumen</h3>
        <span>{modoDiario ? "Hoy" : "Acumulado"}</span>
      </div>

      {/* INGRESOS */}
      <div className="sidebar-card ingresos-card">
        <span className="card-label">Ingresos</span>
        <div className="card-value">${(stats.ingresos || 0).toFixed(2)}</div>
      </div>

      {/* MESAS */}
      <div className="sidebar-card">
        <span className="card-label">Mesas</span>

        {noHayMesas ? (
          <div className="empty-mini">Sin mesas creadas</div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={mesasData}
                dataKey="value"
                innerRadius={35}
                outerRadius={55}
              >
                {mesasData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c1c22",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                itemStyle={{
                  color: "#ddd",
                }}
                labelStyle={{
                  color: "#aaa",
                  fontWeight: 500,
                }}
              />{" "}
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* PEDIDOS */}
      <div className="sidebar-card">
        <span className="card-label">Pedidos</span>

        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={pedidosData}>
            <XAxis dataKey="name" hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c22",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#fff",
              }}
              itemStyle={{
                color: "#ddd",
              }}
              labelStyle={{
                color: "#aaa",
                fontWeight: 500,
              }}
            />{" "}
            <Bar dataKey="value" fill="#2196f3" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MINI METRICAS */}
      <div className="sidebar-footer">
        <div>
          <span>Productos</span>
          <strong>{stats.totalProductos || 0}</strong>
        </div>

        <div>
          <span>Ticket prom.</span>
          <strong>${(stats.promedioTicket || 0).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
