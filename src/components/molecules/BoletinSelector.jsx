import { jsPDF } from "jspdf";
import React, { useMemo, useState } from "react";
import { getBoletin, getBoletinDocente } from "../../services/studentService";
import useSchool from "../../lib/hooks/useSchool";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import useAuth from "../../lib/hooks/useAuth";

/* ── Helpers ── */
const formatDate = (isoDate) => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return String(isoDate);
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const colorEstado = (estado) => {
  if (!estado) return "#374151";
  const lower = estado.toLowerCase();
  if (
    lower.includes("aprobado") ||
    (lower.includes("promovido") && !lower.includes("no"))
  )
    return "#15803d";
  if (lower.includes("proceso")) return "#2563eb";
  return "#dc2626";
};

/* ── Estilos inline para la vista HTML ── */
const S = {
  th: {
    padding: "5px 4px",
    textAlign: "center",
    borderRight: "1px solid #2d3a4f",
    borderBottom: "1px solid #2d3a4f",
    fontWeight: "bold",
    fontSize: "9px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  thLeft: {
    padding: "5px 4px",
    textAlign: "left",
    borderRight: "1px solid #2d3a4f",
    borderBottom: "1px solid #2d3a4f",
    fontWeight: "bold",
    fontSize: "9px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  td: {
    padding: "4px 4px",
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  },
  tdLeft: {
    padding: "4px 4px",
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  },
  tdBold: {
    padding: "4px 4px",
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "left",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  },
};

/* ── Descripción por escala ── */
const getEscalaDescripcion = (key) => {
  if (key.includes("superior"))
    return "Alcanza los desempeños esperados en el tiempo planeado y de manera independiente";
  if (key.includes("alto") || key.includes("alta"))
    return "Alcanza la mayoría de los desempeños esperados y algunas veces requiere de apoyo pedagógico";
  if (key.includes("basico") || key.includes("básico"))
    return "Alcanza desempeños básicos, casi siempre requiere de apoyo y lo aprovecha";
  if (key.includes("bajo") || key.includes("baja"))
    return "No alcanza desempeños esperados, aunque cuente con los apoyos";
  return null;
};

/* ── Hooks de procesamiento de datos del boletín ── */
const useBoletinProcessed = (data) => {
  const periodos = useMemo(() => {
    const m = new Map();
    for (const r of data) {
      if (r.id_periodo && !m.has(r.id_periodo)) {
        m.set(r.id_periodo, r.nombre_periodo || `Periodo ${r.id_periodo}`);
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([id, nombre]) => ({ id, nombre }));
  }, [data]);

  const asignaturas = useMemo(() => {
    const m = new Map();
    for (const r of data) {
      const key = r.nombre_asignatura;
      if (!m.has(key)) {
        m.set(key, {
          nombre_asignatura: key,
          nombre_docente: r.nombre_docente || "-",
          definitiva: r.definitiva || "-",
          estado_final: r.estado_final || "-",
          periodos: new Map(),
        });
      }
      const asig = m.get(key);
      if (r.definitiva) {
        const newDef = parseFloat(r.definitiva);
        const curDef = parseFloat(asig.definitiva);
        if (!asig.definitiva || asig.definitiva === "-" || newDef > curDef) {
          asig.definitiva = r.definitiva;
        }
      }
      if ((!asig.estado_final || asig.estado_final === "-") && r.estado_final) {
        asig.estado_final = r.estado_final;
      }
      const pid = r.id_periodo;
      if (!asig.periodos.has(pid)) {
        asig.periodos.set(pid, {
          nota: r.nota_periodo_porcentual || null,
          recuperacion: r.nota_recuperacion || null,
          escala: r.escala_nota || null,
          estado: r.estado_periodo || null,
          logros: [],
          logro_nota_estudiante: r.logro_nota_estudiante || "",
          notas: [],
        });
      }
      const per = asig.periodos.get(pid);
      const logro = (r.logro || "").trim();
      if (logro && !per.logros.includes(logro)) per.logros.push(logro);
      if (r.logro_nota_estudiante && !per.logro_nota_estudiante) {
        per.logro_nota_estudiante = r.logro_nota_estudiante;
      }
      if (r.valor_nota !== undefined && r.valor_nota !== null) {
        const notaNombre = (r.nombre_nota_porcentaje ?? "") + "%";
        const exists = per.notas.some(
          (n) =>
            n.nombre === notaNombre && String(n.valor) === String(r.valor_nota),
        );
        if (!exists)
          per.notas.push({ nombre: notaNombre, valor: r.valor_nota });
      }
    }
    return Array.from(m.values());
  }, [data]);

  const promedioGeneral = useMemo(() => {
    if (!asignaturas.length) return null;
    const sum = asignaturas.reduce((acc, a) => {
      const val = parseFloat(a.definitiva);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / asignaturas.length).toFixed(2);
  }, [asignaturas]);

  const resumenEstado = useMemo(() => {
    if (!asignaturas.length) return "-";
    const total = asignaturas.length;
    const prom = asignaturas.filter(
      (a) =>
        a.estado_final &&
        a.estado_final.toLowerCase().includes("promovido") &&
        !a.estado_final.toLowerCase().includes("no"),
    ).length;
    if (prom === total) return "Promovido";
    if (prom === 0) return "No promovido";
    return `${prom} de ${total} asignaturas promovidas`;
  }, [asignaturas]);

  return { periodos, asignaturas, promedioGeneral, resumenEstado };
};

/* ── Función pura equivalente a useBoletinProcessed (para uso en loops) ── */
function computeBoletinData(data) {
  const periodoMap = new Map();
  for (const r of data) {
    if (r.id_periodo && !periodoMap.has(r.id_periodo)) {
      periodoMap.set(
        r.id_periodo,
        r.nombre_periodo || `Periodo ${r.id_periodo}`,
      );
    }
  }
  const periodos = Array.from(periodoMap.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, nombre]) => ({ id, nombre }));

  const asigMap = new Map();
  for (const r of data) {
    const key = r.nombre_asignatura;
    if (!asigMap.has(key)) {
      asigMap.set(key, {
        nombre_asignatura: key,
        nombre_docente: r.nombre_docente || "-",
        definitiva: r.definitiva || "-",
        estado_final: r.estado_final || "-",
        periodos: new Map(),
      });
    }
    const asig = asigMap.get(key);
    if (r.definitiva) {
      const newDef = parseFloat(r.definitiva);
      const curDef = parseFloat(asig.definitiva);
      if (!asig.definitiva || asig.definitiva === "-" || newDef > curDef)
        asig.definitiva = r.definitiva;
    }
    if ((!asig.estado_final || asig.estado_final === "-") && r.estado_final)
      asig.estado_final = r.estado_final;
    const pid = r.id_periodo;
    if (!asig.periodos.has(pid)) {
      asig.periodos.set(pid, {
        nota: r.nota_periodo_porcentual || null,
        recuperacion: r.nota_recuperacion || null,
        escala: r.escala_nota || null,
        estado: r.estado_periodo || null,
        logros: [],
        logro_nota_estudiante: r.logro_nota_estudiante || "",
        notas: [],
      });
    }
    const per = asig.periodos.get(pid);
    const logro = (r.logro || "").trim();
    if (logro && !per.logros.includes(logro)) per.logros.push(logro);
    if (r.logro_nota_estudiante && !per.logro_nota_estudiante)
      per.logro_nota_estudiante = r.logro_nota_estudiante;
    if (r.valor_nota !== undefined && r.valor_nota !== null) {
      const notaNombre = (r.nombre_nota_porcentaje ?? "") + "%";
      const exists = per.notas.some(
        (n) =>
          n.nombre === notaNombre && String(n.valor) === String(r.valor_nota),
      );
      if (!exists) per.notas.push({ nombre: notaNombre, valor: r.valor_nota });
    }
  }
  const asignaturas = Array.from(asigMap.values());
  const promedioGeneral = asignaturas.length
    ? (
        asignaturas.reduce((acc, a) => {
          const v = parseFloat(a.definitiva);
          return acc + (isNaN(v) ? 0 : v);
        }, 0) / asignaturas.length
      ).toFixed(2)
    : null;
  const resumenEstado = (() => {
    if (!asignaturas.length) return "-";
    const total = asignaturas.length;
    const prom = asignaturas.filter(
      (a) =>
        a.estado_final &&
        a.estado_final.toLowerCase().includes("promovido") &&
        !a.estado_final.toLowerCase().includes("no"),
    ).length;
    if (prom === total) return "Promovido";
    if (prom === 0) return "No promovido";
    return `${prom} de ${total} asignaturas promovidas`;
  })();
  return { periodos, asignaturas, promedioGeneral, resumenEstado };
}

