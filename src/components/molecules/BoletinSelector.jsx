import { jsPDF } from "jspdf";
import React, { useEffect, useMemo, useState } from "react";
import {
  getBoletin,
  getBoletinDocente,
  getStudentGuardian,
} from "../../services/studentService";
import useSchool from "../../lib/hooks/useSchool";
import { abreviarAsignatura } from "../../utils/formatUtils";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import useAuth from "../../lib/hooks/useAuth";
import useStudent from "../../lib/hooks/useStudent";

/* ── Helpers ── */
const cleanPeriodoLabel = (label) => {
  if (!label) return "-";
  return label.replace(/Periodo\s*/i, "").trim() || "-";
};

const buildRankingMap = (data) => {
  const m = new Map();
  for (const row of data ?? []) {
    if (Array.isArray(row.ranking)) {
      for (const rank of row.ranking) {
        m.set(String(rank.id_periodo), rank);
      }
    }
  }
  return m;
};

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

/* ── Helpers de nota efectiva (recuperación vs periodo) ── */
const _computeNotaEfectiva = (notaPeriodo, notaRecuperacion) => {
  if (notaRecuperacion == null) return notaPeriodo;
  const pV = parseFloat(notaPeriodo);
  const rV = parseFloat(notaRecuperacion);
  if (isNaN(pV) || isNaN(rV)) return notaRecuperacion ?? notaPeriodo;
  return String(Math.max(pV, rV));
};

/* ── Hooks de procesamiento de datos del boletín ── */
const useBoletinProcessed = (data, periodId) => {
  const periodos = useMemo(() => {
    const m = new Map();
    for (const r of data) {
      if (
        r.id_periodo &&
        String(r.id_periodo) === String(periodId) &&
        !m.has(r.id_periodo)
      ) {
        m.set(r.id_periodo, r.nombre_periodo || `Periodo ${r.id_periodo}`);
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([id, nombre]) => ({ id, nombre }));
  }, [data, periodId]);

  const totalAsignaturas = useMemo(() => {
    for (const r of data) {
      if (r.total_asignaturas != null) return parseInt(r.total_asignaturas, 10);
    }
    return 0;
  }, [data]);

  const asignaturas = useMemo(() => {
    const m = new Map();
    for (const r of data) {
      const key = r.id_asignatura_grado;
      if (!m.has(key)) {
        m.set(key, {
          id_asignatura_grado: key,
          nombre_asignatura_grado: r.nombre_asignatura_grado ?? key,
          tiene_nota: r.tiene_nota,
          nombre_docente: r.nombre_docente || "-",
          intensidad_horaria: r.intensidad_horaria,
          definitiva: r.definitiva || "-",
          estado_final: r.estado_final || "-",
          periodos: new Map(),
        });
      }
      const asig = m.get(key);
      if (asig.intensidad_horaria == null && r.intensidad_horaria != null) {
        asig.intensidad_horaria = r.intensidad_horaria;
      }
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
      if (!pid) continue;
      if (!asig.periodos.has(pid)) {
        asig.periodos.set(pid, {
          nota: null,
          recuperacion: null,
          escala: null,
          estado: null,
          logros: [],
          notas: [],
          observacion_enfasis: null,
        });
      }
      const per = asig.periodos.get(pid);
      if (r.nota_periodo_porcentual != null) {
        const v = parseFloat(r.nota_periodo_porcentual);
        if (
          !isNaN(v) &&
          (per.nota === null || v > parseFloat(per.nota ?? "0"))
        ) {
          per.nota = r.nota_periodo_porcentual;
        }
      }
      if (r.nota_recuperacion != null && per.recuperacion === null) {
        per.recuperacion = r.nota_recuperacion;
      }
      if (!per.escala && r.escala_nota) per.escala = r.escala_nota;
      if (!per.estado && r.estado_periodo) per.estado = r.estado_periodo;
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
      if (per.observacion_enfasis === null && r.observacion_enfasis != null) {
        per.observacion_enfasis = r.observacion_enfasis;
      }
    }
    const result = Array.from(m.values()).sort((a, b) =>
      a.nombre_asignatura_grado.localeCompare(b.nombre_asignatura_grado, "es", {
        sensitivity: "base",
      }),
    );
    for (const asig of result) {
      for (const [, per] of asig.periodos) {
        per.nota = _computeNotaEfectiva(per.nota, per.recuperacion);
      }
    }
    return result;
  }, [data]);

  const promedioGeneral = useMemo(() => {
    if (!totalAsignaturas) return null;
    const pid = String(periodId);
    let sum = 0;
    for (const asig of asignaturas) {
      if (asig.tiene_nota === "SI") {
        const per = asig.periodos.get(pid);
        const v = parseFloat(per?.nota);
        if (!isNaN(v)) sum += v;
      }
    }
    return (sum / totalAsignaturas).toFixed(2);
  }, [asignaturas, periodId, totalAsignaturas]);

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
function computeBoletinData(data, periodId) {
  const periodoMap = new Map();
  for (const r of data) {
    if (
      r.id_periodo &&
      String(r.id_periodo) === String(periodId) &&
      !periodoMap.has(r.id_periodo)
    ) {
      periodoMap.set(
        r.id_periodo,
        r.nombre_periodo || `Periodo ${r.id_periodo}`,
      );
    }
  }
  const periodos = Array.from(periodoMap.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, nombre]) => ({ id, nombre }));

  let totalAsignaturas = 0;
  for (const r of data) {
    if (r.total_asignaturas != null) {
      totalAsignaturas = parseInt(r.total_asignaturas, 10);
      break;
    }
  }

  const asigMap = new Map();
  for (const r of data) {
    const key = r.id_asignatura_grado;
    if (!asigMap.has(key)) {
      asigMap.set(key, {
        id_asignatura_grado: key,
        nombre_asignatura_grado: r.nombre_asignatura_grado ?? key,
        tiene_nota: r.tiene_nota,
        nombre_docente: r.nombre_docente || "-",
        intensidad_horaria: r.intensidad_horaria,
        definitiva: r.definitiva || "-",
        estado_final: r.estado_final || "-",
        periodos: new Map(),
      });
    }
    const asig = asigMap.get(key);
    if (asig.intensidad_horaria == null && r.intensidad_horaria != null) {
      asig.intensidad_horaria = r.intensidad_horaria;
    }
    if (r.definitiva) {
      const newDef = parseFloat(r.definitiva);
      const curDef = parseFloat(asig.definitiva);
      if (!asig.definitiva || asig.definitiva === "-" || newDef > curDef)
        asig.definitiva = r.definitiva;
    }
    if ((!asig.estado_final || asig.estado_final === "-") && r.estado_final)
      asig.estado_final = r.estado_final;
    const pid = r.id_periodo;
    if (!pid) continue;
    if (!asig.periodos.has(pid)) {
      asig.periodos.set(pid, {
        nota: null,
        recuperacion: null,
        escala: null,
        estado: null,
        logros: [],
        notas: [],
        observacion_enfasis: null,
      });
    }
    const per = asig.periodos.get(pid);
    if (r.nota_periodo_porcentual != null) {
      const v = parseFloat(r.nota_periodo_porcentual);
      if (!isNaN(v) && (per.nota === null || v > parseFloat(per.nota ?? "0"))) {
        per.nota = r.nota_periodo_porcentual;
      }
    }
    if (r.nota_recuperacion != null && per.recuperacion === null) {
      per.recuperacion = r.nota_recuperacion;
    }
    if (!per.escala && r.escala_nota) per.escala = r.escala_nota;
    if (!per.estado && r.estado_periodo) per.estado = r.estado_periodo;
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
    if (per.observacion_enfasis === null && r.observacion_enfasis != null) {
      per.observacion_enfasis = r.observacion_enfasis;
    }
  }
  const asignaturas = Array.from(asigMap.values()).sort((a, b) =>
    a.nombre_asignatura_grado.localeCompare(b.nombre_asignatura_grado, "es", {
      sensitivity: "base",
    }),
  );
  for (const asig of asignaturas) {
    for (const [, per] of asig.periodos) {
      per.nota = _computeNotaEfectiva(per.nota, per.recuperacion);
    }
  }
  const pid = String(periodId);
  let promedioSum = 0;
  for (const asig of asignaturas) {
    if (asig.tiene_nota === "SI") {
      const per = asig.periodos.get(pid);
      const v = parseFloat(per?.nota);
      if (!isNaN(v)) promedioSum += v;
    }
  }
  const promedioGeneral = totalAsignaturas
    ? (promedioSum / totalAsignaturas).toFixed(2)
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
          nombre_asignatura_grado:
            r.nombre_asignatura_grado ?? r.nombre_asignatura ?? "-",
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
          comentario: r.comentario ?? "",
        });
      }
    }
    return Array.from(m.values());
  }, [data]);

  return { asignaturas };
};

