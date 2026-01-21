import React, { useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../styles/descargasFirebase.css";

export default function DescargasFirebase() {
    const [loading, setLoading] = useState(false);

    const colecciones = [
        { key: "caja", label: "Caja" },
        { key: "mesas", label: "Mesas" },
        { key: "pedidos", label: "Pedidos" },
    ];

    const obtenerDatos = async (col) => {
        const snap = await getDocs(collection(db, col));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    };

    /* -------- FORMATEOS -------- */

    const formatearCaja = (data) =>
        data
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((c) => ({
                fecha: c.id,
                ingresos: c.ingresos,
                gastos: c.gastos,
                cierre: c.cierre,
            }));

    const formatearMesas = (data) =>
        data.map((m) => ({
            id: m.id,
            nombre: m.nombre,
            numero: m.numero,
            estado: m.estado,
            pedidoActual: m.pedidoActual ?? "—",
        }));

    const formatearPedidos = (data) =>
        data.map((p) => ({
            id: p.id,
            estado: p.estado,
            mesa: p.mesaNombre,
            medioPago: p.medioPago,
            horaInicio: p.horaInicio?.toDate?.().toLocaleString() || p.horaInicio,
            horaCierre: p.horaCierre?.toDate?.().toLocaleString() || p.horaCierre,
            productos: p.productos
                ?.map(
                    (pr) =>
                        `${pr.cantidad}x ${pr.nombre} $${pr.subtotal}`
                )
                .join(" | "),
            total: p.total,
        }));

    const formatearSegunColeccion = (col, data) => {
        if (col === "caja") return formatearCaja(data);
        if (col === "mesas") return formatearMesas(data);
        if (col === "pedidos") return formatearPedidos(data);
        return data;
    };

    /* -------- EXPORTAR PDF -------- */

    const exportarPDF = async (col) => {
        setLoading(true);
        const dataCruda = await obtenerDatos(col);
        const data = formatearSegunColeccion(col, dataCruda);

        const doc = new jsPDF();
        doc.text(`Exportación: ${col}`, 14, 15);

        if (data.length === 0) {
            doc.text("Sin datos", 14, 25);
        } else {
            const columnas = Object.keys(data[0]);
            const filas = data.map((item) =>
                columnas.map((c) => item[c] ?? "")
            );

            autoTable(doc, {
                startY: 25,
                head: [columnas],
                body: filas,
            });
        }

        doc.save(`${col}.pdf`);
        setLoading(false);
    };

    /* -------- EXPORTAR EXCEL -------- */

    const exportarExcel = async (col) => {
        setLoading(true);
        const dataCruda = await obtenerDatos(col);
        const data = formatearSegunColeccion(col, dataCruda);

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, col);
        XLSX.writeFile(wb, `${col}.xlsx`);

        setLoading(false);
    };

    return (
        <div className="descargas-firebase-card">
            <h3 className="descargas-firebase-title">Descargas</h3>

            {colecciones.map((c) => (
                <div key={c.key} className="descargas-firebase-row">
                    <span className="descargas-firebase-label">{c.label}</span>

                    <div className="descargas-firebase-btn-group">
                        <button
                            className="descargas-firebase-btn"
                            onClick={() => exportarPDF(c.key)}
                            disabled={loading}
                        >
                            📄 PDF
                        </button>
                        <button
                            className="descargas-firebase-btn"
                            onClick={() => exportarExcel(c.key)}
                            disabled={loading}
                        >
                            📊 Excel
                        </button>
                    </div>
                </div>
            ))}

            {loading && (
                <p className="descargas-firebase-loading">
                    Generando archivo...
                </p>
            )}
        </div>
    );
}