/* ── Hook: procesamiento de boletín grado transición ── */
const useBoletinTransicionProcessed = (data) => {
  const asignaturas = useMemo(() => {
    const m = new Map();
    for (const r of data) {
      const asigKey = String(r.id_asignatura);
      if (!m.has(asigKey)) {
        m.set(asigKey, {
          id_asignatura: r.id_asignatura,
          nombre_asignatura: r.nombre_asignatura ?? "-",
          nombre_docente: r.nombre_docente ?? "-",
          filas: [],
        });
      }
      const asig = m.get(asigKey);
      const existingIdx = asig.filas.findIndex(
        (d) =>
          String(d.id_dba) === String(r.id_dba) &&
          String(d.id_proposito) === String(r.id_proposito),
      );
      if (existingIdx === -1) {
        asig.filas.push({
          id_dba: r.id_dba,
          id_proposito: r.id_proposito,
          nombre_proposito: r.nombre_proposito ?? "-",
          nombre_dba: r.nombre_dba ?? "-",
          descripcion_notas: r.descripcion_nota
            ? r.descripcion_nota
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          descripcion_nota_elegida: r.descripcion_nota_elegida ?? "-",
          comentario: r.comentario ?? "",
          estado: r.estado ?? "",
        });
      } else {
        const notasParsed = r.descripcion_nota
          ? r.descripcion_nota
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        for (const nota of notasParsed) {
          if (!asig.filas[existingIdx].descripcion_notas.includes(nota)) {
            asig.filas[existingIdx].descripcion_notas.push(nota);
          }
        }
      }
    }
    return Array.from(m.values());
  }, [data]);

  return { asignaturas };
};

