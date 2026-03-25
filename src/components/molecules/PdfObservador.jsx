import { jsPDF } from "jspdf";

/**
 * Genera y descarga el PDF del Observador del Estudiante.
 * @param {Object} params
 * @param {Object} params.student  - Datos del estudiante (campos del mock/API)
 * @param {Array}  params.entries  - Array de observaciones [{ fecha, observacion, docente, estudiante, acudiente }]
 * @param {string} params.nameSchool - Nombre de la institución
 * @param {string} [params.year]    - Año lectivo (default: año actual)
 * @param {string} [params.logoSrc] - Data-URL o ruta del logo de la institución
 */
const PdfObservador = async ({
  student = {},
  entries = [],
  nameSchool = "Institución Educativa",
  year,
  logoSrc = null,
}) => {
  console.log("Generando PDF con datos:", {
    student,
    entries,
    nameSchool,
    year,
  });
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210;
  const marginX = 10;
  const contentW = pageW - marginX * 2; // 190 mm
  const yearLabel = year || new Date().getFullYear();

  // ── Helpers ──────────────────────────────────────────────────────────────
  const compressLogo = (src) =>
    new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new Image();
      // No establecer crossOrigin para evitar el bloqueo CORS.
      // Si el canvas queda tainted, toDataURL lanzará SecurityError y se captura abajo.
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 300;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        // Fill white background so transparent logos don't render as black.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.75), w, h });
        } catch {
          // Canvas tainted por origen cruzado: continuar sin logo
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
    });

  const buildFullName = (s) =>
    [s?.first_name, s?.second_name, s?.first_lastname, s?.second_lastname]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ") || "-";

  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Texto multilínea con límite de ancho
  const splitText = (text, maxWidth, fontSize, font = "normal") => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", font);
    return pdf.splitTextToSize(String(text || ""), maxWidth);
  };

  // Mide la altura real de un bloque de texto (líneas × lineHeight)
  const textBlockHeight = (lines, lineHeight) => lines.length * lineHeight;

  // ── Comprimir logo ────────────────────────────────────────────────────────
  const logoData = await compressLogo(logoSrc);

  // ── Funciones de layout ───────────────────────────────────────────────────
  const HEADER_H = 28; // altura del bloque de encabezado superior

  const drawDocumentHeader = () => {
    // Borde externo del encabezado
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.4);

    // Logo a la izquierda
    if (logoData) {
      const logoH = 18;
      const logoW = (logoData.w / logoData.h) * logoH;
      pdf.addImage(logoData.dataUrl, "JPEG", marginX, 10, logoW, logoH);
    } else {
      // Recuadro placeholder
      pdf.rect(marginX, 10, 20, 18, "S");
    }

    // Nombre de la institución centrado
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 128);
    pdf.text(String(nameSchool).toUpperCase(), pageW / 2, 16, {
      align: "center",
    });

    // Título del documento
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.text(`OBSERVADOR DEL ESTUDIANTE ${yearLabel}`, pageW / 2, 24, {
      align: "center",
    });
  };

  // ── Tabla de datos del estudiante ─────────────────────────────────────────
  const STUDENT_TABLE_TOP = 35;

  const drawStudentInfo = () => {
    const t = STUDENT_TABLE_TOP;
    const cellH = 7;
    const tableX = marginX;
    const tableW = contentW;

    // Encabezados fila 1: ID | APELLIDOS Y NOMBRES | GRADO | JORNADA
    const col1W = 30;
    const col2W = tableW - col1W - 22 - 24; // nombres
    const col3W = 22;
    const col4W = 24;

    let x = tableX;
    let y = t;

    // Fila cabecera 1
    const drawCell = (label, cx, cy, cw, ch, bold = true, align = "left") => {
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.3);
      pdf.rect(cx, cy, cw, ch, "S");
      pdf.setFontSize(7);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setTextColor(0);
      const padX = align === "right" ? cx + cw - 1 : cx + 1;
      pdf.text(String(label ?? ""), padX, cy + ch - 1.5, { align });
    };

    const drawValueCell = (value, cx, cy, cw, ch) =>
      drawCell(value, cx, cy, cw, ch, false);

    // ── Fila 1: etiquetas ──
    drawCell("IDENTIFICACIÓN", x, y, col1W, cellH);
    drawCell("APELLIDOS Y NOMBRES", x + col1W, y, col2W, cellH);
    drawCell("GRADO", x + col1W + col2W, y, col3W, cellH);
    drawCell("JORNADA", x + col1W + col2W + col3W, y, col4W, cellH);

    // ── Fila 1: valores ──
    y += cellH;
    drawValueCell(student?.identification || "", x, y, col1W, cellH);
    drawValueCell(buildFullName(student), x + col1W, y, col2W, cellH);
    drawValueCell(
      `${student?.grade_scholar ?? ""} ${student?.group_grade ?? ""}`.trim(),
      x + col1W + col2W,
      y,
      col3W,
      cellH,
    );
    drawValueCell(
      student?.journey || "",
      x + col1W + col2W + col3W,
      y,
      col4W,
      cellH,
    );

    // ── Fila 2: fecha y lugar de nacimiento ──
    y += cellH;
    const fnbLabelW = 50;
    drawCell("FECHA Y LUGAR DE NACIMIENTO", x, y, fnbLabelW, cellH);
    drawValueCell(
      fmtDate(student?.birthday),
      x + fnbLabelW,
      y,
      tableW - fnbLabelW,
      cellH,
    );

    // ── Fila 3: dirección ──
    y += cellH;
    const dirLabelW = 45;
    drawCell("DIRECCIÓN:", x, y, dirLabelW, cellH);
    drawValueCell(
      student?.direccion || "",
      x + dirLabelW,
      y,
      tableW - dirLabelW,
      cellH,
    );

    // ── Fila 4: acudiente + identificación acudiente ──
    y += cellH;
    const halfW = tableW / 2;
    drawCell("ACUDIENTE:", x, y, halfW * 0.4, cellH, true, "right");
    drawValueCell(
      student?.nombre_acudiente || "",
      x + halfW * 0.4,
      y,
      halfW - halfW * 0.4,
      cellH,
    );
    drawCell(
      "IDENTIFICACIÓN:",
      x + halfW,
      y,
      halfW * 0.4,
      cellH,
      true,
      "right",
    );
    drawValueCell(
      student?.numero_identificacion_acudiente || "",
      x + halfW + halfW * 0.4,
      y,
      halfW - halfW * 0.4,
      cellH,
    );

    // ── Fila 5: ocupación + teléfono ──
    y += cellH;
    drawCell("OCUPACIÓN:", x, y, halfW * 0.4, cellH, true, "right");
    drawValueCell("", x + halfW * 0.4, y, halfW - halfW * 0.4, cellH);
    drawCell("TELEFONO:", x + halfW, y, halfW * 0.4, cellH, true, "right");
    drawValueCell(
      student?.telefono_acudiente || "",
      x + halfW + halfW * 0.4,
      y,
      halfW - halfW * 0.4,
      cellH,
    );

    return y + cellH; // y al final de la tabla del estudiante
  };

  // ── Tabla de observaciones ────────────────────────────────────────────────
  // Cada entrada puede tener firma de DOCENTE / ESTUDIANTE / ACUDIENTE,
  // lo que agrega filas extras debajo de la observación principal.

  const OBS_COL_DATE_W = 38; // columna FECHA
  const OBS_COL_OBS_W = contentW - OBS_COL_DATE_W; // columna OBSERVACIONES
  const LINE_H = 5; // interlineado para texto
  const MIN_OBS_H = 14; // altura mínima de la celda de observación
  const SIGNATURE_H = 5; // altura de cada fila de firma

  const drawObsTableHeader = (startY) => {
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.rect(marginX, startY, OBS_COL_DATE_W, 8, "S");
    pdf.rect(marginX + OBS_COL_DATE_W, startY, OBS_COL_OBS_W, 8, "S");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0);
    pdf.text("FECHA", marginX + OBS_COL_DATE_W / 2, startY + 5.5, {
      align: "center",
    });
    pdf.text(
      "OBSERVACIONES",
      marginX + OBS_COL_DATE_W + OBS_COL_OBS_W / 2,
      startY + 5.5,
      { align: "center" },
    );
    return startY + 8;
  };

  // Retorna la altura total necesaria para una entrada
  const calcEntryHeight = (entry) => {
    const lines = splitText(entry.observacion || "", OBS_COL_OBS_W - 3, 8);
    const obsH = Math.max(MIN_OBS_H, textBlockHeight(lines, LINE_H) + 4);
    const hasSigs =
      entry.docente != null ||
      entry.estudiante != null ||
      entry.acudiente != null;
    const sigH = hasSigs ? SIGNATURE_H * 3 : 0;
    return obsH + sigH;
  };

  const drawEntry = (entry, startY) => {
    console.log("Dibujando entrada:", entry);
    const lines = splitText(entry.observacion || "", OBS_COL_OBS_W - 3, 8);
    const obsH = Math.max(MIN_OBS_H, textBlockHeight(lines, LINE_H) + 4);
    const hasSigs =
      entry.docente != null ||
      entry.estudiante != null ||
      entry.acudiente != null;
    const sigH = hasSigs ? SIGNATURE_H * 3 : 0;
    const totalH = obsH + sigH;

    // Celdas
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.rect(marginX, startY, OBS_COL_DATE_W, totalH, "S");
    pdf.rect(marginX + OBS_COL_DATE_W, startY, OBS_COL_OBS_W, obsH, "S");

    // Fecha
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0);
    pdf.text(
      fmtDate(entry.fecha),
      marginX + OBS_COL_DATE_W / 2,
      startY + obsH / 2 + 1,
      { align: "center" },
    );

    // Texto observación
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(lines, marginX + OBS_COL_DATE_W + 2, startY + LINE_H);

    // Filas de firma (si existen)
    if (hasSigs) {
      const sigY = startY + obsH;
      const sigLabels = ["DOCENTE:", "ESTUDIANTE:", "ACUDIENTE:"];
      const sigValues = [
        entry.docente ?? "",
        entry.estudiante ?? "",
        entry.acudiente ?? "",
      ];
      sigLabels.forEach((lbl, i) => {
        const fy = sigY + i * SIGNATURE_H;
        pdf.rect(marginX + OBS_COL_DATE_W, fy, OBS_COL_OBS_W, SIGNATURE_H, "S");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(lbl, marginX + OBS_COL_DATE_W + 2, fy + SIGNATURE_H - 1.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          String(sigValues[i] ?? ""),
          marginX + OBS_COL_DATE_W + 28,
          fy + SIGNATURE_H - 1.5,
        );
      });
    }

    return startY + totalH;
  };

  // ── Pie de página ─────────────────────────────────────────────────────────
  const drawFooter = (pageNum, totalPages) => {
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100);
    pdf.text(`Página ${pageNum} de ${totalPages}`, pageW / 2, 290, {
      align: "center",
    });
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  drawDocumentHeader();
  const afterStudentInfo = drawStudentInfo();

  // Espacio entre tabla de estudiante y tabla de observaciones
  let y = afterStudentInfo + 6;

  // Necesitamos pre-calcular cuántas páginas habrá para el footer
  // Lo hacemos en una primera pasada rápida
  const PAGE_BOTTOM = 280;

  // Pre-calcular alturas y páginas (para el total de páginas en footer)
  let simY = y;
  let pages = 1;
  let needsHeader = false;

  // Header de tabla en primera página
  simY += 8; // header de tabla
  for (const entry of entries) {
    const h = calcEntryHeight(entry);
    if (simY + h > PAGE_BOTTOM) {
      pages++;
      simY = 20 + 8; // margen nuevo + header de tabla
    }
    simY += h;
  }
  const totalPages = pages;

  // Segunda pasada: renderizado real
  let currentPage = 1;
  y = drawObsTableHeader(y);

  for (const entry of entries) {
    const h = calcEntryHeight(entry);
    if (y + h > PAGE_BOTTOM) {
      drawFooter(currentPage, totalPages);
      pdf.addPage();
      currentPage++;
      drawDocumentHeader();
      y = STUDENT_TABLE_TOP - 3;
      y = drawObsTableHeader(y);
    }
    y = drawEntry(entry, y);
  }

  // Si no hay entradas, dibujar filas vacías
  if (entries.length === 0) {
    // 6 filas vacías de muestra
    for (let i = 0; i < 6; i++) {
      if (y + MIN_OBS_H > PAGE_BOTTOM) {
        drawFooter(currentPage, totalPages);
        pdf.addPage();
        currentPage++;
        drawDocumentHeader();
        y = STUDENT_TABLE_TOP - 3;
        y = drawObsTableHeader(y);
      }
      const emptyEntry = {
        fecha: "",
        observacion: "",
        docente: i % 3 === 2 ? "" : null,
        estudiante: i % 3 === 2 ? "" : null,
        acudiente: i % 3 === 2 ? "" : null,
      };
      y = drawEntry(emptyEntry, y);
    }
  }

  drawFooter(currentPage, totalPages);

  pdf.save(
    `observador_${student?.identification || "estudiante"}_${yearLabel}.pdf`,
  );
};

export default PdfObservador;