/* ── Vista HTML: boletín grado transición ── */
const BoletinTransicionView = ({ boletinData, info }) => {
  const { asignaturas } = useBoletinTransicionProcessed(boletinData ?? []);

  const flatRows = useMemo(() => {
    const rows = [];
    for (const asig of asignaturas) {
      for (const fila of asig.filas) {
        rows.push({
          id_asignatura: asig.id_asignatura,
          nombre_asignatura_grado: asig.nombre_asignatura_grado,
          ...fila,
        });
      }
    }
    return rows;
  }, [asignaturas]);

  const rowSpanMap = useMemo(() => {
    const map = new Map();
    for (const row of flatRows) {
      map.set(row.id_asignatura, (map.get(row.id_asignatura) || 0) + 1);
    }
    return map;
  }, [flatRows]);

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
          position: "relative",
          borderBottom: "2px solid #000000",
          paddingBottom: "12px",
          marginBottom: "12px",
          minHeight: "70px",
        }}
      >
        {info.link_logo && (
          <img
            src={info.link_logo}
            alt="Logo institución"
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 64,
              height: 64,
              objectFit: "contain",
            }}
          />
        )}
        <div
          style={{
            textAlign: "center",
            position: "absolute",
            left: 0,
            right: 0,
            pointerEvents: "none",
          }}
        >
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
          {info.membrete && (
            <p style={{ margin: "2px 0", fontSize: "10px", color: "#374151" }}>
              {info.membrete}
            </p>
          )}
          {info.cod_dane && (
            <p style={{ margin: "2px 0", fontSize: "10px", color: "#374151" }}>
              Cód. DANE: {info.cod_dane}
            </p>
          )}
          {info.alias && (
            <p style={{ margin: "2px 0", fontWeight: "600", fontSize: "11px" }}>
              {info.alias}
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
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            textAlign: "right",
            fontSize: "10px",
            color: "#374151",
          }}
        >
          <p style={{ margin: "2px 0" }}>
            <strong>Fecha:</strong> {formatDate(new Date().toISOString())}
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

      {/* Tabla única agrupada por asignatura */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#ffffff", color: "#000000" }}>
            <th style={{ ...S.th, width: "20%", fontSize: "8px" }}>
              Asignatura
            </th>
            <th style={{ ...S.th, width: "30%", fontSize: "8px" }}>DBA</th>
            <th style={{ ...S.th, width: "25%", fontSize: "8px" }}>
              Propósito
            </th>
            <th style={{ ...S.th, width: "25%", fontSize: "8px" }}>
              Comentario
            </th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const seen = new Set();
            return flatRows.map((row, idx) => {
              const isFirst = !seen.has(row.id_asignatura);
              if (isFirst) seen.add(row.id_asignatura);
              return (
                <tr key={idx} style={{ backgroundColor: "#ffffff" }}>
                  {isFirst ? (
                    <td
                      rowSpan={rowSpanMap.get(row.id_asignatura)}
                      style={{
                        ...S.tdBold,
                        verticalAlign: "middle",
                        fontSize: "10px",
                      }}
                    >
                      {row.nombre_asignatura_grado}
                    </td>
                  ) : null}
                  <td
                    style={{
                      ...S.tdLeft,
                      fontSize: "9px",
                      padding: "6px 10px",
                    }}
                  >
                    {row.nombre_dba}
                  </td>
                  <td
                    style={{
                      ...S.tdLeft,
                      fontSize: "9px",
                      padding: "6px 10px",
                    }}
                  >
                    {row.nombre_proposito}
                  </td>
                  <td style={{ ...S.td, fontSize: "9px", color: "#111827" }}>
                    {row.comentario || "-"}
                  </td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
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

  const textCenter = pageW / 2;

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text((info.nombre_institucion ?? "-").toUpperCase(), textCenter, y + 5, {
    align: "center",
  });
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(`NIT: ${info.nit ?? "-"}`, textCenter, y + 3, { align: "center" });
  y += 5;
  if (info.membrete) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(info.membrete), textCenter, y + 3, { align: "center" });
    y += 5;
  }
  if (info.cod_dane) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Cód. DANE: ${info.cod_dane}`, textCenter, y + 3, {
      align: "center",
    });
    y += 5;
  }
  if (info.alias) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${info.alias} — ${info.sede_tip ?? "-"}`, textCenter, y + 3, {
      align: "center",
    });
    y += 5;
  }
  pdf.setFontSize(9);
  pdf.text(
    `Fecha: ${formatDate(new Date().toISOString())}`,
    pageW - margin,
    y + 3,
    {
      align: "right",
    },
  );
  y += 6;

  /* Datos del estudiante */
  if (!skipStudentData) {
    const _nombreCompleto = [info.nombre_estudiante, info.apellido_estudiante]
      .filter(Boolean)
      .join(" ");
    if (_nombreCompleto) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(_nombreCompleto.toUpperCase(), textCenter, y + 3, {
        align: "center",
      });
      y += 5;
    }
    const _docId = info.numero_identificacion ?? info.identificacion ?? null;
    if (_docId) {
      pdf.setFontSize(9);
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
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(_jornGrupo, textCenter, y + 3, { align: "center" });
      y += 4;
    }
  }

  if (logoData) {
    pdf.addImage(logoData, "JPEG", logoX, margin, logoSize, logoSize);
  }

  /* Título */
  pdf.setFontSize(12);
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
  rankingMap,
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

  /* ── Información del estudiante ── */
  {
    const titleH = 8;
    const rowH = 6;
    const totalH = titleH + rowH * 2;
    addPageIfNeeded(totalH + 2);

    const nombreCompleto =
      [info.nombre_estudiante, info.apellido_estudiante]
        .filter(Boolean)
        .join(" ") || "-";
    const gradoTexto = info.grado ?? "-";
    const periodoNombre = cleanPeriodoLabel(periodos[0]?.nombre);
    const anioTexto = String(meta.year ?? new Date().getFullYear());
    const promTexto = promedioGeneral !== null ? String(promedioGeneral) : "-";
    const rankingEntry = rankingMap?.get(String(meta.periodId)) ?? null;
    const posicionTexto = String(
      rankingEntry?.posicion ?? info.posicion ?? "-",
    );

    const estudianteW = (contentW / 5) * 2;
    const acudienteW = (contentW / 5) * 2;
    const anioW = contentW / 5;
    const colW = contentW / 4;

    // Outer border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.rect(margin, y, contentW, totalH, "D");

    // Row 1: Title
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "INFORME EVALUATIVO",
      margin + contentW / 2,
      y + titleH / 2 + 1.5,
      {
        align: "center",
      },
    );

    const drawFlexRowCell = (label, value, cx, cw, yPos, h) => {
      pdf.setFontSize(8);
      const cy = yPos + h / 2 + 1.5;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const displayLabel = label + " ";
      pdf.text(displayLabel, cx + 2, cy);
      const labelW = pdf.getTextWidth(displayLabel);
      pdf.setFont("helvetica", "normal");
      let val = String(value ?? "-");
      const maxValW = cw - labelW - 4;
      while (pdf.getTextWidth(val) > maxValW && val.length > 1)
        val = val.slice(0, -1);
      pdf.text(val, cx + 2 + labelW, cy);
    };

    // Row 2: Estudiante (2) | Acudiente (2) | Año (1)
    const row2Y = y + titleH;
    drawFlexRowCell(
      "ESTUDIANTE:",
      nombreCompleto,
      margin,
      estudianteW,
      row2Y,
      rowH,
    );
    drawFlexRowCell(
      "ACUDIENTE:",
      info.nombre_acudiente ?? "-",
      margin + estudianteW,
      acudienteW,
      row2Y,
      rowH,
    );
    drawFlexRowCell(
      "AÑO:",
      anioTexto,
      margin + estudianteW + acudienteW,
      anioW,
      row2Y,
      rowH,
    );

    // Row 3: Grado | Periodo | Promedio | Puesto (inline flex-row)
    const row3Y = y + titleH + rowH;
    drawFlexRowCell("GRADO:", gradoTexto, margin, colW, row3Y, rowH);
    drawFlexRowCell(
      "PERIODO:",
      periodoNombre,
      margin + colW,
      colW,
      row3Y,
      rowH,
    );
    drawFlexRowCell(
      "PROMEDIO:",
      promTexto,
      margin + colW * 2,
      colW,
      row3Y,
      rowH,
    );
    drawFlexRowCell(
      "PUESTO:",
      posicionTexto,
      margin + colW * 3,
      colW,
      row3Y,
      rowH,
    );

    y += totalH + 1;
  }

  /* ── Escala Valorativa ── */
  {
    const escalaRowH = 8;
    addPageIfNeeded(escalaRowH * 2 + 2);

    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    const umbralValue = String(
      escalas.find((e) => e.umbral != null)?.umbral ?? "-",
    );
    const levels = escalas.map((e) => ({
      label: String(e.escala ?? ""),
      range: `(${e.desde} - ${e.hasta})`,
    }));

    // Fila 1: título
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.rect(margin, y, contentW, escalaRowH, "D");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "ESCALA VALORATIVA",
      margin + contentW / 2,
      y + escalaRowH / 2 + 1.5,
      { align: "center" },
    );

    y += escalaRowH;

    // Fila 2: columnas horizontales por nivel + columna única Umbral
    const umbralColW = contentW * 0.14;
    const lvlColW = (contentW - umbralColW) / (levels.length || 1);
    pdf.setFontSize(7.5);
    for (let i = 0; i < levels.length; i++) {
      const { label, range } = levels[i];
      const cx = margin + i * lvlColW;
      pdf.rect(cx, y, lvlColW, escalaRowH, "D");
      const textY = y + escalaRowH / 2 + 1.5;
      pdf.setFont("helvetica", "bold");
      const fullText = `${label} = ${range}`;
      const textW = pdf.getTextWidth(fullText);
      const startX = cx + (lvlColW - textW) / 2;
      pdf.text(label, startX, textY);
      const lW = pdf.getTextWidth(label);
      pdf.setFont("helvetica", "normal");
      pdf.text(` = ${range}`, startX + lW, textY);
    }
    // columna Umbral
    const umbralCx = margin + levels.length * lvlColW;
    pdf.rect(umbralCx, y, umbralColW, escalaRowH, "D");
    {
      const textY = y + escalaRowH / 2 + 1.5;
      const centerX = umbralCx + umbralColW / 2;
      pdf.setFont("helvetica", "bold");
      const uLabelW = pdf.getTextWidth("Umbral: ");
      pdf.setFont("helvetica", "normal");
      const uValW = pdf.getTextWidth(umbralValue);
      const totalW = uLabelW + uValW;
      const startX = centerX - totalW / 2;
      pdf.setFont("helvetica", "bold");
      pdf.text("Umbral: ", startX, textY);
      pdf.setFont("helvetica", "normal");
      pdf.text(umbralValue, startX + uLabelW, textY);
    }
    y += escalaRowH;
    y += 3;
  }

  /* ── Tabla de notas ── */
  // Columnas: Asignatura | [por cada periodo: Nota, Recup, Escala, Estado, Logro]
  const periodCols = periodos.length * 5;
  const fixedCols = 2; // Asignatura + IH

  // Anchos proporcionales
  const asigW = contentW * 0.16;
  const ihW = contentW * 0.04;
  const remainW = contentW - asigW - ihW;
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

  const colWidths = [asigW, ihW];
  for (let i = 0; i < periodos.length; i++) {
    colWidths.push(smallSubW, smallSubW, estadoSubW, logroSubW);
  }

  const colX = (colIdx) => {
    let x = margin;
    for (let i = 0; i < colIdx; i++) x += colWidths[i];
    return x;
  };

  const rowH = 7;
  const subHeaderH = 6;

  const drawCell = (text, col, cy, h, opts = {}) => {
    const {
      bold = false,
      fontSize = 7,
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
      fontSize = 6,
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
  drawCell("IH", 1, y, rowH + subHeaderH, {
    bold: true,
    color: headerColor,
    bg: headerBg,
    align: "center",
  });

  /* Sub-cabecera: Nota, Escala, Estado, Logro (sin fila de nombre de periodo) */
  const subBg = [255, 255, 255];
  const subColor = [0, 0, 0];
  for (let pi = 0; pi < periodos.length; pi++) {
    const base = 2 + pi * 4;
    drawCell("Nota", base, y, rowH + subHeaderH, {
      bold: true,
      fontSize: 6,
      color: subColor,
      bg: subBg,
    });
    drawCell("Escala", base + 1, y, rowH + subHeaderH, {
      bold: true,
      fontSize: 6,
      color: subColor,
      bg: subBg,
    });
    drawCell("Estado", base + 2, y, rowH + subHeaderH, {
      bold: true,
      fontSize: 6,
      color: subColor,
      bg: subBg,
    });
    drawCell("Logro", base + 3, y, rowH + subHeaderH, {
      bold: true,
      fontSize: 9,
      color: subColor,
      bg: subBg,
    });
  }
  y += rowH + subHeaderH;

  /* Filas de datos */
  for (let idx = 0; idx < asignaturas.length; idx++) {
    const asig = asignaturas[idx];
    const rowBg = [255, 255, 255];

    // Altura dinámica según longitud del logro
    let computedRowH = rowH;
    for (let pi = 0; pi < periodos.length; pi++) {
      const per = asig.periodos.get(periodos[pi].id);
      {
        const logroColW = colWidths[2 + pi * 4 + 3];
        const lineH = 9 * 0.45;
        const logros = per?.logros ?? [];
        let logroHeight = 2; // padding top
        if (logros.length === 0) {
          logroHeight += lineH;
        } else {
          for (const logro of logros) {
            const sep = logro.indexOf(": ");
            if (sep === -1) {
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "normal");
              logroHeight +=
                pdf.splitTextToSize(logro, logroColW - 1.5).length * lineH;
            } else {
              pdf.setFontSize(9);
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
        // reserva dinámica para "Obs. énfasis:" (título + valor)
        {
          const obsValue = per?.observacion_enfasis ?? null;
          let obsReserve = 8;
          if (obsValue) {
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            const obsLines = pdf.splitTextToSize(obsValue, logroColW - 1.5);
            obsReserve += obsLines.length * lineH;
          }
          logroHeight += obsReserve;
        }
        if (logroHeight > computedRowH) computedRowH = logroHeight;
      }
      const estadoText = per?.estado || "-";
      const estadoColW = colWidths[2 + pi * 4 + 2];
      const estadoLines = pdf.splitTextToSize(estadoText, estadoColW - 1.5);
      const estadoNeeded = estadoLines.length * (6 * 0.45) + 2;
      if (estadoNeeded > computedRowH) computedRowH = estadoNeeded;
    }
    addPageIfNeeded(computedRowH);

    drawCellMultiline(asig.nombre_asignatura_grado, 0, y, computedRowH, {
      bold: true,
      fontSize: 7,
      align: "center",
      bg: rowBg,
    });
    drawCell(asig.intensidad_horaria ?? "-", 1, y, computedRowH, {
      bg: rowBg,
    });

    for (let pi = 0; pi < periodos.length; pi++) {
      const per = asig.periodos.get(periodos[pi].id);
      const base = 2 + pi * 4;
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
        const lineH = 9 * 0.45;
        const obsY = y + computedRowH - 9;
        const logroMaxY = obsY - 1;
        if (logros.length === 0) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
          pdf.text("-", cx + 1, y + 4);
        } else {
          let textY = y + 2;
          outer: for (const logro of logros) {
            const sep = logro.indexOf(": ");
            if (sep === -1) {
              pdf.setFontSize(9);
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
              pdf.setFontSize(9);
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
        // Observaciones de énfasis al fondo de la celda de logro (flex-col)
        {
          const obsValue = per?.observacion_enfasis ?? null;
          const lineH = 9 * 0.45;
          let obsNeeded = 8;
          if (obsValue) {
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            const vLines = pdf.splitTextToSize(obsValue, w - 2);
            obsNeeded += vLines.length * lineH;
          }
          const obsY = y + computedRowH - obsNeeded;
          const obsBottomY = y + computedRowH - 1;
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.15);
          pdf.line(cx + 1, obsY, cx + w - 1, obsY);
          const labelY = obsY + 3.5;
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          const obsLabel = "Obs. énfasis:";
          pdf.text(obsLabel, cx + 1, labelY);
          if (obsValue) {
            pdf.setFont("helvetica", "normal");
            const obsLines = pdf.splitTextToSize(obsValue, w - 2);
            let obsTextY = labelY + lineH + 1;
            for (const ol of obsLines) {
              if (obsTextY > obsBottomY) break;
              pdf.text(ol, cx + 1, obsTextY);
              obsTextY += lineH;
            }
          }
        }
      }
    }

    y += computedRowH;
  }

  /* ── Sección inferior boletín (4 filas) ── */
  y += 2;
  const labelColW = contentW * 0.35;
  const contentColW = contentW - labelColW;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);

  const drawLabelRow = (label, rowH) => {
    addPageIfNeeded(rowH);
    pdf.rect(margin, y, labelColW, rowH, "D");
    pdf.rect(margin + labelColW, y, contentColW, rowH, "D");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(label, margin + 2, y + 5);
    y += rowH;
  };

  // Fila 1: Histórico de periodo — tabla de asignaturas por periodo
  {
    // Todos los periodos disponibles (sin filtrar por selección)
    const todosLosPeriodosIds = Array.from(
      new Set(asignaturas.flatMap((a) => Array.from(a.periodos.keys()))),
    ).sort((a, b) => Number(a) - Number(b));

    // Ranking por periodo
    const rankingMapPDF = rankingMap ?? new Map();

    const hdrH = 6;
    const subHdrH = 6;
    const dataRowH = 6;
    const totalH = hdrH + subHdrH + todosLosPeriodosIds.length * dataRowH;
    addPageIfNeeded(totalH + 2);

    // Anchos: primera col fija, resto dividido entre asignaturas + 2 cols ranking
    const perColW = 8;
    const rankColW = 10;
    const asigCount = asignaturas.length || 1;
    const asigColW = (contentW - perColW - rankColW * 2) / asigCount;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);

    // Fila título
    pdf.rect(margin, y, contentW, hdrH, "D");
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "HISTÓRICO DE PERIODOS — ASIGNATURAS",
      margin + contentW / 2,
      y + hdrH / 2 + 1.5,
      { align: "center" },
    );
    y += hdrH;

    // Fila sub-cabecera: PER. | asig1 | asig2 | ... | Prom. | Puesto
    pdf.rect(margin, y, perColW, subHdrH, "D");
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "bold");
    pdf.text("PER.", margin + perColW / 2, y + subHdrH / 2 + 1.5, {
      align: "center",
    });
    for (let ai = 0; ai < asignaturas.length; ai++) {
      const cx = margin + perColW + ai * asigColW;
      pdf.rect(cx, y, asigColW, subHdrH, "D");
      const abrev = abreviarAsignatura(asignaturas[ai].nombre_asignatura_grado);
      let display = abrev;
      while (pdf.getTextWidth(display) > asigColW - 0.5 && display.length > 1) {
        display = display.slice(0, -1);
      }
      pdf.text(display, cx + asigColW / 2, y + subHdrH / 2 + 1.5, {
        align: "center",
      });
    }
    // cabecera Prom. y Puesto
    const promHdrX = margin + perColW + asignaturas.length * asigColW;
    const puestoHdrX = promHdrX + rankColW;
    pdf.rect(promHdrX, y, rankColW, subHdrH, "D");
    pdf.text("Prom.", promHdrX + rankColW / 2, y + subHdrH / 2 + 1.5, {
      align: "center",
    });
    pdf.rect(puestoHdrX, y, rankColW, subHdrH, "D");
    pdf.text("Puesto", puestoHdrX + rankColW / 2, y + subHdrH / 2 + 1.5, {
      align: "center",
    });
    y += subHdrH;

    // Filas de datos: una por periodo
    for (let pi = 0; pi < todosLosPeriodosIds.length; pi++) {
      const pidStr = String(todosLosPeriodosIds[pi]);
      const rk = rankingMapPDF.get(pidStr);
      pdf.setFont("helvetica", "bold");
      pdf.rect(margin, y, perColW, dataRowH, "D");
      pdf.text(String(pi + 1), margin + perColW / 2, y + dataRowH / 2 + 1.5, {
        align: "center",
      });
      pdf.setFont("helvetica", "normal");
      for (let ai = 0; ai < asignaturas.length; ai++) {
        const cx = margin + perColW + ai * asigColW;
        pdf.rect(cx, y, asigColW, dataRowH, "D");
        const per = asignaturas[ai].periodos.get(todosLosPeriodosIds[pi]);
        const nota = per?.nota ?? "-";
        pdf.text(nota, cx + asigColW / 2, y + dataRowH / 2 + 1.5, {
          align: "center",
        });
      }
      // celdas Prom. y Puesto
      const promCx = margin + perColW + asignaturas.length * asigColW;
      const puestoCx = promCx + rankColW;
      pdf.setFont("helvetica", "bold");
      pdf.rect(promCx, y, rankColW, dataRowH, "D");
      pdf.text(
        String(rk?.promedio ?? "-"),
        promCx + rankColW / 2,
        y + dataRowH / 2 + 1.5,
        { align: "center" },
      );
      pdf.rect(puestoCx, y, rankColW, dataRowH, "D");
      pdf.text(
        String(rk?.posicion ?? "-"),
        puestoCx + rankColW / 2,
        y + dataRowH / 2 + 1.5,
        { align: "center" },
      );
      pdf.setFont("helvetica", "normal");
      y += dataRowH;
    }
  }
  // Fila 2: Convivencia
  {
    const convText = info.convivencia || "";
    const convLabelW = contentW * 0.15;
    const convContentW = contentW - convLabelW;
    const lineH = 4.5;
    const minH = 10;
    const textH = convText
      ? pdf.splitTextToSize(convText, convContentW - 4).length * lineH
      : 0;
    const rowH = Math.max(minH, 5 + textH);
    addPageIfNeeded(rowH);
    pdf.rect(margin, y, convLabelW, rowH, "D");
    pdf.rect(margin + convLabelW, y, convContentW, rowH, "D");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("CONVIVENCIA:", margin + 2, y + 5);
    if (convText) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const lines = pdf.splitTextToSize(convText, convContentW - 4);
      let textY = y + 5;
      for (const line of lines) {
        pdf.text(line, margin + convLabelW + 2, textY);
        textY += lineH;
      }
    }
    y += rowH;
  }
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
  pdf.setFontSize(8);
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
        nombre_asignatura_grado:
          r.nombre_asignatura_grado ?? r.nombre_asignatura ?? "-",
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
        comentario: r.comentario ?? "",
      });
    }
  }
  const asignaturas = Array.from(asigMap.values());

  /* ── Aplanar filas y calcular rowSpan ── */
  const flatRows = [];
  const rowSpanMap = new Map();
  for (const asig of asignaturas) {
    for (const fila of asig.filas) {
      flatRows.push({
        id_asignatura: asig.id_asignatura,
        nombre_asignatura_grado: asig.nombre_asignatura_grado,
        ...fila,
      });
      rowSpanMap.set(
        asig.id_asignatura,
        (rowSpanMap.get(asig.id_asignatura) || 0) + 1,
      );
    }
  }

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
    contentW * 0.2, // Asignatura
    contentW * 0.3, // DBA
    contentW * 0.25, // Propósito
    contentW * 0.25, // Comentario
  ];
  const colX = [margin];
  for (let i = 1; i < 4; i++) colX.push(colX[i - 1] + colW[i - 1]);

  /* ── Cabecera de tabla única ── */
  const headerH = 6;
  const headers = ["Asignatura", "DBA", "Propósito", "Comentario"];
  const headerBg = [255, 255, 255];
  const headerColor = [0, 0, 0];
  addPageIfNeeded(headerH);
  for (let c = 0; c < 4; c++) {
    drawMultiCell(headers[c], colX[c], y, colW[c], headerH, {
      bold: true,
      fontSize: 6,
      align: "center",
      color: headerColor,
      bg: headerBg,
    });
  }
  y += headerH;

  /* ── Filas de datos ── */
  const asigCountMap = new Map();
  for (const asig of asignaturas) {
    asigCountMap.set(asig.id_asignatura, asig.filas.length);
  }

  const seenAsig = new Set();
  for (let idx = 0; idx < flatRows.length; idx++) {
    const row = flatRows[idx];
    const isFirstAsig = !seenAsig.has(row.id_asignatura);
    if (isFirstAsig) seenAsig.add(row.id_asignatura);

    const rowBg = [255, 255, 255];

    /* Calcular alto dinámico de la fila */
    pdf.setFontSize(6);
    const dbaLines = pdf.splitTextToSize(row.nombre_dba, colW[1] - 2);
    const propLines = pdf.splitTextToSize(row.nombre_proposito, colW[2] - 2);
    const comentLines = pdf.splitTextToSize(row.comentario || "-", colW[3] - 2);
    const maxLines = Math.max(
      dbaLines.length,
      propLines.length,
      comentLines.length,
      1,
    );
    const lineH = 6 * 0.45;
    const rowH = Math.max(6, maxLines * lineH + 3);

    addPageIfNeeded(rowH);

    if (isFirstAsig) {
      const span = asigCountMap.get(row.id_asignatura);
      const spanH = (() => {
        let total = 0;
        for (let i = idx; i < idx + span; i++) {
          const r = flatRows[i];
          const dL = pdf.splitTextToSize(r.nombre_dba, colW[1] - 2).length;
          const pL = pdf.splitTextToSize(
            r.nombre_proposito,
            colW[2] - 2,
          ).length;
          const cL = pdf.splitTextToSize(
            r.comentario || "-",
            colW[3] - 2,
          ).length;
          const mL = Math.max(dL, pL, cL, 1);
          total += Math.max(6, mL * lineH + 3);
        }
        return total;
      })();

      drawMultiCell(row.nombre_asignatura_grado, colX[0], y, colW[0], spanH, {
        bold: true,
        fontSize: 7,
        align: "center",
        bg: rowBg,
      });
    }

    drawMultiCell(row.nombre_dba, colX[1], y, colW[1], rowH, { bg: rowBg });
    drawMultiCell(row.nombre_proposito, colX[2], y, colW[2], rowH, {
      bg: rowBg,
    });
    drawMultiCell(row.comentario || "-", colX[3], y, colW[3], rowH, {
      bg: rowBg,
    });

    y += rowH;
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
  const { rol, idPersona, userName, firmaDocente, idDocente, idSede } =
    useAuth();
  const { saveConvivencia, updateConvivencia } = useStudent();
  const isGuardian = rol === 5 || rol === "5";
  const isStudent = rol === 6 || rol === "6";
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => [currentYear, currentYear + 1, currentYear + 2],
    [currentYear],
  );
  const [periodId, setPeriodId] = useState("");
  const [consultado, setConsultado] = useState(false);
  const [year, setYear] = useState(String(currentYear));
  const [boletinData, setBoletinData] = useState(null);
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  // Progreso para modo "all": null = no iniciado, { current, total, errors[] }
  const [progress, setProgress] = useState(null);
  const [isTransicion, setIsTransicion] = useState(false);
  const [editingConvivencia, setEditingConvivencia] = useState(false);
  const [convivenciaText, setConvivenciaText] = useState("");
  const [savingConvivencia, setSavingConvivencia] = useState(false);
  const [convivenciaExists, setConvivenciaExists] = useState(false);

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
    useBoletinProcessed(!isTransicion ? (boletinData ?? []) : [], periodId);

  // Todos los periodos presentes en la respuesta (para tabla histórica)
  const todosPeriodos = useMemo(() => {
    if (!boletinData) return [];
    const m = new Map();
    for (const r of boletinData) {
      if (r.id_periodo && !m.has(r.id_periodo)) {
        m.set(r.id_periodo, r.nombre_periodo || `Periodo ${r.id_periodo}`);
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([id, nombre]) => ({ id, nombre }));
  }, [boletinData]);

  const rawInfo =
    boletinData?.find((r) => r.nombre_institucion != null) ??
    boletinData?.[0] ??
    {};
  const rankingMap = useMemo(() => buildRankingMap(boletinData), [boletinData]);

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
    convivencia: convivenciaText,
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
      setConsultado(true);
      const convRow = rows.find((r) => r.convivencia != null);
      setConvivenciaText(convRow?.convivencia ?? "");
      setConvivenciaExists(convRow?.convivencia != null);
      setEditingConvivencia(false);

      const instRow = rows.find((r) => r.id_institucion != null);
      if (instRow?.id_institucion) {
        try {
          const sc = await getInstitutionScales(instRow.id_institucion);
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
    const tieneNotas = isTransicion
      ? boletinData.some((r) => r.descripcion_nota_elegida)
      : boletinData.some((r) => r.tiene_nota === "SI");
    if (!tieneNotas) {
      setError("No tiene notas asignadas en ningún periodo.");
      return;
    }
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
          rankingMap,
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
          const infoBase =
            rows.find((r) => r.nombre_institucion != null) ?? rows[0];
          const info0 = {
            ...infoBase,
            nombre_estudiante:
              infoBase.nombre_estudiante ??
              student.nombre_estudiante ??
              student.nombre,
            apellido_estudiante:
              infoBase.apellido_estudiante ??
              student.apellido_estudiante ??
              student.apellido,
            numero_identificacion:
              infoBase.numero_identificacion ??
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
            } = computeBoletinData(rows, periodId);
            const rankMap0 = buildRankingMap(rows);
            await generateBoletinPDF(
              info0,
              p,
              a,
              pg,
              re,
              escalas0,
              metaObj,
              rankMap0,
            );
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
          onChange={(e) => {
            setPeriodId(e.target.value);
            setConsultado(false);
          }}
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
      {!loading && boletinData && boletinData.length === 0 && consultado && (
        <p className="text-center text-muted py-6">
          No se encontraron registros para el período y año seleccionados.
        </p>
      )}

      {/* ── Boletín + botón exportar ── */}
      {boletinData && boletinData.length > 0 && consultado && (
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
          {(() => {
            const hasNotas = isTransicion
              ? boletinData.some((r) => r.descripcion_nota_elegida)
              : boletinData.some((r) => r.tiene_nota === "SI");
            if (!hasNotas) {
              return (
                <p className="text-center text-muted py-6">
                  No tiene notas asignadas en ningún periodo.
                </p>
              );
            }
            return (
              <div className="border rounded overflow-hidden shadow-sm">
                {isTransicion ? (
                  <BoletinTransicionView
                    boletinData={boletinData}
                    info={info}
                  />
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
                        position: "relative",
                        borderBottom: "2px solid #000000",
                        paddingBottom: "12px",
                        marginBottom: "10px",
                        textAlign: "center",
                      }}
                    >
                      {info.link_logo && (
                        <img
                          src={info.link_logo}
                          alt="Logo institución"
                          crossOrigin="anonymous"
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: 64,
                            height: 64,
                            objectFit: "contain",
                          }}
                        />
                      )}
                      <div style={{ textAlign: "center" }}>
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
                        {info.membrete && (
                          <p
                            style={{
                              margin: "2px 0",
                              fontSize: "10px",
                              color: "#374151",
                            }}
                          >
                            {info.membrete}
                          </p>
                        )}
                        {info.cod_dane && (
                          <p
                            style={{
                              margin: "2px 0",
                              fontSize: "10px",
                              color: "#374151",
                            }}
                          >
                            Cód. DANE: {info.cod_dane}
                          </p>
                        )}
                        {info.alias && (
                          <p
                            style={{
                              margin: "2px 0",
                              fontWeight: "600",
                              fontSize: "11px",
                            }}
                          >
                            {info.alias}
                            {info.sede_tip ? ` — ${info.sede_tip}` : ""}
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
                    <div
                      style={{
                        border: "1px solid #000000",
                        fontSize: "10px",
                        marginBottom: "0px",
                      }}
                    >
                      {/* Row 1: Title */}
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          padding: "6px",

                          fontSize: "10px",
                        }}
                      >
                        INFORME EVALUATIVO
                      </div>

                      {/* Row 2: Estudiante (2) | Acudiente (2) | Año (1) */}
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div style={{ flex: 2, padding: "2px 8px" }}>
                          <strong>ESTUDIANTE:</strong>{" "}
                          {[info.nombre_estudiante, info.apellido_estudiante]
                            .filter(Boolean)
                            .join(" ") || "-"}
                        </div>
                        <div style={{ flex: 2, padding: "2px 8px" }}>
                          <strong>ACUDIENTE:</strong>{" "}
                          {info.nombre_acudiente ?? "-"}
                        </div>
                        <div style={{ flex: 1, padding: "2px 8px" }}>
                          <strong>AÑO:</strong> {year}
                        </div>
                      </div>

                      {/* Row 3: Grado | Periodo | Promedio | Puesto (flex-row) */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          borderTop: "1px solid #000000",
                        }}
                      >
                        <div style={{ flex: 1, padding: "2px 8px" }}>
                          <strong>GRADO:</strong> {info.grado ?? "-"}
                        </div>
                        <div style={{ flex: 1, padding: "2px 8px" }}>
                          <strong>PERIODO:</strong>{" "}
                          {cleanPeriodoLabel(periodos[0]?.nombre)}
                        </div>
                        <div style={{ flex: 1, padding: "2px 8px" }}>
                          <strong>PROMEDIO:</strong> {promedioGeneral ?? "-"}
                        </div>
                        <div style={{ flex: 1, padding: "2px 8px" }}>
                          <strong>PUESTO:</strong>{" "}
                          {rankingMap.get(String(periodId))?.posicion ??
                            info.posicion ??
                            "-"}
                        </div>
                      </div>
                    </div>

                    {/* ── Escala Valorativa ── */}
                    {escalas.length > 0 &&
                      (() => {
                        const umbralValue = String(
                          escalas.find((e) => e.umbral != null)?.umbral ?? "-",
                        );
                        const levels = escalas.map((e) => ({
                          label: String(e.escala ?? ""),
                          range: `(${e.desde} - ${e.hasta})`,
                        }));
                        return (
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              border: "1px solid #000000",
                              fontSize: "9px",
                              marginBottom: "8px",
                            }}
                          >
                            <tbody>
                              <tr>
                                <td
                                  colSpan={levels.length + 1}
                                  style={{
                                    border: "1px solid #000000",
                                    padding: "3px 6px",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    fontSize: "10px",
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
                                      border: "1px solid #000000",
                                      padding: "3px 6px",
                                      width: `${86 / levels.length}%`,
                                      textAlign: "center",
                                    }}
                                  >
                                    <strong>{lvl.label}</strong> = {lvl.range}
                                  </td>
                                ))}
                                <td
                                  style={{
                                    border: "1px solid #000000",
                                    padding: "3px 6px",
                                    width: "14%",
                                    textAlign: "center",
                                  }}
                                >
                                  <strong>Umbral:</strong> {umbralValue}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        );
                      })()}

                    {/* ── Tabla de asignaturas (encabezado único) ── */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                      }}
                    >
                      <colgroup>
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "4%" }} />
                        <col style={{ width: "7%" }} />
                        <col style={{ width: "7%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "50%" }} />
                      </colgroup>
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#000000",
                          }}
                        >
                          <th style={{ ...S.thLeft, verticalAlign: "middle" }}>
                            Asignatura
                          </th>
                          <th style={{ ...S.th, fontSize: "8px" }}>IH</th>
                          <th
                            style={{ ...S.th, fontSize: "8px" }}
                            title="Nota final periodo"
                          >
                            Nota
                          </th>
                          <th style={{ ...S.th, fontSize: "8px" }}>Escala</th>
                          <th style={{ ...S.th, fontSize: "8px" }}>Estado</th>
                          <th style={{ ...S.th, fontSize: "8px" }}>Logro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asignaturas.map((asig) => (
                          <tr
                            key={asig.id_asignatura_grado}
                            style={{ backgroundColor: "#ffffff" }}
                          >
                            <td style={{ ...S.tdBold, textAlign: "center" }}>
                              {asig.nombre_asignatura_grado}
                            </td>
                            <td style={S.td}>
                              {asig.intensidad_horaria ?? "-"}
                            </td>
                            {periodos.map((p) => {
                              const per = asig.periodos.get(p.id);
                              return (
                                <React.Fragment key={p.id}>
                                  <td
                                    style={{
                                      ...S.td,
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
                                      Obs. énfasis:
                                      {per?.observacion_enfasis ? (
                                        <span
                                          style={{
                                            fontWeight: "normal",
                                            marginLeft: "4px",
                                          }}
                                        >
                                          {per.observacion_enfasis}
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ── Sección inferior boletín ── */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "16px",
                        border: "1px solid #000000",
                        fontSize: "11px",
                      }}
                    >
                      <tbody>
                        {/* Fila 1: Histórico de periodo */}
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              border: "1px solid #000000",
                              padding: "0px",
                              verticalAlign: "top",
                            }}
                          >
                            {/* Tabla histórico de asignaturas por periodo */}
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "8px",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    colSpan={asignaturas.length + 3}
                                    style={{
                                      border: "1px solid #000000",
                                      padding: "3px 6px",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      fontSize: "9px",
                                      backgroundColor: "#ffffff",
                                    }}
                                  >
                                    HISTÓRICO DE PERIODOS — ASIGNATURAS
                                  </th>
                                </tr>
                                <tr>
                                  <th
                                    style={{
                                      border: "1px solid #000000",
                                      padding: "3px 4px",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      backgroundColor: "#ffffff",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    PER.
                                  </th>
                                  {asignaturas.map((asig) => (
                                    <th
                                      key={asig.id_asignatura_grado}
                                      title={asig.nombre_asignatura_grado}
                                      style={{
                                        border: "1px solid #000000",
                                        padding: "3px 2px",
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        backgroundColor: "#ffffff",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {abreviarAsignatura(
                                        asig.nombre_asignatura_grado,
                                      )}
                                    </th>
                                  ))}
                                  <th
                                    style={{
                                      border: "1px solid #000000",
                                      padding: "3px 2px",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      backgroundColor: "#ffffff",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Prom.
                                  </th>
                                  <th
                                    style={{
                                      border: "1px solid #000000",
                                      padding: "3px 2px",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      backgroundColor: "#ffffff",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Puesto
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {todosPeriodos.map((p, pIdx) => {
                                  const rk = rankingMap.get(String(p.id));
                                  return (
                                    <tr key={p.id}>
                                      <td
                                        style={{
                                          border: "1px solid #000000",
                                          padding: "2px 4px",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {pIdx + 1}
                                      </td>
                                      {asignaturas.map((asig) => {
                                        const per = asig.periodos.get(p.id);
                                        return (
                                          <td
                                            key={asig.id_asignatura_grado}
                                            style={{
                                              border: "1px solid #000000",
                                              padding: "2px 2px",
                                              textAlign: "center",
                                            }}
                                          >
                                            {per?.nota ?? "-"}
                                          </td>
                                        );
                                      })}
                                      <td
                                        style={{
                                          border: "1px solid #000000",
                                          padding: "2px 2px",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {rk?.promedio ?? "-"}
                                      </td>
                                      <td
                                        style={{
                                          border: "1px solid #000000",
                                          padding: "2px 2px",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {rk?.posicion ?? "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        {/* Fila 2: Convivencia */}
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              border: "1px solid #000000",
                              padding: "6px 8px",
                              minHeight: "50px",
                              verticalAlign: "top",
                            }}
                          >
                            <div className=" grid grid-cols-10">
                              <strong className="col-span-9">
                                CONVIVENCIA:
                              </strong>
                              {idDocente && !editingConvivencia && (
                                <SimpleButton
                                  type="button"
                                  msj="Editar"
                                  icon="Edit"
                                  bg="bg-primary"
                                  text="text-surface"
                                  noRounded={false}
                                  onClick={() => {
                                    if (convivenciaText.trim()) {
                                      setConvivenciaExists(true);
                                    }
                                    setEditingConvivencia(true);
                                  }}
                                />
                              )}
                            </div>
                            {editingConvivencia ? (
                              <div style={{ marginTop: "6px" }}>
                                <textarea
                                  value={convivenciaText}
                                  onChange={(e) =>
                                    setConvivenciaText(e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    minHeight: "80px",
                                    padding: "6px",
                                    fontSize: "11px",
                                    border: "1px solid #9ca3af",
                                    borderRadius: "4px",
                                    fontFamily: "Arial, sans-serif",
                                    resize: "vertical",
                                  }}
                                />
                                <div
                                  style={{
                                    marginTop: "6px",
                                    display: "flex",
                                    gap: "8px",
                                  }}
                                >
                                  <SimpleButton
                                    type="button"
                                    msj="Guardar"
                                    icon="Save"
                                    bg="bg-primary"
                                    text="text-surface"
                                    noRounded={false}
                                    disabled={savingConvivencia}
                                    onClick={async () => {
                                      const effStudentId = isGuardian
                                        ? selectedGuardianStudentId
                                        : studentId;
                                      if (!effStudentId) return;
                                      setSavingConvivencia(true);
                                      try {
                                        const payload = {
                                          fk_estudiante: Number(effStudentId),
                                          fk_docente: Number(idDocente),
                                          descripcion: convivenciaText,
                                          fk_periodo: Number(periodId),
                                          fk_sede: Number(idSede),
                                        };
                                        if (convivenciaExists) {
                                          await updateConvivencia(payload);
                                        } else {
                                          await saveConvivencia(payload);
                                        }
                                        setEditingConvivencia(false);
                                      } catch (err) {
                                        console.error(
                                          "Error guardando convivencia:",
                                          err,
                                        );
                                      } finally {
                                        setSavingConvivencia(false);
                                      }
                                    }}
                                  />
                                  <SimpleButton
                                    type="button"
                                    msj="Cancelar"
                                    icon="X"
                                    bg="bg-red-500"
                                    text="text-surface"
                                    noRounded={false}
                                    onClick={() => setEditingConvivencia(false)}
                                  />
                                </div>
                              </div>
                            ) : (
                              <p
                                style={{
                                  margin: "6px 0 0",
                                  fontSize: "11px",
                                  whiteSpace: "pre-wrap",
                                  color: "#111827",
                                }}
                              >
                                {convivenciaText || "Sin observaciones."}
                              </p>
                            )}
                          </td>
                        </tr>
                        {/* Fila 4: Firma del director de grupo */}
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              border: "1px solid #000000",
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
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "10px",
                                  }}
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
            );
          })()}
        </>
      )}
    </div>
  );
};

export default BoletinSelector;
