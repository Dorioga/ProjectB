import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getCurrentTheme } from "./themeManager";

/**
 * Espera a que las webfonts se carguen (si el navegador lo soporta).
 */
async function waitForFonts() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      // pequeña pausa para evitar layout shift.
      await new Promise((r) => setTimeout(r, 50));
    }
  } catch {}
}

/**
 * Resuelve colores modernos (oklch, lab, etc.) a rgb usando el Canvas 2D,
 * que sí soporta todos los espacios de color CSS Level 4.
 * html2canvas sólo entiende rgb/rgba/#hex, por eso es necesario este paso.
 */
function buildOnClone() {
  const colorProps = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "caretColor",
  ];
  // Canvas 2D normaliza cualquier formato CSS de color a #rrggbb / rgba(...)
  const offscreen = document.createElement("canvas");
  offscreen.width = 1;
  offscreen.height = 1;
  const ctx2d = offscreen.getContext("2d");
  const resolveColor = (raw) => {
    if (!raw || raw === "transparent" || raw === "initial" || raw === "inherit")
      return raw;
    try {
      ctx2d.clearRect(0, 0, 1, 1);
      ctx2d.fillStyle = raw;
      const normalized = ctx2d.fillStyle;
      // Chrome moderno acepta oklch/lab/etc. en Canvas pero NO los normaliza
      // al leer fillStyle — hay que dibujar un píxel y leer los datos RGBA.
      if (/oklch|oklab|lab\(|lch\(|color\(/i.test(normalized)) {
        ctx2d.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
        return a < 255
          ? `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`
          : `rgb(${r},${g},${b})`;
      }
      return normalized; // ya es #rrggbb o rgba(...)
    } catch {
      return raw;
    }
  };
  return (clonedDoc, clonedElement) => {
    const win = clonedDoc.defaultView ?? window;
    const els = [clonedElement, ...clonedElement.querySelectorAll("*")];
    els.forEach((el) => {
      const computed = win.getComputedStyle(el);
      colorProps.forEach((prop) => {
        const val = computed[prop];
        if (val) el.style[prop] = resolveColor(val);
      });
    });
  };
}

export async function exportElementToPNG(
  element,
  filename = "export.png",
  options = {},
) {
  if (!element) throw new Error("Elemento inválido para exportar a PNG.");
  const {
    scale = 2,
    backgroundColor = undefined,
    useCORS = true,
    logging = false,
  } = options;

  await waitForFonts();
  const bg = backgroundColor ?? getCurrentTheme()["color-surface"] ?? "#ffffff";

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: bg,
    useCORS,
    logging,
    onclone: buildOnClone(),
  });
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

/**
 * Exporta frente y reverso del carné a un solo PDF.
 * twoPages=true → 2 páginas (cada cara en su página).
 * twoPages=false → 1 página con ambas caras lado a lado.
 */
export async function exportCardToPDF(frontEl, backEl, opts = {}) {
  if (!frontEl || !backEl)
    throw new Error(
      "Faltan los elementos frontal y/o reverso para exportar a PDF.",
    );

  const {
    twoPages = true,
    mmWidth = 88, // ancho típico de tarjeta (mm)
    mmHeight = 54, // alto típico de tarjeta (mm)
    scale = 2,
    backgroundColor = undefined,
    useCORS = true,
    fileName = "Carné.pdf",
    logging = false,
  } = opts;

  await waitForFonts();
  const bg = backgroundColor ?? getCurrentTheme()["color-surface"] ?? "#ffffff";

  const onclone = buildOnClone();
  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(frontEl, {
      scale,
      backgroundColor: bg,
      useCORS,
      logging,
      onclone,
    }),
    html2canvas(backEl, {
      scale,
      backgroundColor: bg,
      useCORS,
      logging,
      onclone,
    }),
  ]);

  const frontImg = frontCanvas.toDataURL("image/png");
  const backImg = backCanvas.toDataURL("image/png");

  if (twoPages) {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [mmWidth, mmHeight],
    });
    pdf.addImage(frontImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.addPage();
    pdf.addImage(backImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.save(fileName);
  } else {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [mmWidth * 2, mmHeight],
    });
    pdf.addImage(frontImg, "PNG", 0, 0, mmWidth, mmHeight);
    pdf.addImage(backImg, "PNG", mmWidth, 0, mmWidth, mmHeight);
    pdf.save(fileName);
  }
}

