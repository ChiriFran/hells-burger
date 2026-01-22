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
import "../styles/cajaEstadisticasModal.css";

const COLORS = ["#4caf50", "#f44336", "#2196f3"];

export default function CajaEstadisticasModal({
    open,
    onClose,
    caja,
    cajas = [],
}) {
    if (!open || !caja) return null;

    const cierre = Number(caja.ingresos || 0) - Number(caja.gastos || 0);

    /* PIE */
    const pieData = [
        { name: "Ingresos", value: Number(caja.ingresos || 0) },
        { name: "Gastos", value: Number(caja.gastos || 0) },
    ];

    /* BAR */
    const barData = [
        { label: "Ingresos", monto: Number(caja.ingresos || 0) },
        { label: "Gastos", monto: Number(caja.gastos || 0) },
        { label: "Cierre", monto: cierre },
    ];

    /* HISTÓRICO */
    const historicoData = Array.isArray(cajas)
        ? cajas
            .map((doc) => {
                const data = doc.data ? doc.data : doc;
                return {
                    fecha: doc.id || data.fecha,
                    ingresos: Number(data.ingresos || 0),
                    gastos: Number(data.gastos || 0),
                    cierre:
                        Number(data.cierre) ??
                        Number(data.ingresos || 0) - Number(data.gastos || 0),
                };
            })
            .filter((d) => d.fecha)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        : [];

    return (
        <div className="caja-modal-overlay">
            <div className="caja-modal-container">
                {/* HEADER */}
                <header className="caja-modal-header">
                    <h2>💰 Detalle de Caja</h2>
                    <button onClick={onClose}>✖</button>
                </header>

                {/* BODY */}
                <div className="caja-modal-body">
                    {/* KPIs */}
                    <section className="caja-kpis">
                        <div className="caja-kpi ingresos">
                            <span>Ingresos</span>
                            <strong>${caja.ingresos}</strong>
                        </div>

                        <div className="caja-kpi gastos">
                            <span>Gastos</span>
                            <strong>${caja.gastos}</strong>
                        </div>

                        <div className="caja-kpi cierre">
                            <span>Cierre</span>
                            <strong>${cierre}</strong>
                        </div>
                    </section>

                    {/* CHARTS */}
                    <section className="stats-chart-grid">
                        {/* LINE */}
                        <div className="stats-chart-card" style={{ gridColumn: "1 / -1" }}>
                            <h4 className="stats-chart-title">
                                Evolución histórica de caja
                            </h4>

                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={historicoData}>
                                    <XAxis dataKey="fecha" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line dataKey="ingresos" stroke="#58d05c" strokeWidth={2} />
                                    <Line dataKey="gastos" stroke="#da5f56" strokeWidth={2} />
                                    <Line dataKey="cierre" stroke="#101316" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Histórico completo</span>
                                <small>Evolución diaria de ingresos, gastos y cierre</small>

                                <div className="caja-legend">
                                    <div className="caja-legend-item">
                                        <span className="legend-color ingresos" />
                                        <small>Ingresos</small>
                                    </div>

                                    <div className="caja-legend-item">
                                        <span className="legend-color gastos" />
                                        <small>Gastos</small>
                                    </div>

                                    <div className="caja-legend-item">
                                        <span className="legend-color cierre" />
                                        <small>Cierre</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PIE */}
                        <div className="stats-chart-card">
                            <h4 className="stats-chart-title">
                                Ingresos vs Gastos
                            </h4>

                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" outerRadius={90}>
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Distribución del día</span>
                                <small>Relación entre ingresos y gastos diarios</small>
                            </div>
                        </div>

                        {/* BAR */}
                        <div className="stats-chart-card">
                            <h4 className="stats-chart-title">
                                Resumen diario
                            </h4>

                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="monto" />
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="stats-chart-info">
                                <span>Comparación de montos</span>
                                <small>Ingresos, gastos y cierre del día</small>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
