import { jsPDF } from "jspdf";
import React, { useEffect, useMemo, useState } from "react";
import {
  getBoletin,
  getBoletinDocente,
  getStudentGuardian,
} from "../../services/studentService";
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
    border: "1px solid #000000",
    fontWeight: "bold",
    fontSize: "9px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  thLeft: {
    padding: "5px 4px",
    textAlign: "center",
    border: "1px solid #000000",
    fontWeight: "bold",
    fontSize: "9px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  td: {
    padding: "4px 4px",
    border: "1px solid #000000",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  },
  tdLeft: {
    padding: "4px 4px",
    border: "1px solid #000000",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  },
  tdBold: {
    padding: "4px 4px",
    border: "1px solid #000000",
    fontSize: "9px",
    verticalAlign: "middle",
    textAlign: "center",
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
          notas: [],
        });
      }
      const per = asig.periodos.get(pid);
      if (r.nombre_tipo && r.descripcion) {
        const logroEntry = `${r.nombre_tipo}: ${r.descripcion}`;
        if (!per.logros.includes(logroEntry)) per.logros.push(logroEntry);
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
    const notas = [];
    for (const a of asignaturas) {
      for (const [, per] of a.periodos) {
        const v = parseFloat(per.nota);
        if (!isNaN(v)) notas.push(v);
      }
    }
    if (!notas.length) return null;
    return (notas.reduce((acc, v) => acc + v, 0) / notas.length).toFixed(2);
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
        notas: [],
      });
    }
    const per = asig.periodos.get(pid);
    if (r.nombre_tipo && r.descripcion) {
      const logroEntry = `${r.nombre_tipo}: ${r.descripcion}`;
      if (!per.logros.includes(logroEntry)) per.logros.push(logroEntry);
    }
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
  const _notasPromedio = [];
  for (const a of asignaturas) {
    for (const [, per] of a.periodos) {
      const v = parseFloat(per.nota);
      if (!isNaN(v)) _notasPromedio.push(v);
    }
  }
  const promedioGeneral = _notasPromedio.length
    ? (
        _notasPromedio.reduce((acc, v) => acc + v, 0) / _notasPromedio.length
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
          borderBottom: "2px solid #000000",
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
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "1px solid #000000",
              padding: "6px 10px",
              fontWeight: "bold",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {asig.nombre_asignatura}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#ffffff", color: "#000000" }}>
                <th
                  style={{
                    ...S.th,
                    width: "20%",
                    fontSize: "8px",
                  }}
                >
                  Propósito
                </th>
                <th
                  style={{
                    ...S.th,
                    width: "25%",
                    fontSize: "8px",
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
                return (
                  <tr
                    key={`${fila.id_proposito}-${fila.id_dba}`}
                    style={{ backgroundColor: "#ffffff" }}
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
                        color: "#111827",
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
                        color: "#111827",
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

async function drawPDFHeader(pdf, info, title, options = {}) {
  const { skipStudentData = false } = options;
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
          const maxDim = 192;
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
          resolve(canvas.toDataURL("image/jpeg", 0.99));
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
  if (!skipStudentData) {
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
  }

  if (logoData) {
    pdf.addImage(logoData, "JPEG", logoX, margin, logoSize, logoSize);
  }

  /* línea separadora */
  pdf.setDrawColor(0, 0, 0);
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

  let y = await drawPDFHeader(pdf, info, "BOLETÍN DE NOTAS", {
    skipStudentData: true,
  });

  const addPageIfNeeded = (needed) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  /* ── Tabla 3 cols: Estudiante | Periodo | Promedio ── */
  {
    const studentTableH = 8;
    addPageIfNeeded(studentTableH + 2);
    const col1W = contentW * 0.4;
    const col2W = contentW * 0.35;
    const col3W = contentW * 0.25;
    const nombreCompleto =
      [info.nombre_estudiante, info.apellido_estudiante]
        .filter(Boolean)
        .join(" ") || "-";
    const periodoNombre = info.nombre_periodo ?? periodos[0]?.nombre ?? "-";
    const promTexto = promedioGeneral !== null ? String(promedioGeneral) : "-";

    pdf.setDrawColor(17, 24, 39);
    pdf.setLineWidth(0.4);
    pdf.rect(margin, y, col1W, studentTableH, "D");
    pdf.rect(margin + col1W, y, col2W, studentTableH, "D");
    pdf.rect(margin + col1W + col2W, y, col3W, studentTableH, "D");

    const drawStudentCell = (label, value, cx, cw) => {
      const textY = y + studentTableH / 2 + 1.5;
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(label, cx + 2, textY);
      pdf.setFont("helvetica", "normal");
      const labelW = pdf.getTextWidth(label);
      let val = value;
      const maxW = cw - labelW - 4;
      while (pdf.getTextWidth(val) > maxW && val.length > 1)
        val = val.slice(0, -1);
      pdf.text(val, cx + 2 + labelW, textY);
    };

    drawStudentCell("ESTUDIANTE: ", nombreCompleto, margin, col1W);
    drawStudentCell("PERIODO: ", periodoNombre, margin + col1W, col2W);
    drawStudentCell(
      "NOTA PROMEDIO PERIODO: ",
      promTexto,
      margin + col1W + col2W,
      col3W,
    );
    y += studentTableH + 4;
  }

  /* ── Escala Valorativa ── */
  {
    const escalaRowH = 7;
    addPageIfNeeded(escalaRowH * 2 + 2);

    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    const levels = escalas.map((e) => ({
      label: String(e.escala ?? ""),
      code: String(e.escala ?? ""),
      range: `(${e.desde} - ${e.hasta})`,
    }));

    // Fila 1: título centrado + fecha a la derecha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, y, contentW, escalaRowH, "D");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "ESCALA VALORATIVA",
      margin + contentW / 2,
      y + escalaRowH / 2 + 1.5,
      { align: "center" },
    );

    y += escalaRowH;

    // Fila 2: columnas de niveles — "label = CODE range"
    const lvlColW = contentW / levels.length;
    pdf.setFontSize(6.5);
    for (let i = 0; i < levels.length; i++) {
      const cx = margin + i * lvlColW;
      pdf.rect(cx, y, lvlColW, escalaRowH, "D");
      const { label, code, range } = levels[i];
      const textY = y + escalaRowH / 2 + 1.5;
      const startX = cx + 1.5;

      pdf.setFont("helvetica", "bold");
      pdf.text(label, startX, textY);
      const labelW = pdf.getTextWidth(label);

      pdf.setFont("helvetica", "normal");
      pdf.text(` = ${range}`, startX + labelW, textY);
    }
    y += escalaRowH + 4;
  }

  /* ── Tabla de notas ── */
  // Columnas: Asignatura | [por cada periodo: Nota, Recup, Escala, Estado, Logro]
  const periodCols = periodos.length * 5;
  const fixedCols = 1; // Asignatura

  // Anchos proporcionales
  const asigW = contentW * 0.18;
  const remainW = contentW - asigW;
  // Subcolumnas: Nota, Escala usan smallSubW; Estado usa estadoSubW más ancho; Logro ocupa el resto
  const smallSubW =
    periodos.length > 0 ? (remainW * 0.2) / (periodos.length * 2) : 0;
  const estadoSubW =
    periodos.length > 0 ? (remainW * 0.18) / periodos.length : 0;
  const logroSubW =
    periodos.length > 0
      ? (remainW -
          smallSubW * 2 * periodos.length -
          estadoSubW * periodos.length) /
        periodos.length
      : 0;

  const colWidths = [asigW];
  for (let i = 0; i < periodos.length; i++) {
    colWidths.push(smallSubW, smallSubW, estadoSubW, logroSubW);
  }

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
    if (bg) {
      pdf.setFillColor(...bg);
      pdf.rect(cx, cy, w, h, "F");
    }
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
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

  const drawCellMultiline = (text, col, cy, h, opts = {}) => {
    const {
      bold = false,
      fontSize = 5,
      color = [0, 0, 0],
      bg = null,
      align = "left",
    } = opts;
    const cx = colX(col);
    const w = colWidths[col];
    if (bg) {
      pdf.setFillColor(...bg);
      pdf.rect(cx, cy, w, h, "F");
    }
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(cx, cy, w, h, "D");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(String(text ?? "-"), w - 1.5);
    const lineH = fontSize * 0.45;
    const blockH = lines.length * lineH;
    let startY = cy + (h - blockH) / 2 + lineH * 0.8;
    for (const line of lines) {
      const tx = align === "center" ? cx + w / 2 : cx + 0.8;
      pdf.text(line, tx, startY, {
        align: align === "center" ? "center" : "left",
      });
      startY += lineH;
    }
  };

  /* Fila de cabecera principal */
  addPageIfNeeded(rowH + subHeaderH);
  const headerBg = [255, 255, 255];
  const headerColor = [0, 0, 0];
  drawCell("Asignatura", 0, y, rowH + subHeaderH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
    align: "center",
  });

  // Cabeceras agrupadas por periodo (colspan manual)
  for (let pi = 0; pi < periodos.length; pi++) {
    const startCol = 1 + pi * 4;
    const cx = colX(startCol);
    const groupW = smallSubW * 2 + estadoSubW + logroSubW;
    pdf.setFillColor(...headerBg);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(cx, y, groupW, rowH, "FD");
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...headerColor);
    pdf.text(periodos[pi].nombre, cx + groupW / 2, y + rowH / 2 + 1.5, {
      align: "center",
    });
  }
  y += rowH;

  /* Sub-cabecera (NFP, Recup, Escala, Estado) */
  const subBg = [255, 255, 255];
  const subColor = [0, 0, 0];
  // col 0 ya fue dibujada combinada arriba; solo sub-cols de periodos
  for (let pi = 0; pi < periodos.length; pi++) {
    const base = 1 + pi * 4;
    drawCell("Nota", base, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Escala", base + 1, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Estado", base + 2, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
    drawCell("Logro", base + 3, y, subHeaderH, {
      bold: true,
      fontSize: 5,
      color: subColor,
      bg: subBg,
    });
  }
  y += subHeaderH;

  /* Filas de datos */
  for (let idx = 0; idx < asignaturas.length; idx++) {
    const asig = asignaturas[idx];
    const rowBg = [255, 255, 255];

    // Altura dinámica según longitud del logro
    let computedRowH = rowH;
    for (let pi = 0; pi < periodos.length; pi++) {
      const per = asig.periodos.get(periodos[pi].id);
      {
        const logroColW = colWidths[1 + pi * 4 + 3];
        const lineH = 5 * 0.45;
        const logros = per?.logros ?? [];
        let logroHeight = 2; // padding top
        if (logros.length === 0) {
          logroHeight += lineH;
        } else {
          for (const logro of logros) {
            const sep = logro.indexOf(": ");
            if (sep === -1) {
              pdf.setFontSize(5);
              pdf.setFont("helvetica", "normal");
              logroHeight +=
                pdf.splitTextToSize(logro, logroColW - 1.5).length * lineH;
            } else {
              pdf.setFontSize(5);
              pdf.setFont("helvetica", "bold");
              logroHeight +=
                pdf.splitTextToSize(logro.slice(0, sep), logroColW - 1.5)
                  .length * lineH;
              pdf.setFont("helvetica", "normal");
              logroHeight +=
                pdf.splitTextToSize(logro.slice(sep + 2), logroColW - 1.5)
                  .length * lineH;
            }
            logroHeight += lineH * 0.5; // espaciado entre logros
          }
        }
        logroHeight += 7; // reserva para "Obs. énfasis:"
        if (logroHeight > computedRowH) computedRowH = logroHeight;
      }
      const estadoText = per?.estado || "-";
      const estadoColW = colWidths[1 + pi * 4 + 2];
      const estadoLines = pdf.splitTextToSize(estadoText, estadoColW - 1.5);
      const estadoNeeded = estadoLines.length * (5 * 0.45) + 2;
      if (estadoNeeded > computedRowH) computedRowH = estadoNeeded;
    }
    addPageIfNeeded(computedRowH);

    drawCell(asig.nombre_asignatura, 0, y, computedRowH, {
      bold: true,
      fontSize: 6,
      align: "center",
      bg: rowBg,
    });

    for (let pi = 0; pi < periodos.length; pi++) {
      const per = asig.periodos.get(periodos[pi].id);
      const base = 1 + pi * 4;
      drawCell(per?.nota ?? "-", base, y, computedRowH, {
        bold: true,
        bg: rowBg,
      });
      drawCell(per?.escala ?? "-", base + 1, y, computedRowH, { bg: rowBg });
      const estColor = per?.estado
        ? colorEstado(per.estado) === "#15803d"
          ? [21, 128, 61]
          : [220, 38, 38]
        : [55, 65, 81];
      drawCellMultiline(per?.estado ?? "-", base + 2, y, computedRowH, {
        bold: true,
        align: "center",
        color: estColor,
        bg: rowBg,
      });
      {
        const cx = colX(base + 3);
        const w = colWidths[base + 3];
        pdf.setFillColor(...rowBg);
        pdf.rect(cx, y, w, computedRowH, "F");
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);
        pdf.rect(cx, y, w, computedRowH, "D");
        const logros = per?.logros ?? [];
        const lineH = 5 * 0.45;
        const obsY = y + computedRowH - 6;
        const logroMaxY = obsY - 1;
        if (logros.length === 0) {
          pdf.setFontSize(5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
          pdf.text("-", cx + 1, y + 4);
        } else {
          let textY = y + 2;
          outer: for (const logro of logros) {
            const sep = logro.indexOf(": ");
            if (sep === -1) {
              pdf.setFontSize(5);
              pdf.setFont("helvetica", "normal");
              pdf.setTextColor(0, 0, 0);
              for (const ln of pdf.splitTextToSize(logro, w - 1.5)) {
                if (textY + lineH * 0.8 > logroMaxY) break outer;
                pdf.text(ln, cx + 1, textY + lineH * 0.8);
                textY += lineH;
              }
            } else {
              const tipo = logro.slice(0, sep);
              const desc = logro.slice(sep + 2);
              pdf.setFontSize(5);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(0, 0, 0);
              for (const ln of pdf.splitTextToSize(tipo, w - 1.5)) {
                if (textY + lineH * 0.8 > logroMaxY) break outer;
                pdf.text(ln, cx + 1, textY + lineH * 0.8);
                textY += lineH;
              }
              pdf.setFont("helvetica", "normal");
              pdf.setTextColor(0, 0, 0);
              for (const ln of pdf.splitTextToSize(desc, w - 1.5)) {
                if (textY + lineH * 0.8 > logroMaxY) break outer;
                pdf.text(ln, cx + 1, textY + lineH * 0.8);
                textY += lineH;
              }
            }
            textY += lineH * 0.5;
          }
        }
        // Observaciones de énfasis siempre al fondo de la celda de logro
        {
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.15);
          pdf.line(cx + 1, obsY, cx + w - 1, obsY);
          pdf.setFontSize(5);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text("Obs. énfasis:", cx + 1, obsY + 3.5);
        }
      }
    }

    y += computedRowH;
  }

  /* ── Sección inferior boletín (4 filas) ── */
  y += 4;
  const labelColW = contentW * 0.35;
  const contentColW = contentW - labelColW;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);

  const drawLabelRow = (label, rowH) => {
    addPageIfNeeded(rowH);
    pdf.rect(margin, y, labelColW, rowH, "D");
    pdf.rect(margin + labelColW, y, contentColW, rowH, "D");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(label, margin + 2, y + 5);
    y += rowH;
  };

  // Fila 1: Desempeño convivencial
  drawLabelRow("DESEMPEÑO CONVIVENCIAL:", 18);
  // Fila 2: Histórico de periodo
  drawLabelRow("HISTÓRICO DE PERIODO:", 18);
  // Fila 3: Observaciones generales
  drawLabelRow("OBSERVACIONES GENERALES:", 22);
  // Fila 4: Firma del director de grupo (celda completa)
  const firmaRowH = 28;
  addPageIfNeeded(firmaRowH);
  pdf.rect(margin, y, contentW, firmaRowH, "D");
  if (info.firma_docente) {
    let firmaImgData = null;
    try {
      firmaImgData = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const maxW = 160,
            maxH = 56;
          let w = img.width,
            h = img.height;
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.99));
        };
        img.onerror = () => resolve(null);
        img.src = info.firma_docente;
      });
    } catch {
      firmaImgData = null;
    }
    if (firmaImgData) {
      const imgW = 40;
      const imgH = 16;
      const imgX = margin + (contentW - imgW) / 2;
      pdf.addImage(firmaImgData, "JPEG", imgX, y + 2, imgW, imgH);
    }
  } else {
    // sin firma: se deja el espacio en blanco en el PDF
  }
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  const signLineW = 60;
  const signX = margin + (contentW - signLineW) / 2;
  pdf.line(signX, y + firmaRowH - 6, signX + signLineW, y + firmaRowH - 6);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    "FIRMA DEL DIRECTOR DE GRUPO",
    margin + contentW / 2,
    y + firmaRowH - 2,
    { align: "center" },
  );
  y += firmaRowH + 4;

  const nombreArchivo =
    [info.nombre_estudiante, info.apellido_estudiante]
      .filter(Boolean)
      .join("_")
      .replace(/\s+/g, "_") || meta.studentId;
  pdf.save(`Boletin_${nombreArchivo}_${meta.year}_P${meta.periodId}.pdf`);
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
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
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
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.rect(margin, y, contentW, 7, "FD");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(asig.nombre_asignatura, margin + contentW / 2, y + 5, {
      align: "center",
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
    const headerBg = [255, 255, 255];
    const headerColor = [0, 0, 0];
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
      const rowBg = [255, 255, 255];

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
        color: [0, 0, 0],
        bg: rowBg,
      });
      y += rowH;
    }

    y += 4;
  }

  const nombreArchivoT =
    [info.nombre_estudiante, info.apellido_estudiante]
      .filter(Boolean)
      .join("_")
      .replace(/\s+/g, "_") || meta.studentId;
  pdf.save(
    `Boletin_Transicion_${nombreArchivoT}_${meta.year}_P${meta.periodId}.pdf`,
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
  const { rol, idPersona, userName, firmaDocente } = useAuth();
  const isGuardian = rol === 5 || rol === "5";
  const isStudent = rol === 6 || rol === "6";
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

  // ── Estados para acudiente (rol 5) ─────────────────────────────────────
  const [guardianStudents, setGuardianStudents] = useState([]);
  const [loadingGuardianStudents, setLoadingGuardianStudents] = useState(false);
  const [selectedGuardianStudentId, setSelectedGuardianStudentId] =
    useState("");

  useEffect(() => {
    if (!isGuardian || !idPersona) return;
    let cancelled = false;
    const load = async () => {
      setLoadingGuardianStudents(true);
      try {
        const data = await getStudentGuardian({
          idPersonaGuardian: Number(idPersona),
        });
        if (!cancelled) setGuardianStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "BoletinSelector - error al cargar estudiantes del acudiente:",
          err,
        );
        if (!cancelled) setGuardianStudents([]);
      } finally {
        if (!cancelled) setLoadingGuardianStudents(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isGuardian, idPersona]);

  const { periodos, asignaturas, promedioGeneral, resumenEstado } =
    useBoletinProcessed(!isTransicion ? (boletinData ?? []) : []);

  const rawInfo = boletinData?.[0] ?? {};
  const selectedGuardianStudent = isGuardian
    ? guardianStudents.find(
        (s) => String(s.id_estudiante) === String(selectedGuardianStudentId),
      )
    : null;
  const info = {
    ...rawInfo,
    nombre_estudiante:
      rawInfo.nombre_estudiante ??
      studentInfoProp?.nombre_estudiante ??
      studentInfoProp?.nombre ??
      selectedGuardianStudent?.concat_ws ??
      (isStudent ? userName : undefined),
    apellido_estudiante:
      rawInfo.apellido_estudiante ??
      studentInfoProp?.apellido_estudiante ??
      studentInfoProp?.apellido,
    numero_identificacion:
      rawInfo.numero_identificacion ??
      studentInfoProp?.numero_identificacion ??
      studentInfoProp?.identificacion,
    firma_docente: firmaDocente ?? null,
  };

  const handleConsultar = async () => {
    if (!periodId) {
      setError("Selecciona un período.");
      return;
    }
    if (!year) {
      setError("Selecciona un año.");
      return;
    }
    if (isGuardian && !selectedGuardianStudentId) {
      setError("Selecciona un estudiante.");
      return;
    }
    setError(null);
    setBoletinData(null);
    setLoading(true);
    try {
      const fetchFn = isTransicion ? getBoletinDocente : getBoletin;
      const effectiveStudentId = isGuardian
        ? selectedGuardianStudentId
        : studentId;
      const effectiveRol = isGuardian ? 6 : rol;
      const result = await fetchFn({
        studentId: effectiveStudentId,
        periodId: Number(periodId),
        year: String(year),
        fk_rol: String(effectiveRol),
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
          Valoración Cualitativa
        </label>
      </div>

      {/* ── Selector de estudiante (solo acudiente rol 5) ── */}
      {isGuardian && (
        <div>
          <label
            htmlFor="boletin-guardian-student"
            className="block text-sm font-medium"
          >
            Estudiante
          </label>
          {loadingGuardianStudents ? (
            <p className="text-sm text-muted py-1">Cargando estudiantes...</p>
          ) : (
            <select
              id="boletin-guardian-student"
              value={selectedGuardianStudentId}
              onChange={(e) => {
                setSelectedGuardianStudentId(e.target.value);
                setBoletinData(null);
              }}
              disabled={loading}
              className="w-full p-2 border rounded bg-surface"
              aria-label="Estudiante del acudiente"
            >
              <option value="">Selecciona un estudiante</option>
              {guardianStudents.map((s) => (
                <option key={s.id_estudiante} value={s.id_estudiante}>
                  {s.concat_ws}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

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
                {/* ── Encabezado institución ── */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    borderBottom: "2px solid #000000",
                    paddingBottom: "12px",
                    marginBottom: "10px",
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
                        fontSize: "14px",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      {info.nombre_institucion ?? "-"}
                    </p>
                    {info.nit && (
                      <p style={{ margin: "2px 0", fontSize: "10px" }}>
                        NIT: {info.nit}
                      </p>
                    )}
                    {info.nombre_sede && (
                      <p
                        style={{
                          margin: "2px 0",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                      >
                        {info.nombre_sede}
                        {info.sede_tip ? ` — ${info.sede_tip}` : ""}
                      </p>
                    )}
                    {info.grado && (
                      <p style={{ margin: "2px 0", fontSize: "11px" }}>
                        <strong>Grado:</strong> {info.grado}
                      </p>
                    )}
                    {info.resolucion && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "9px",
                          fontStyle: "italic",
                          color: "#374151",
                        }}
                      >
                        {info.resolucion}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Bloque datos del estudiante ── */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "2px solid #111827",
                    fontSize: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "4px 8px",
                          width: "40%",
                        }}
                      >
                        <strong>ESTUDIANTE:</strong>{" "}
                        {[info.nombre_estudiante, info.apellido_estudiante]
                          .filter(Boolean)
                          .join(" ") || "-"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "4px 8px",
                          width: "35%",
                        }}
                      >
                        {(info.nombre_periodo || periodos[0]?.nombre) && (
                          <span>
                            <strong>PERIODO:</strong>{" "}
                            {info.nombre_periodo ?? periodos[0]?.nombre}
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "4px 8px",
                          width: "25%",
                        }}
                      >
                        {promedioGeneral !== null && (
                          <span>
                            <strong>NOTA PROMEDIO PERIODO:</strong>{" "}
                            {promedioGeneral}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── Escala Valorativa ── */}
                {(() => {
                  const levels = escalas.map((e) => ({
                    label: String(e.escala ?? ""),
                    range: `( ${e.desde} - ${e.hasta} )`,
                  }));
                  const now = new Date();
                  const pad2 = (n) => String(n).padStart(2, "0");
                  const dateStr = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
                  return (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #111827",
                        fontSize: "9px",
                        marginBottom: "10px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            colSpan={levels.length}
                            style={{
                              border: "1px solid #111827",
                              padding: "3px 6px",
                              fontWeight: "bold",
                              textAlign: "center",
                              fontSize: "10px",
                              position: "relative",
                            }}
                          >
                            ESCALA VALORATIVA
                          </td>
                        </tr>
                        <tr>
                          {levels.map((lvl, i) => (
                            <td
                              key={i}
                              style={{
                                border: "1px solid #111827",
                                padding: "3px 6px",
                                width: `${100 / levels.length}%`,
                              }}
                            >
                              <strong> {lvl.label}</strong> = {lvl.range}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}

                {/* ── Tabla por asignatura ── */}
                {asignaturas.map((asig, idx) => {
                  return (
                    <div
                      key={asig.nombre_asignatura}
                      style={{ marginBottom: "10px", overflowX: "auto" }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                        }}
                      >
                        <colgroup>
                          <col style={{ width: "25%" }} />
                          {periodos.map((p) => (
                            <React.Fragment key={p.id}>
                              <col
                                style={{
                                  width: `${(4.6 / periodos.length).toFixed(2)}%`,
                                }}
                              />
                              <col
                                style={{
                                  width: `${(4.6 / periodos.length).toFixed(2)}%`,
                                }}
                              />
                              <col
                                style={{
                                  width: `${(12.42 / periodos.length).toFixed(2)}%`,
                                }}
                              />
                              <col
                                style={{
                                  width: `${(53.58 / periodos.length).toFixed(2)}%`,
                                }}
                              />
                            </React.Fragment>
                          ))}
                        </colgroup>
                        <thead>
                          <tr
                            style={{
                              backgroundColor: "#ffffff",
                              color: "#000000",
                            }}
                          >
                            <th
                              rowSpan={2}
                              style={{ ...S.thLeft, verticalAlign: "middle" }}
                            >
                              Asignatura
                            </th>
                            {periodos.map((p) => (
                              <th
                                key={p.id}
                                colSpan={4}
                                style={{
                                  ...S.th,
                                  borderLeft: "2px solid #000000",
                                }}
                              >
                                {p.nombre}
                              </th>
                            ))}
                          </tr>
                          <tr
                            style={{
                              backgroundColor: "#ffffff",
                              color: "#000000",
                            }}
                          >
                            {periodos.map((p) => (
                              <React.Fragment key={p.id}>
                                <th
                                  style={{
                                    ...S.th,
                                    borderLeft: "2px solid #000000",
                                    fontSize: "8px",
                                  }}
                                  title="Nota final periodo"
                                >
                                  Nota
                                </th>
                                <th style={{ ...S.th, fontSize: "8px" }}>
                                  Escala
                                </th>
                                <th style={{ ...S.th, fontSize: "8px" }}>
                                  Estado
                                </th>
                                <th style={{ ...S.th, fontSize: "8px" }}>
                                  Logro
                                </th>
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ backgroundColor: "#ffffff" }}>
                            <td style={S.tdBold}>{asig.nombre_asignatura}</td>
                            {periodos.map((p) => {
                              const per = asig.periodos.get(p.id);
                              return (
                                <React.Fragment key={p.id}>
                                  <td
                                    style={{
                                      ...S.td,
                                      borderLeft: "2px solid #000000",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {per?.nota ?? "-"}
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
                                  <td
                                    style={{
                                      ...S.tdLeft,
                                      fontSize: "8px",
                                      color: "#111827",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {per?.logros?.length
                                      ? per.logros.map((l, i) => {
                                          const sep = l.indexOf(": ");
                                          if (sep === -1)
                                            return <div key={i}>{l}</div>;
                                          return (
                                            <div key={i}>
                                              <span
                                                style={{
                                                  fontWeight: 900,
                                                  fontStyle: "normal",
                                                }}
                                              >
                                                {l.slice(0, sep)}
                                              </span>
                                              {l.slice(sep)}
                                            </div>
                                          );
                                        })
                                      : "-"}
                                    <div
                                      style={{
                                        marginTop: "4px",
                                        fontWeight: "bold",
                                        fontStyle: "normal",
                                        color: "#111827",
                                        fontSize: "8px",
                                        borderTop: "1px solid #000000",
                                        paddingTop: "2px",
                                      }}
                                    >
                                      Observaciones de énfasis:
                                    </div>
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                {/* ── Sección inferior boletín ── */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "16px",
                    border: "1px solid #111827",
                    fontSize: "11px",
                  }}
                >
                  <tbody>
                    {/* Fila 1: Desempeño convivencial */}
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          width: "35%",
                          fontWeight: "bold",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        DESEMPEÑO CONVIVENCIAL:
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          height: "50px",
                          verticalAlign: "top",
                        }}
                      />
                    </tr>
                    {/* Fila 2: Histórico de periodo */}
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          fontWeight: "bold",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        HISTÓRICO DE PERIODO:
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          height: "50px",
                          verticalAlign: "top",
                        }}
                      />
                    </tr>
                    {/* Fila 3: Observaciones generales */}
                    <tr>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          fontWeight: "bold",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        OBSERVACIONES GENERALES:
                      </td>
                      <td
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          height: "70px",
                          verticalAlign: "top",
                        }}
                      />
                    </tr>
                    {/* Fila 4: Firma del director de grupo */}
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid #111827",
                          padding: "6px 8px",
                          height: "70px",
                          verticalAlign: "bottom",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            height: "100%",
                            paddingBottom: "4px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            {info.firma_docente ? (
                              <img
                                src={info.firma_docente}
                                alt="Firma director"
                                crossOrigin="anonymous"
                                style={{
                                  maxHeight: "40px",
                                  maxWidth: "160px",
                                  objectFit: "contain",
                                  display: "block",
                                  margin: "0 auto 4px",
                                }}
                              />
                            ) : (
                              <p
                                style={{
                                  fontSize: "9px",
                                  color: "#9ca3af",
                                  fontStyle: "italic",
                                  marginBottom: "4px",
                                }}
                              >
                                Sin Firma en el sistema
                              </p>
                            )}
                            <div
                              style={{
                                borderBottom: "1px solid #111827",
                                minWidth: "200px",
                                marginBottom: "4px",
                              }}
                            />
                            <span
                              style={{ fontWeight: "bold", fontSize: "10px" }}
                            >
                              FIRMA DEL DIRECTOR DE GRUPO
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>


              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BoletinSelector;