/* ── Vista HTML: boletín grado transición ── */
const BoletinTransicionView = ({ boletinData, info }) => {
  const { asignaturas } = useBoletinTransicionProcessed(boletinData ?? []);

  const colorNota = (nota) => {
    if (!nota) return "#374151";
    const n = nota.toLowerCase().trim();
    if (n === "a") return "#15803d";
    if (n === "b") return "#2563eb";
    if (n === "c") return "#d97706";
    return "#dc2626";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#111827",
        padding: "24px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          borderBottom: "2px solid #131a27",
          paddingBottom: "12px",
          marginBottom: "12px",
        }}
      >
        {info.link_logo && (
          <img
            src={info.link_logo}
            alt="Logo institución"
            crossOrigin="anonymous"
            style={{ width: 64, height: 64, objectFit: "contain" }}
          />
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          {info.nombre_institucion && (
            <p
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {info.nombre_institucion}
            </p>
          )}
          {info.nit && (
            <p style={{ margin: "2px 0", color: "#6b7280", fontSize: "10px" }}>
              NIT: {info.nit}
            </p>
          )}
          {info.nombre_sede && (
            <p style={{ margin: "2px 0", fontWeight: "600", fontSize: "11px" }}>
              {info.nombre_sede}
              {info.sede_tip ? ` — ${info.sede_tip}` : ""}
            </p>
          )}
          {info.grado && (
            <p style={{ margin: "2px 0", fontSize: "11px" }}>
              <strong>Grado:</strong> {info.grado}
            </p>
          )}
          {(info.nombre_estudiante || info.apellido_estudiante) && (
            <p
              style={{
                margin: "6px 0 0",
                fontWeight: "bold",
                fontSize: "12px",
                borderTop: "1px solid #d1d5db",
                paddingTop: "4px",
              }}
            >
              {[info.nombre_estudiante, info.apellido_estudiante]
                .filter(Boolean)
                .join(" ")}
            </p>
          )}
          {(info.numero_identificacion || info.identificacion) && (
            <p style={{ margin: "2px 0", fontSize: "10px", color: "#374151" }}>
              <strong>Doc:</strong>{" "}
              {info.numero_identificacion ?? info.identificacion}
            </p>
          )}
          {(info.nombre_jornada || info.grupo) && (
            <p style={{ margin: "2px 0", fontSize: "10px" }}>
              {info.nombre_jornada && (
                <span>
                  <strong>Jornada:</strong> {info.nombre_jornada}
                </span>
              )}
              {info.nombre_jornada && info.grupo && <span> — </span>}
              {info.grupo && (
                <span>
                  <strong>Grupo:</strong> {info.grupo}
                </span>
              )}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", fontSize: "10px", color: "#374151" }}>
          <p style={{ margin: "2px 0" }}>
            <strong>Fecha:</strong> {formatDate(info.fecha)}
          </p>
        </div>
      </div>

      {/* Título */}
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "13px",
          marginBottom: "14px",
          letterSpacing: "1px",
        }}
      >
        Boletín de Notas — Grado Transición
      </h2>

      {/* Tabla por asignatura */}
      {asignaturas.map((asig, asigIdx) => (
        <div
          key={asig.id_asignatura}
          style={{ marginBottom: "20px", overflowX: "auto" }}
        >
          {/* Cabecera de asignatura */}
          <div
            style={{
              backgroundColor: "#131a27",
              color: "#ffffff",
              padding: "6px 10px",
              fontWeight: "bold",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{asig.nombre_asignatura}</span>
            <span style={{ fontSize: "10px", fontWeight: "normal" }}>
              Docente: {asig.nombre_docente}
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1e2d42", color: "#e5e7eb" }}>
                <th
                  style={{
                    ...S.th,
                    width: "20%",
                    fontSize: "8px",
                    color: "#94a3b8",
                  }}
                >
                  Propósito
                </th>
                <th
                  style={{
                    ...S.th,
                    width: "25%",
                    fontSize: "8px",
                    color: "#94a3b8",
                  }}
                >
                  DBA
                </th>
                <th style={{ ...S.th, width: "10%", fontSize: "8px" }}>
                  Valor asignado
                </th>
                <th style={{ ...S.th, width: "20%", fontSize: "8px" }}>
                  Otros posibles valores
                </th>
                <th style={{ ...S.th, width: "25%", fontSize: "8px" }}>
                  Comentario
                </th>
              </tr>
            </thead>
            <tbody>
              {asig.filas.map((fila, filaIdx) => {
                const rowBg = filaIdx % 2 === 0 ? "#f9fafb" : "#ffffff";
                return (
                  <tr
                    key={`${fila.id_proposito}-${fila.id_dba}`}
                    style={{ backgroundColor: rowBg }}
                  >
                    <td
                      style={{
                        ...S.tdLeft,
                        fontSize: "9px",
                        padding: "6px 10px",
                      }}
                    >
                      {fila.nombre_proposito}
                    </td>
                    <td
                      style={{
                        ...S.tdLeft,
                        fontSize: "9px",
                        padding: "6px 10px",
                      }}
                    >
                      {fila.nombre_dba}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontWeight: "bold",
                        fontSize: "12px",
                        color: colorNota(fila.descripcion_nota_elegida),
                        textTransform: "uppercase",
                      }}
                    >
                      {fila.descripcion_nota_elegida?.toUpperCase() ?? "-"}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontSize: "12px",
                        padding: "6px 10px",
                        textAlign: "left",
                      }}
                    >
                      {fila.descripcion_notas.length > 0
                        ? fila.descripcion_notas.map((n, i) => (
                            <div key={i} style={{ lineHeight: "1.6" }}>
                              - {n}
                            </div>
                          ))
                        : "-"}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {fila.comentario || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Encabezado PDF compartido
   ══════════════════════════════════════════════════════════════ */

async function drawPDFHeader(pdf, info, title) {
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 8;
  let y = margin;

  const logoSize = 18;
  const logoX = margin;
  let logoData = null;
  if (info.link_logo) {
    try {
      logoData = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const maxDim = 128;
          let w = img.width,
            h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.onerror = () => resolve(null);
        img.src = info.link_logo;
      });
    } catch {
      logoData = null;
    }
  }

  const textAreaLeft = logoData ? logoX + logoSize + 4 : margin;
  const textCenter = textAreaLeft + (pageW - margin - textAreaLeft) / 2;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text((info.nombre_institucion ?? "-").toUpperCase(), textCenter, y + 5, {
    align: "center",
  });
  y += 7;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(`NIT: ${info.nit ?? "-"}`, textCenter, y + 3, { align: "center" });
  y += 5;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `${info.nombre_sede ?? "-"} — ${info.sede_tip ?? "-"}`,
    textCenter,
    y + 3,
    { align: "center" },
  );
  y += 5;
  if (info.grado) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Grado: ${info.grado}`, textCenter, y + 3, { align: "center" });
    y += 4;
  }
  pdf.setFontSize(8);
  pdf.text(`Fecha: ${formatDate(info.fecha)}`, pageW - margin, y + 3, {
    align: "right",
  });
  y += 6;

  /* Datos del estudiante */
  const _nombreCompleto = [info.nombre_estudiante, info.apellido_estudiante]
    .filter(Boolean)
    .join(" ");
  if (_nombreCompleto) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(_nombreCompleto.toUpperCase(), textCenter, y + 3, {
      align: "center",
    });
    y += 5;
  }
  const _docId = info.numero_identificacion ?? info.identificacion ?? null;
  if (_docId) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Doc: ${_docId}`, textCenter, y + 3, { align: "center" });
    y += 4;
  }
  const _jornGrupo = [
    info.nombre_jornada ? `Jornada: ${info.nombre_jornada}` : null,
    info.grupo ? `Grupo: ${info.grupo}` : null,
  ]
    .filter(Boolean)
    .join("  —  ");
  if (_jornGrupo) {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(_jornGrupo, textCenter, y + 3, { align: "center" });
    y += 4;
  }

  if (logoData) {
    pdf.addImage(logoData, "JPEG", logoX, margin, logoSize, logoSize);
  }

  /* línea separadora */
  pdf.setDrawColor(19, 26, 39);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageW - margin, y);
  y += 4;

  /* Título */
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, pageW / 2, y + 4, { align: "center" });
  y += 10;

  return y;
}

/* ══════════════════════════════════════════════════════════════
   Generación de PDF estructurado con jsPDF
   ══════════════════════════════════════════════════════════════ */

async function generateBoletinPDF(
  info,
  periodos,
  asignaturas,
  promedioGeneral,
  resumenEstado,
  escalas,
  meta,
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;

  let y = await drawPDFHeader(pdf, info, "BOLETÍN DE NOTAS");

  const addPageIfNeeded = (needed) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  /* ── Tabla de notas ── */
  // Columnas: Asignatura | Docente | [por cada periodo: Nota, Recup, Escala, Estado] | Definitiva | Estado Final
  const periodCols = periodos.length * 4;
  const fixedCols = 4; // Asignatura + Docente + Definitiva + Estado Final
  const totalCols = fixedCols + periodCols;

  // Anchos proporcionales
  const asigW = contentW * 0.14;
  const docenteW = contentW * 0.12;
  const defW = contentW * 0.06;
  const estadoFW = contentW * 0.08;
  const remainW = contentW - asigW - docenteW - defW - estadoFW;
  const perSubW = periodos.length > 0 ? remainW / (periodos.length * 4) : 0;

  const colWidths = [asigW, docenteW];
  for (let i = 0; i < periodos.length; i++) {
    colWidths.push(perSubW, perSubW, perSubW, perSubW);
  }
  colWidths.push(defW, estadoFW);

  const colX = (colIdx) => {
    let x = margin;
    for (let i = 0; i < colIdx; i++) x += colWidths[i];
    return x;
  };

  const rowH = 6;
  const subHeaderH = 5;

  const drawCell = (text, col, cy, h, opts = {}) => {
    const {
      bold = false,
      fontSize = 6,
      align = "center",
      color = [0, 0, 0],
      bg = null,
    } = opts;
    const cx = colX(col);
    const w = colWidths[col];
    const isWhiteBg = bg && bg[0] === 255 && bg[1] === 255 && bg[2] === 255;
    if (bg && !isWhiteBg) {
      pdf.setFillColor(...bg);
      pdf.rect(cx, cy, w, h, "F");
    }
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);
    pdf.rect(cx, cy, w, h, "D");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setTextColor(...color);
    const maxTextW = w - 1;
    let displayText = String(text ?? "-");
    while (pdf.getTextWidth(displayText) > maxTextW && displayText.length > 1) {
      displayText = displayText.slice(0, -1);
    }
    const tx =
      align === "left"
        ? cx + 0.8
        : align === "right"
          ? cx + w - 0.8
          : cx + w / 2;
    pdf.text(displayText, tx, cy + h / 2 + 1.5, {
      align: align === "left" ? "left" : align === "right" ? "right" : "center",
    });
  };

  /* Fila de cabecera principal */
  addPageIfNeeded(rowH + subHeaderH);
  const headerBg = [19, 26, 39];
  const headerColor = [255, 255, 255];
  drawCell("Asignatura", 0, y, rowH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
    align: "left",
  });
  drawCell("Docente", 1, y, rowH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
    align: "left",
  });

  // Cabeceras agrupadas por periodo (colspan manual)
  for (let pi = 0; pi < periodos.length; pi++) {
    const startCol = 2 + pi * 4;
    const cx = colX(startCol);
    const groupW = perSubW * 4;
    pdf.setFillColor(...headerBg);
    pdf.rect(cx, y, groupW, rowH, "F");
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(cx, y, groupW, rowH, "D");
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...headerColor);
    pdf.text(periodos[pi].nombre, cx + groupW / 2, y + rowH / 2 + 1.5, {
      align: "center",
    });
  }
  drawCell("DF", totalCols - 2, y, rowH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
  });
  drawCell("Estado Final", totalCols - 1, y, rowH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
  });
  y += rowH;

  /* Sub-cabecera (NFP, Recup, Escala, Estado) */
  const subBg = [30, 45, 66];
  const subColor = [229, 231, 235];
  drawCell("", 0, y, subHeaderH, { bg: subBg });
  drawCell("", 1, y, subHeaderH, { bg: subBg });
  for (let pi = 0; pi < periodos.length; pi++) {
    const base = 2 + pi * 4;
    drawCell("NFP", base, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Recup.", base + 1, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Escala", base + 2, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Estado", base + 3, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
  }
  drawCell("", totalCols - 2, y, subHeaderH, { bg: subBg });
  drawCell("", totalCols - 1, y, subHeaderH, { bg: subBg });
  y += subHeaderH;

  /* Filas de datos */
  for (let idx = 0; idx < asignaturas.length; idx++) {
    const asig = asignaturas[idx];
    const rowBg = idx % 2 === 0 ? [249, 250, 251] : [255, 255, 255];

    // Calcular si tiene logros
    const logrosTexts = [];
    for (const p of periodos) {
      const per = asig.periodos.get(p.id);
      if (!per) continue;
      const items = [];
      if (per.notas?.length > 0)
        items.push(per.notas.map((n) => `${n.nombre}: ${n.valor}`).join(" | "));
      if (per.logros.length > 0)
        items.push(`Logros: ${per.logros.join(" | ")}`);
      if (per.logro_nota_estudiante)
        items.push(`Logro estudiante: ${per.logro_nota_estudiante}`);
      if (items.length) logrosTexts.push(`${p.nombre}: ${items.join(" — ")}`);
    }

    const logroRowH = logrosTexts.length > 0 ? 5 : 0;
    addPageIfNeeded(rowH + logroRowH);

    drawCell(asig.nombre_asignatura, 0, y, rowH, {
      bold: true,
      fontSize: 6,
      align: "left",
      bg: rowBg,
    });
    drawCell(asig.nombre_docente, 1, y, rowH, {
      fontSize: 5.5,
      align: "left",
      color: [107, 114, 128],
      bg: rowBg,
    });

    for (let pi = 0; pi < periodos.length; pi++) {
      const per = asig.periodos.get(periodos[pi].id);
      const base = 2 + pi * 4;
      drawCell(per?.nota ?? "-", base, y, rowH, { bold: true, bg: rowBg });
      drawCell(per?.recuperacion ?? "-", base + 1, y, rowH, { bg: rowBg });
      drawCell(per?.escala ?? "-", base + 2, y, rowH, { bg: rowBg });
      const estColor = per?.estado
        ? colorEstado(per.estado) === "#15803d"
          ? [21, 128, 61]
          : [220, 38, 38]
        : [55, 65, 81];
      drawCell(per?.estado ?? "-", base + 3, y, rowH, {
        bold: true,
        color: estColor,
        bg: rowBg,
      });
    }

    drawCell(asig.definitiva, totalCols - 2, y, rowH, {
      bold: true,
      fontSize: 7,
      bg: rowBg,
    });
    const efDisplay = meta.periodId !== "4" ? "En proceso" : asig.estado_final;
    const efHex = colorEstado(efDisplay);
    const efColor =
      efHex === "#15803d"
        ? [21, 128, 61]
        : efHex === "#2563eb"
          ? [37, 99, 235]
          : [220, 38, 38];
    drawCell(efDisplay, totalCols - 1, y, rowH, {
      bold: true,
      color: efColor,
      bg: rowBg,
    });
    y += rowH;

    /* Fila de logros */
    if (logrosTexts.length > 0) {
      const logroBg = idx % 2 === 0 ? [238, 242, 255] : [245, 245, 240];
      const lx = colX(0);
      pdf.setFillColor(...logroBg);
      pdf.rect(lx, y, contentW, logroRowH, "F");
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(lx, y, contentW, logroRowH, "D");
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(55, 65, 81);
      const logroLine = logrosTexts.join("   |   ");
      const maxW = contentW - 2;
      let display = logroLine;
      while (pdf.getTextWidth(display) > maxW && display.length > 1)
        display = display.slice(0, -1);
      pdf.text(display, lx + 1, y + logroRowH / 2 + 1.2);
      y += logroRowH;
    }
  }

  /* ── Resumen ── */
  y += 3;
  addPageIfNeeded(10);
  pdf.setDrawColor(19, 26, 39);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageW - margin, y);
  y += 5;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  if (promedioGeneral !== null) {
    pdf.text(`Promedio general: ${promedioGeneral}`, pageW - margin, y, {
      align: "right",
    });
    y += 5;
  }
  pdf.text(
    `Estado general: ${meta.periodId !== "4" ? "En proceso" : resumenEstado}`,
    pageW - margin,
    y,
    { align: "right" },
  );
  y += 8;

  /* ── Convenciones ── */
  if (escalas.length > 0) {
    addPageIfNeeded(10 + escalas.length * 6);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("CONVENCIONES", margin, y);
    y += 5;
    const escColW = [contentW * 0.2, contentW * 0.8];
    // Cabecera convenciones
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, y, escColW[0], 6, "FD");
    pdf.rect(margin + escColW[0], y, escColW[1], 6, "FD");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("ESCALA", margin + 2, y + 4);
    pdf.text("RANGO", margin + escColW[0] + 2, y + 4);
    y += 6;
    for (const e of escalas) {
      addPageIfNeeded(6);
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(margin, y, escColW[0], 6, "D");
      pdf.rect(margin + escColW[0], y, escColW[1], 6, "D");
      pdf.setFontSize(6.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(e.escala ?? ""), margin + 2, y + 4);
      pdf.setFont("helvetica", "normal");
      const normalized = String(e.escala || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const desc = getEscalaDescripcion(normalized);
      const rangoText = `De ${e.desde} a ${e.hasta}${desc ? ` (${desc})` : ""}`;
      let display = rangoText;
      const maxEscW = escColW[1] - 3;
      while (pdf.getTextWidth(display) > maxEscW && display.length > 1)
        display = display.slice(0, -1);
      pdf.text(display, margin + escColW[0] + 2, y + 4);
      y += 6;
    }
  }

  pdf.save(`Boletin_${meta.studentId}_${meta.year}_P${meta.periodId}.pdf`);
}

