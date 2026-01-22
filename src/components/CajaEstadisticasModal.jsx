import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import "../styles/cajaEstadisticasModal.css";

const COLORS = ["#b63925", "#c27c72", "#ee563f"];

export default function CajaEstadisticasModal({ open, onClose, caja }) {
    if (!open) return null;

    const cierre = caja.ingresos - caja.gastos;

    const pieData = [
        { name: "Ingresos", value: caja.ingresos },
        { name: "Gastos", value: caja.gastos },
    ];

    const barData = [
        { label: "Ingresos", monto: caja.ingresos },
        { label: "Gastos", monto: caja.gastos },
        { label: "Cierre", monto: cierre },
    ];

    return (
        <div className="caja-modal-overlay">
            <div className="caja-modal-container">
                {/* HEADER (FIJO) */}
                <header className="caja-modal-header">
                    <h2>💰 Detalle de Caja</h2>
                    <button onClick={onClose} aria-label="Cerrar">
                        ✖
                    </button>
                </header>

                {/* BODY CON SCROLL */}
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
                    <section className="caja-charts">
                        {/* TORTA */}
                        <div className="caja-chart-card">
                            <h4>Ingresos vs Gastos</h4>

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

                            <small>Distribución del dinero del día</small>
                        </div>

                        {/* BARRAS */}
                        <div className="caja-chart-card">
                            <h4>Resumen general</h4>

                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="monto" />
                                </BarChart>
                            </ResponsiveContainer>

                            <small>Comparación de montos</small>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
