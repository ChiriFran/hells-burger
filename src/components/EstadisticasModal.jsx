import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import "../styles/estadisticasModal.css";

const CHART_COLORS = ["#b63925", "#ea6861", "#2196f3", "#e8d1af"];

export default function EstadisticasModal({
    open,
    onClose,
    stats,
    modoDiario,
}) {
    if (!open) return null;

    const mesasChartData = [
        { label: "Libres", value: stats.libres },
        { label: "Ocupadas", value: stats.ocupadas },
    ];

    const pedidosChartData = [
        { label: "Activos", value: stats.activos },
        { label: "Completados", value: stats.completados },
    ];

    const pagosChartData = [
        { label: "Efectivo", value: stats.efectivoTotal },
        {
            label: "Otros",
            value: Math.max(stats.ingresos - stats.efectivoTotal, 0),
        },
    ];

    const ingresosChartData = [
        {
            periodo: modoDiario ? "Hoy" : "Total",
            ingresos: stats.ingresos,
            ticket: stats.promedioTicket,
        },
    ];

    return (
        <div className="stats-modal-overlay">
            <div className="stats-modal-container">
                {/* HEADER */}
                <header className="stats-modal-header">
                    <h2 className="stats-modal-title">📊 Estadísticas Detalladas</h2>
                    <button
                        className="stats-modal-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ✖
                    </button>
                </header>

                {/* BODY */}
                <section className="stats-modal-body">
                    {/* KPIs */}
                    <div className="stats-kpi-grid">
                        <div className="stats-kpi-card stats-kpi-ingresos">
                            <span className="stats-kpi-label">Ingresos</span>
                            <strong className="stats-kpi-value">
                                ${stats.ingresos.toFixed(2)}
                            </strong>
                        </div>

                        <div className="stats-kpi-card stats-kpi-ticket">
                            <span className="stats-kpi-label">Ticket promedio</span>
                            <strong className="stats-kpi-value">
                                ${stats.promedioTicket.toFixed(2)}
                            </strong>
                        </div>

                        <div className="stats-kpi-card stats-kpi-productos">
                            <span className="stats-kpi-label">Productos vendidos</span>
                            <strong className="stats-kpi-value">
                                {stats.totalProductos}
                            </strong>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className="stats-chart-grid">
                        {/* Mesas */}
                        <div className="stats-chart-card stats-chart-mesas">
                            <h4 className="stats-chart-title">Estado de mesas</h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={mesasChartData}
                                        dataKey="value"
                                        nameKey="label"
                                        innerRadius={65}
                                        outerRadius={95}
                                    >
                                        {mesasChartData.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Distribución actual de mesas</span>
                                <small>
                                    Libres: {stats.libres} · Ocupadas: {stats.ocupadas}
                                </small>
                            </div>
                        </div>

                        {/* Pedidos */}
                        <div className="stats-chart-card stats-chart-pedidos">
                            <h4 className="stats-chart-title">Pedidos</h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={pedidosChartData}>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" />
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Estado general de pedidos</span>
                                <small>
                                    Activos: {stats.activos} · Completados: {stats.completados}
                                </small>
                            </div>
                        </div>

                        {/* Ingresos */}
                        <div className="stats-chart-card stats-chart-ingresos-resumen">
                            <h4 className="stats-chart-title">
                                💰 Ingresos {modoDiario ? "del día" : "totales"}
                            </h4>

                            {/* Monto principal */}
                            <div className="ingresos-hero">
                                <span className="ingresos-amount">
                                    ${stats.ingresos.toFixed(2)}
                                </span>
                                <small className="ingresos-label">
                                    {modoDiario ? "Hoy" : "Acumulado"}
                                </small>
                            </div>

                            {/* Barra visual de peso */}
                            <div className="ingresos-bar-wrapper">
                                <div
                                    className="ingresos-bar-fill"
                                    style={{
                                        width: Math.min(
                                            (stats.ingresos / (stats.ingresos + 1)) * 100,
                                            100
                                        ) + "%",
                                    }}
                                />
                            </div>

                            {/* Info secundaria */}
                            <div className="ingresos-stats">
                                <div>
                                    <span>🎟 Ticket promedio</span>
                                    <strong>${stats.promedioTicket.toFixed(2)}</strong>
                                </div>
                                <div>
                                    <span>📦 Productos</span>
                                    <strong>{stats.totalProductos}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Pagos */}
                        <div className="stats-chart-card stats-chart-pagos">
                            <h4 className="stats-chart-title">Medios de pago</h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pagosChartData}
                                        dataKey="value"
                                        nameKey="label"
                                        outerRadius={95}
                                    >
                                        {pagosChartData.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Forma de cobro utilizada</span>
                                <small>
                                    Efectivo: ${stats.efectivoTotal.toFixed(2)} · Otros: $
                                    {Math.max(stats.ingresos - stats.efectivoTotal, 0).toFixed(2)}
                                </small>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