/* ══════════════════════════════════════════════════════════════
   Generación de PDF — Boletín Transición
   ══════════════════════════════════════════════════════════════ */

async function generateBoletinTransicionPDF(info, boletinData, meta) {
  /* ── Procesar datos (misma lógica que useBoletinTransicionProcessed) ── */
  const asigMap = new Map();
  for (const r of boletinData) {
    const asigKey = String(r.id_asignatura);
    if (!asigMap.has(asigKey)) {
      asigMap.set(asigKey, {
        id_asignatura: r.id_asignatura,
        nombre_asignatura: r.nombre_asignatura ?? "-",
        nombre_docente: r.nombre_docente ?? "-",
        filas: [],
      });
    }
    const asig = asigMap.get(asigKey);
    const existingIdx = asig.filas.findIndex(
      (d) =>
        String(d.id_dba) === String(r.id_dba) &&
        String(d.id_proposito) === String(r.id_proposito),
    );
    if (existingIdx === -1) {
      asig.filas.push({
        id_dba: r.id_dba,
        id_proposito: r.id_proposito,
        nombre_proposito: r.nombre_proposito ?? "-",
        nombre_dba: r.nombre_dba ?? "-",
        descripcion_notas: r.descripcion_nota
          ? r.descripcion_nota
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        descripcion_nota_elegida: r.descripcion_nota_elegida ?? "-",
        comentario: r.comentario ?? "",
        estado: r.estado ?? "",
      });
    } else {
      const notasParsed = r.descripcion_nota
        ? r.descripcion_nota
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      for (const nota of notasParsed) {
        if (!asig.filas[existingIdx].descripcion_notas.includes(nota)) {
          asig.filas[existingIdx].descripcion_notas.push(nota);
        }
      }
    }
  }
  const asignaturas = Array.from(asigMap.values());

  /* ── Configuración PDF ── */
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;

  let y = await drawPDFHeader(pdf, info, "BOLETÍN DE NOTAS — GRADO TRANSICIÓN");

  const addPageIfNeeded = (needed) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  /* ── Helper: dibujar texto multilínea en celda ── */
  const drawMultiCell = (text, cx, cy, w, h, opts = {}) => {
    const {
      bold = false,
      fontSize = 6,
      align = "left",
      color = [0, 0, 0],
      bg = null,
    } = opts;
    if (bg) {
      pdf.setFillColor(...bg);
      pdf.rect(cx, cy, w, h, "F");
    }
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.2);
    pdf.rect(cx, cy, w, h, "D");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(String(text ?? "-"), w - 2);
    const lineH = fontSize * 0.45;
    const blockH = lines.length * lineH;
    let startY = cy + (h - blockH) / 2 + lineH * 0.8;
    for (const line of lines) {
      if (startY > cy + h - 1) break;
      const tx = align === "center" ? cx + w / 2 : cx + 1;
      pdf.text(line, tx, startY, {
        align: align === "center" ? "center" : "left",
      });
      startY += lineH;
    }
  };

  /* ── Anchos de columnas ── */
  const colW = [
    contentW * 0.18, // Propósito
    contentW * 0.25, // DBA
    contentW * 0.1, // Valor asignado
    contentW * 0.22, // Otros posibles valores
    contentW * 0.25, // Comentario
  ];
  const colX = [margin];
  for (let i = 1; i < 5; i++) colX.push(colX[i - 1] + colW[i - 1]);

  /* ── Tablas por asignatura ── */
  for (const asig of asignaturas) {
    /* Barra de asignatura */
    addPageIfNeeded(16);
    pdf.setFillColor(19, 26, 39);
    pdf.rect(margin, y, contentW, 7, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(asig.nombre_asignatura, margin + 3, y + 5);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Docente: ${asig.nombre_docente}`, pageW - margin - 3, y + 5, {
      align: "right",
    });
    y += 7;

    /* Cabecera de tabla */
    const headerH = 6;
    const headers = [
      "Propósito",
      "DBA",
      "Valor asignado",
      "Otros posibles valores",
      "Comentario",
    ];
    const headerBg = [30, 45, 66];
    const headerColor = [229, 231, 235];
    for (let c = 0; c < 5; c++) {
      drawMultiCell(headers[c], colX[c], y, colW[c], headerH, {
        bold: true,
        fontSize: 6,
        align: "center",
        color: headerColor,
        bg: headerBg,
      });
    }
    y += headerH;

    /* Filas de datos */
    for (let fi = 0; fi < asig.filas.length; fi++) {
      const fila = asig.filas[fi];
      const rowBg = fi % 2 === 0 ? [249, 250, 251] : [255, 255, 255];

      /* Calcular alto dinámico de la fila */
      pdf.setFontSize(6);
      const propLines = pdf.splitTextToSize(fila.nombre_proposito, colW[0] - 2);
      const dbaLines = pdf.splitTextToSize(fila.nombre_dba, colW[1] - 2);
      const notasText =
        fila.descripcion_notas.length > 0
          ? fila.descripcion_notas.join("\n")
          : "-";
      const notasLines = pdf.splitTextToSize(notasText, colW[3] - 2);
      const comentLines = pdf.splitTextToSize(
        fila.comentario || "-",
        colW[4] - 2,
      );
      const maxLines = Math.max(
        propLines.length,
        dbaLines.length,
        notasLines.length,
        comentLines.length,
        1,
      );
      const lineH = 6 * 0.45;
      const rowH = Math.max(6, maxLines * lineH + 3);

      addPageIfNeeded(rowH);

      drawMultiCell(fila.nombre_proposito, colX[0], y, colW[0], rowH, {
        bg: rowBg,
      });
      drawMultiCell(fila.nombre_dba, colX[1], y, colW[1], rowH, {
        bg: rowBg,
      });
      drawMultiCell(
        (fila.descripcion_nota_elegida ?? "-").toUpperCase(),
        colX[2],
        y,
        colW[2],
        rowH,
        { bold: true, fontSize: 7, align: "center", bg: rowBg },
      );
      drawMultiCell(notasText, colX[3], y, colW[3], rowH, {
        bg: rowBg,
      });
      drawMultiCell(fila.comentario || "-", colX[4], y, colW[4], rowH, {
        color: [107, 114, 128],
        bg: rowBg,
      });
      y += rowH;
    }

    y += 4;
  }

  pdf.save(
    `Boletin_Transicion_${meta.studentId}_${meta.year}_P${meta.periodId}.pdf`,
  );
}

/* ══════════════════════════════════════════════════════════════
   Componente principal: BoletinSelector
   ══════════════════════════════════════════════════════════════ */
const BoletinSelector = ({
  studentId,
  studentInfo: studentInfoProp,
  mode = "single",
  students = [],
}) => {
  const { getInstitutionScales } = useSchool();
  const { rol } = useAuth();
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => [currentYear, currentYear + 1, currentYear + 2],
    [currentYear],
  );
  const [periodId, setPeriodId] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [boletinData, setBoletinData] = useState(null);
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  // Progreso para modo "all": null = no iniciado, { current, total, errors[] }
  const [progress, setProgress] = useState(null);
  const [isTransicion, setIsTransicion] = useState(false);

  const { periodos, asignaturas, promedioGeneral, resumenEstado } =
    useBoletinProcessed(!isTransicion ? (boletinData ?? []) : []);

  const rawInfo = boletinData?.[0] ?? {};
  const info = {
    ...rawInfo,
    nombre_estudiante:
      rawInfo.nombre_estudiante ??
      studentInfoProp?.nombre_estudiante ??
      studentInfoProp?.nombre,
    apellido_estudiante:
      rawInfo.apellido_estudiante ??
      studentInfoProp?.apellido_estudiante ??
      studentInfoProp?.apellido,
    numero_identificacion:
      rawInfo.numero_identificacion ??
      studentInfoProp?.numero_identificacion ??
      studentInfoProp?.identificacion,
  };
  console.log("Boletin info:", info);
  const totalCols = 2 + periodos.length * 4 + 2;

  const handleConsultar = async () => {
    if (!periodId) {
      setError("Selecciona un período.");
      return;
    }
    if (!year) {
      setError("Selecciona un año.");
      return;
    }
    setError(null);
    setBoletinData(null);
    setLoading(true);
    try {
      const fetchFn = isTransicion ? getBoletinDocente : getBoletin;
      const result = await fetchFn({
        studentId,
        periodId: Number(periodId),
        year: String(year),
        fk_rol: rol,
      });
      const rows = Array.isArray(result) ? result : [];
      setBoletinData(rows);

      if (rows.length > 0 && rows[0].id_institucion) {
        try {
          const sc = await getInstitutionScales(rows[0].id_institucion);
          setEscalas(Array.isArray(sc) ? sc : []);
        } catch {
          setEscalas([]);
        }
      }
    } catch (err) {
      setError(err?.message ?? "Error al obtener el boletín.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!boletinData?.length) return;
    setExportLoading(true);
    try {
      const metaObj = { studentId, year, periodId };
      if (isTransicion) {
        await generateBoletinTransicionPDF(info, boletinData, metaObj);
      } else {
        await generateBoletinPDF(
          info,
          periodos,
          asignaturas,
          promedioGeneral,
          resumenEstado,
          escalas,
          metaObj,
        );
      }
    } finally {
      setExportLoading(false);
    }
  };

  // ── Descarga en lote (mode="all") ─────────────────────────────────────────
  const handleDescargarTodos = async () => {
    if (!periodId) {
      setError("Selecciona un período.");
      return;
    }
    if (!year) {
      setError("Selecciona un año.");
      return;
    }
    if (!students.length) {
      setError("No hay estudiantes para descargar.");
      return;
    }
    setError(null);
    setProgress({ current: 0, total: students.length, errors: [] });
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const sid = student.id_estudiante ?? student.id_student ?? student.id;
      try {
        const fetchFn = isTransicion ? getBoletinDocente : getBoletin;
        const result = await fetchFn({
          studentId: sid,
          periodId: Number(periodId),
          year: String(year),
          fk_rol: rol,
        });
        const rows = Array.isArray(result) ? result : [];
        if (rows.length > 0) {
          const info0 = {
            ...rows[0],
            nombre_estudiante:
              rows[0].nombre_estudiante ??
              student.nombre_estudiante ??
              student.nombre,
            apellido_estudiante:
              rows[0].apellido_estudiante ??
              student.apellido_estudiante ??
              student.apellido,
            numero_identificacion:
              rows[0].numero_identificacion ??
              student.numero_identificacion ??
              student.identificacion,
          };
          const metaObj = { studentId: sid, year, periodId };
          if (isTransicion) {
            await generateBoletinTransicionPDF(info0, rows, metaObj);
          } else {
            let escalas0 = [];
            if (info0.id_institucion) {
              try {
                escalas0 = await getInstitutionScales(info0.id_institucion);
              } catch {
                /* silent */
              }
            }
            const {
              periodos: p,
              asignaturas: a,
              promedioGeneral: pg,
              resumenEstado: re,
            } = computeBoletinData(rows);
            await generateBoletinPDF(info0, p, a, pg, re, escalas0, metaObj);
          }
        }
      } catch (err) {
        const name =
          `${student.nombre_estudiante ?? student.nombre ?? "Estudiante"} ${student.apellido_estudiante ?? student.apellido ?? ""}`.trim();
        setProgress((prev) => ({
          ...prev,
          errors: [
            ...prev.errors,
            { name, error: err?.message ?? "Error desconocido" },
          ],
        }));
      }
      setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
    }
  };

  // ── Render modo ALL ───────────────────────────────────────────────────────
  if (mode === "all") {
    const done = progress !== null && progress.current === progress.total;
    const inProgress = progress !== null && !done;
    return (
      <div className="w-full flex flex-col gap-4">
        <p className="text-sm text-text/60">
          Se generará un boletín PDF por cada uno de los{" "}
          <strong>{students.length}</strong> estudiantes del curso.
        </p>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <PeriodSelector
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            disabled={inProgress}
          />
          <div>
            <label
              htmlFor="allBoletinYear"
              className="block text-sm font-medium"
            >
              Año
            </label>
            <select
              id="allBoletinYear"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={inProgress}
              className="w-full p-2 border rounded bg-surface"
              aria-label="Año del boletín"
            >
              <option value="">Selecciona un año</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <SimpleButton
            msj={done ? "Descargar de nuevo" : "Descargar todos"}
            icon="Download"
            bg="bg-secondary"
            text="text-surface"
            type="button"
            disabled={inProgress}
            onClick={() => {
              setProgress(null);
              handleDescargarTodos();
            }}
          />
        </div>
        {error && (
          <p className="text-sm rounded p-2 border border-red-200 bg-red-50 text-error">
            {error}
          </p>
        )}
        {progress !== null && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm whitespace-nowrap">
                {progress.current} / {progress.total}
              </span>
            </div>
            {done && (
              <p className="text-sm text-green-700 font-medium">
                ✓ Descarga completada
                {progress.errors.length > 0 &&
                  ` (${progress.errors.length} con error)`}
                .
              </p>
            )}
            {progress.errors.length > 0 && (
              <ul className="text-xs text-error list-disc pl-4">
                {progress.errors.map((e, i) => (
                  <li key={i}>
                    {e.name}: {e.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Checkbox Grado Transición ── */}
      <div className="flex items-center gap-2">
        <input
          id="boletin-checkbox-transicion"
          type="checkbox"
          checked={isTransicion}
          onChange={(e) => {
            setIsTransicion(e.target.checked);
            setBoletinData(null);
          }}
          disabled={loading}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
        <label
          htmlFor="boletin-checkbox-transicion"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Grado Transición
        </label>
      </div>

      {/* ── Filtros ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <PeriodSelector
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={loading}
        />
        <div>
          <label htmlFor="boletinYear" className="block text-sm font-medium">
            Año
          </label>
          <select
            id="boletinYear"
            name="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
            className="w-full p-2 border rounded bg-surface"
            aria-label="Año del boletín"
          >
            <option value="">Selecciona un año</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <SimpleButton
          msj="Consultar boletín"
          icon="Search"
          bg="bg-secondary"
          text="text-surface"
          type="button"
          disabled={loading}
          onClick={handleConsultar}
        />
      </div>

      {/* ── Mensajes de estado ── */}
      {error && (
        <p className="text-sm rounded p-2 border border-red-200 bg-red-50 text-error">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-center text-muted py-6">Cargando boletín...</p>
      )}
      {!loading && boletinData && boletinData.length === 0 && (
        <p className="text-center text-muted py-6">
          No se encontraron registros para el período y año seleccionados.
        </p>
      )}

      {/* ── Boletín + botón exportar ── */}
      {boletinData && boletinData.length > 0 && (
        <>
          <div className="flex justify-end">
            <SimpleButton
              msj="Exportar PDF"
              icon="FileDown"
              bg="bg-accent"
              text="text-surface"
              type="button"
              disabled={exportLoading}
              onClick={handleExportPDF}
              className="w-auto"
            />
          </div>

          {/* ── Vista HTML del boletín ── */}
          <div className="border rounded overflow-hidden shadow-sm">
            {isTransicion ? (
              <BoletinTransicionView boletinData={boletinData} info={info} />
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  padding: "24px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "11px",
                }}
              >
                {/* Encabezado */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    borderBottom: "2px solid #131a27",
                    paddingBottom: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {info.link_logo && (
                    <img
                      src={info.link_logo}
                      alt="Logo institución"
                      crossOrigin="anonymous"
                      style={{ width: 64, height: 64, objectFit: "contain" }}
                    />
                  )}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      {info.nombre_institucion ?? "-"}
                    </p>
                    <p
                      style={{
                        margin: "2px 0",
                        color: "#6b7280",
                        fontSize: "10px",
                      }}
                    >
                      NIT: {info.nit ?? "-"}
                    </p>
                    <p
                      style={{
                        margin: "2px 0",
                        fontWeight: "600",
                        fontSize: "11px",
                      }}
                    >
                      {info.nombre_sede ?? "-"}
                      {info.sede_tip ? ` — ${info.sede_tip}` : ""}
                    </p>
                    {info.grado && (
                      <p style={{ margin: "2px 0", fontSize: "11px" }}>
                        <strong>Grado:</strong> {info.grado}
                      </p>
                    )}
                    {(info.nombre_estudiante || info.apellido_estudiante) && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontWeight: "bold",
                          fontSize: "12px",
                          borderTop: "1px solid #d1d5db",
                          paddingTop: "4px",
                        }}
                      >
                        {[info.nombre_estudiante, info.apellido_estudiante]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                    {(info.numero_identificacion || info.identificacion) && (
                      <p
                        style={{
                          margin: "2px 0",
                          fontSize: "10px",
                          color: "#374151",
                        }}
                      >
                        <strong>Doc:</strong>{" "}
                        {info.numero_identificacion ?? info.identificacion}
                      </p>
                    )}
                    {(info.nombre_jornada || info.grupo) && (
                      <p style={{ margin: "2px 0", fontSize: "10px" }}>
                        {info.nombre_jornada && (
                          <span>
                            <strong>Jornada:</strong> {info.nombre_jornada}
                          </span>
                        )}
                        {info.nombre_jornada && info.grupo && <span> — </span>}
                        {info.grupo && (
                          <span>
                            <strong>Grupo:</strong> {info.grupo}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "10px",
                      color: "#374151",
                    }}
                  >
                    <p style={{ margin: "2px 0" }}>
                      <strong>Fecha:</strong> {formatDate(info.fecha)}
                    </p>
                  </div>
                </div>

                {/* Título */}
                <h2
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "13px",
                    marginBottom: "14px",
                    letterSpacing: "1px",
                  }}
                >
                  Boletín de Notas
                </h2>

                {/* Tabla */}
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#131a27", color: "#ffffff" }}
                      >
                        <th style={{ ...S.thLeft, verticalAlign: "middle" }}>
                          Asignatura
                        </th>
                        <th style={{ ...S.thLeft, verticalAlign: "middle" }}>
                          Docente
                        </th>
                        {periodos.map((p) => (
                          <th
                            key={p.id}
                            colSpan={4}
                            style={{ ...S.th, borderLeft: "2px solid #ffffff" }}
                          >
                            {p.nombre}
                          </th>
                        ))}
                        <th
                          style={{ ...S.th, verticalAlign: "middle" }}
                          title="Nota acumulada"
                        >
                          DF
                        </th>
                        <th style={{ ...S.th, verticalAlign: "middle" }}>
                          Estado Final
                        </th>
                      </tr>
                      <tr
                        style={{ backgroundColor: "#1e2d42", color: "#e5e7eb" }}
                      >
                        <th
                          style={{
                            ...S.thLeft,
                            fontSize: "8px",
                            color: "#94a3b8",
                          }}
                        >
                          &nbsp;
                        </th>
                        <th
                          style={{
                            ...S.thLeft,
                            fontSize: "8px",
                            color: "#94a3b8",
                          }}
                        >
                          &nbsp;
                        </th>
                        {periodos.map((p) => (
                          <React.Fragment key={p.id}>
                            <th
                              style={{
                                ...S.th,
                                borderLeft: "2px solid #374151",
                                fontSize: "8px",
                              }}
                              title="Nota final periodo"
                            >
                              NFP
                            </th>
                            <th style={{ ...S.th, fontSize: "8px" }}>Recup.</th>
                            <th style={{ ...S.th, fontSize: "8px" }}>Escala</th>
                            <th style={{ ...S.th, fontSize: "8px" }}>Estado</th>
                          </React.Fragment>
                        ))}
                        <th
                          style={{ ...S.th, fontSize: "8px", color: "#94a3b8" }}
                        >
                          &nbsp;
                        </th>
                        <th
                          style={{ ...S.th, fontSize: "8px", color: "#94a3b8" }}
                        >
                          &nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaturas.map((asig, idx) => {
                        const rowBg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
                        const logroBg = idx % 2 === 0 ? "#eef2ff" : "#f5f5f0";
                        const tieneLogros = periodos.some((p) => {
                          const per = asig.periodos.get(p.id);
                          return (
                            per &&
                            (per.logros.length > 0 ||
                              per.logro_nota_estudiante ||
                              per.notas?.length > 0)
                          );
                        });
                        return (
                          <React.Fragment key={asig.nombre_asignatura}>
                            <tr style={{ backgroundColor: rowBg }}>
                              <td style={S.tdBold}>{asig.nombre_asignatura}</td>
                              <td
                                style={{
                                  ...S.tdLeft,
                                  fontSize: "9px",
                                  color: "#6b7280",
                                }}
                              >
                                {asig.nombre_docente}
                              </td>
                              {periodos.map((p) => {
                                const per = asig.periodos.get(p.id);
                                return (
                                  <React.Fragment key={p.id}>
                                    <td
                                      style={{
                                        ...S.td,
                                        borderLeft: "2px solid #d1d5db",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {per?.nota ?? "-"}
                                    </td>
                                    <td style={S.td}>
                                      {per?.recuperacion ?? "-"}
                                    </td>
                                    <td style={S.td}>{per?.escala ?? "-"}</td>
                                    <td
                                      style={{
                                        ...S.td,
                                        color: per
                                          ? colorEstado(per.estado)
                                          : "#374151",
                                        fontWeight: "600",
                                        fontSize: "9px",
                                      }}
                                    >
                                      {per?.estado ?? "-"}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                              <td
                                style={{
                                  ...S.td,
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                }}
                              >
                                {asig.definitiva}
                              </td>
                              <td
                                style={{
                                  ...S.td,
                                  fontWeight: "600",
                                  color: colorEstado(
                                    periodId !== "4"
                                      ? "En proceso"
                                      : asig.estado_final,
                                  ),
                                  fontSize: "9px",
                                }}
                              >
                                {periodId !== "4"
                                  ? "En proceso"
                                  : asig.estado_final}
                              </td>
                            </tr>
                            {tieneLogros && (
                              <tr style={{ backgroundColor: logroBg }}>
                                <td
                                  colSpan={totalCols}
                                  style={{
                                    padding: "3px 10px 5px",
                                    borderBottom: "1px solid #e5e7eb",
                                    fontSize: "9px",
                                    fontStyle: "italic",
                                    color: "#374151",
                                  }}
                                >
                                  {periodos.map((p) => {
                                    const per = asig.periodos.get(p.id);
                                    if (!per) return null;
                                    const items = [];
                                    if (per.notas?.length > 0)
                                      items.push(
                                        per.notas
                                          .map((n) => `${n.nombre}: ${n.valor}`)
                                          .join(" | "),
                                      );
                                    if (per.logros.length > 0)
                                      items.push(
                                        `Logros: ${per.logros.join(" | ")}`,
                                      );
                                    if (per.logro_nota_estudiante)
                                      items.push(
                                        `Logro estudiante: ${per.logro_nota_estudiante}`,
                                      );
                                    if (!items.length) return null;
                                    return (
                                      <span
                                        key={p.id}
                                        style={{ marginRight: "14px" }}
                                      >
                                        <strong>{p.nombre}: </strong>
                                        {items.join(" — ")}
                                      </span>
                                    );
                                  })}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Resumen */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "24px",
                    marginTop: "14px",
                    paddingTop: "10px",
                    borderTop: "2px solid #131a27",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}
                >
                  {promedioGeneral !== null && (
                    <span>
                      Promedio general:&nbsp;
                      <span style={{ color: colorEstado(resumenEstado) }}>
                        {promedioGeneral}
                      </span>
                    </span>
                  )}
                  <span>
                    Estado general:&nbsp;
                    <span
                      style={{
                        color: colorEstado(
                          periodId !== "4" ? "En proceso" : resumenEstado,
                        ),
                      }}
                    >
                      {periodId !== "4" ? "En proceso" : resumenEstado}
                    </span>
                  </span>
                </div>

                {/* Convenciones */}
                {escalas.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Convenciones
                    </p>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "10px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "6px 10px",
                              textAlign: "left",
                              fontWeight: "bold",
                              backgroundColor: "#f9fafb",
                              width: "20%",
                            }}
                          >
                            ESCALA
                          </th>
                          <th
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "6px 10px",
                              textAlign: "left",
                              fontWeight: "bold",
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            RANGO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {escalas.map((e, i) => {
                          const key = String(e.escala || "")
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "");
                          const descripcion = getEscalaDescripcion(key);
                          return (
                            <tr key={i}>
                              <td
                                style={{
                                  border: "1px solid #d1d5db",
                                  padding: "6px 10px",
                                  fontWeight: "bold",
                                }}
                              >
                                {e.escala}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #d1d5db",
                                  padding: "6px 10px",
                                }}
                              >
                                De {e.desde} a {e.hasta}
                                {descripcion && (
                                  <span
                                    style={{
                                      marginLeft: "4px",
                                      color: "#374151",
                                    }}
                                  >
                                    ({descripcion})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BoletinSelector;