/**
 * Genera un PDF de asistencias portrait A4 con matriz Estudiante × Fecha,
 * segmentado por asignatura. Patrón de encabezado basado en PdfObservador.jsx.
 *
 * @param {Array}  rows  - Registros [{ nombre_estudiante, nombre_asignatura,
 *                          fecha_assistance, presente, nombre_grado, grupo,
 *                          nombre_jornada, nombre_sede }]
 * @param {Object} opts  - { nameSchool, nameSede, gradeLabel, journeyLabel,
 *                          startDate, endDate, fileName }
 */
export async function exportAttendancePDF(rows = [], opts = {}) {
  if (!rows.length) return;

  const {
    nameSchool = "Institución",
    nameSede = "",
    gradeLabel = "",
    journeyLabel = "",
    startDate = "",
    endDate = "",
    fileName = "Asistencias.pdf",
  } = opts;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmtShort = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    } catch {
      return iso;
    }
  };

  const fmtLong = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
    } catch {
      return iso;
    }
  };

  const checkPresent = (val) =>
    String(val).toLowerCase() === "si" ||
    String(val).toLowerCase() === "sí" ||
    val === true ||
    val === 1;

  // ── Agrupar por asignatura ────────────────────────────────────────────────
  const asigMap = new Map();
  for (const row of rows) {
    const asig = row.nombre_asignatura || "Sin asignatura";
    if (!asigMap.has(asig)) asigMap.set(asig, []);
    asigMap.get(asig).push(row);
  }

  // ── Dimensiones A4 portrait ───────────────────────────────────────────────
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 10;
  const CONTENT_W = PAGE_W - MARGIN * 2; // 190 mm

  // Columnas de tabla
  const STUDENT_COL_W = 50;
  const DATE_AREA_W = CONTENT_W - STUDENT_COL_W; // 140 mm
  const MIN_DATE_W = 6;
  const MAX_DATE_W = 12;

  // Alturas
  const ROW_H = 7; // fila de estudiante
  const DATE_HDR_H = 16; // cabecera de fechas (texto rotado)
  const SUBJ_HDR_H = 8; // cabecera de asignatura

  // Zona del encabezado — altura fija de 42 mm (patrón PdfObservador)
  const HDR_H = 42;
  const CONTENT_TOP = MARGIN + HDR_H; // 52 mm desde arriba
  const CONTENT_BOT = PAGE_H - MARGIN; // 287 mm

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Encabezado de página (altura fija HDR_H) ──────────────────────────────
  // Reproduce el estilo de drawDocumentHeader de PdfObservador.jsx:
  //   nombre institución + título + línea + bloque info + línea de cierre
  const drawPageHeader = () => {
    const y0 = MARGIN; // 10 mm
    const cx = PAGE_W / 2;

    // Nombre institución (azul oscuro, bold)
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 128);
    pdf.text(nameSchool.toUpperCase(), cx, y0 + 7, { align: "center" });

    // Título del documento
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("REGISTRO DE ASISTENCIA", cx, y0 + 14, { align: "center" });

    // Línea separadora superior
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(MARGIN, y0 + 17, PAGE_W - MARGIN, y0 + 17);

    // Bloque de información en 2 columnas (misma convención que PdfObservador)
    const infoY = y0 + 22;
    const col1X = MARGIN;
    const col2X = PAGE_W / 2 + 4;

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);

    const drawInfoPair = (label, value, x, y) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, x, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(value, x + pdf.getTextWidth(`${label}:`) + 2, y);
    };

    if (nameSede) drawInfoPair("Sede", nameSede, col1X, infoY);
    if (gradeLabel) drawInfoPair("Grado", gradeLabel, col2X, infoY);

    const row2Y = infoY + 5;
    if (journeyLabel) drawInfoPair("Jornada", journeyLabel, col1X, row2Y);
    if (startDate || endDate) {
      drawInfoPair(
        "Período",
        `${fmtLong(startDate)} — ${fmtLong(endDate)}`,
        col2X,
        row2Y,
      );
    }

    // Fecha de generación (alineada a la derecha, itálica, gris)
    const fechaGen = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Generado: ${fechaGen}`, PAGE_W - MARGIN, row2Y, {
      align: "right",
    });

    // Línea de cierre del encabezado (más gruesa)
    pdf.setDrawColor(19, 26, 39);
    pdf.setLineWidth(0.6);
    pdf.line(MARGIN, y0 + HDR_H - 1, PAGE_W - MARGIN, y0 + HDR_H - 1);

    // Retorna la Y exacta donde empieza el contenido
    return CONTENT_TOP;
  };

  // ── Cabecera de columnas de fechas ────────────────────────────────────────
  const drawColHeaders = (chunk, tableW, y) => {
    const dW = chunk.length > 0 ? (tableW - STUDENT_COL_W) / chunk.length : 0;

    // Celda "Estudiante"
    pdf.setFillColor(19, 26, 39);
    pdf.rect(MARGIN, y, STUDENT_COL_W, DATE_HDR_H, "F");
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(229, 231, 235);
    pdf.text(
      "ESTUDIANTE",
      MARGIN + STUDENT_COL_W / 2,
      y + DATE_HDR_H / 2 + 1.5,
      {
        align: "center",
      },
    );

    // Celdas de fechas
    for (let di = 0; di < chunk.length; di++) {
      const cx = MARGIN + STUDENT_COL_W + di * dW;
      pdf.setFillColor(
        di % 2 === 0 ? 30 : 22,
        di % 2 === 0 ? 45 : 35,
        di % 2 === 0 ? 66 : 52,
      );
      pdf.rect(cx, y, dW, DATE_HDR_H, "F");

      pdf.setDrawColor(50, 70, 100);
      pdf.setLineWidth(0.15);
      pdf.line(cx + dW, y, cx + dW, y + DATE_HDR_H);

      // Fecha rotada 90° centrada en la celda
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(229, 231, 235);
      pdf.text(fmtShort(chunk[di]), cx + dW / 2, y + DATE_HDR_H - 1.5, {
        angle: 90,
        align: "center",
      });
    }

    // Borde externo del bloque de cabecera
    pdf.setDrawColor(19, 26, 39);
    pdf.setLineWidth(0.3);
    pdf.rect(MARGIN, y, tableW, DATE_HDR_H, "S");

    return y + DATE_HDR_H;
  };

  // ── Tabla de una asignatura ───────────────────────────────────────────────
  const drawAsignaturaTable = (asigName, asigRows, startY) => {
    const dates = Array.from(
      new Set(asigRows.map((r) => r.fecha_assistance).filter(Boolean)),
    ).sort((a, b) => new Date(a) - new Date(b));

    const students = Array.from(
      new Set(asigRows.map((r) => r.nombre_estudiante).filter(Boolean)),
    ).sort();

    const presMap = new Map();
    for (const row of asigRows) {
      if (!row.fecha_assistance || !row.nombre_estudiante) continue;
      presMap.set(
        `${row.nombre_estudiante}|${row.fecha_assistance}`,
        checkPresent(row.presente),
      );
    }

    // Ancho de columnas y chunks
    const maxFit = Math.floor(DATE_AREA_W / MIN_DATE_W);
    const dateW = Math.min(
      MAX_DATE_W,
      Math.max(MIN_DATE_W, DATE_AREA_W / Math.min(dates.length || 1, maxFit)),
    );
    const datesPerChunk = Math.floor(DATE_AREA_W / dateW);
    const chunks = [];
    for (let i = 0; i < Math.max(dates.length, 1); i += datesPerChunk) {
      chunks.push(dates.slice(i, i + datesPerChunk));
    }

    let y = startY;

    for (const chunk of chunks) {
      const tableW = STUDENT_COL_W + chunk.length * dateW;
      const chunkRange =
        chunks.length > 1 && chunk.length > 0
          ? ` (${fmtShort(chunk[0])} — ${fmtShort(chunk[chunk.length - 1])})`
          : "";

      // Nueva página si no hay espacio mínimo
      if (y + SUBJ_HDR_H + DATE_HDR_H + ROW_H * 2 > CONTENT_BOT) {
        pdf.addPage();
        y = drawPageHeader();
      }

      // Cabecera de asignatura
      pdf.setFillColor(19, 26, 39);
      pdf.rect(MARGIN, y, tableW, SUBJ_HDR_H, "F");
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${asigName}${chunkRange}`, MARGIN + 3, y + SUBJ_HDR_H - 2);
      y += SUBJ_HDR_H;

      // Cabecera de columnas (fechas)
      y = drawColHeaders(chunk, tableW, y);

      // Filas de estudiantes
      for (let si = 0; si < students.length; si++) {
        if (y + ROW_H > CONTENT_BOT) {
          pdf.addPage();
          y = drawPageHeader();
          // Redibujar cabeceras en continuación
          pdf.setFillColor(19, 26, 39);
          pdf.rect(MARGIN, y, tableW, SUBJ_HDR_H, "F");
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(
            `${asigName}${chunkRange} (cont.)`,
            MARGIN + 3,
            y + SUBJ_HDR_H - 2,
          );
          y += SUBJ_HDR_H;
          y = drawColHeaders(chunk, tableW, y);
        }

        // Fondo alternado
        pdf.setFillColor(...(si % 2 === 0 ? [248, 249, 250] : [255, 255, 255]));
        pdf.rect(MARGIN, y, tableW, ROW_H, "F");

        // Nombre del estudiante
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(20, 20, 20);
        const nameLine =
          pdf.splitTextToSize(students[si], STUDENT_COL_W - 4)[0] || "";
        pdf.text(nameLine, MARGIN + 2, y + ROW_H - 2);

        // Celdas de asistencia
        const dW =
          chunk.length > 0 ? (tableW - STUDENT_COL_W) / chunk.length : 0;
        for (let di = 0; di < chunk.length; di++) {
          const cx = MARGIN + STUDENT_COL_W + di * dW;
          const key = `${students[si]}|${chunk[di]}`;
          if (presMap.has(key)) {
            pdf.setFillColor(
              ...(presMap.get(key) ? [209, 250, 229] : [254, 226, 226]),
            );
            pdf.rect(cx + 0.5, y + 0.5, dW - 1, ROW_H - 1, "F");
          }
          pdf.setDrawColor(210, 215, 220);
          pdf.setLineWidth(0.1);
          pdf.line(cx + dW, y, cx + dW, y + ROW_H);
        }

        // Bordes de fila
        pdf.setDrawColor(200, 205, 210);
        pdf.setLineWidth(0.15);
        pdf.line(MARGIN, y, MARGIN, y + ROW_H);
        pdf.line(MARGIN + STUDENT_COL_W, y, MARGIN + STUDENT_COL_W, y + ROW_H);
        pdf.line(MARGIN, y + ROW_H, MARGIN + tableW, y + ROW_H);

        y += ROW_H;
      }

      // Línea de cierre de la tabla
      pdf.setDrawColor(19, 26, 39);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN, y, MARGIN + tableW, y);

      y += 8;
    }

    return y;
  };

  // ── Renderizar ────────────────────────────────────────────────────────────
  let y = drawPageHeader();
  let first = true;

  for (const [asigName, asigRows] of asigMap) {
    if (!first) {
      if (y + SUBJ_HDR_H + DATE_HDR_H + ROW_H * 3 > CONTENT_BOT) {
        pdf.addPage();
        y = drawPageHeader();
      } else {
        y += 5;
      }
    }
    y = drawAsignaturaTable(asigName, asigRows, y);
    first = false;
  }

  pdf.save(fileName);
}
