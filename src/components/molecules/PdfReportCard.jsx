import { jsPDF } from "jspdf";
import logo from "../../assets/2399.webp";

/**
 * Función auxiliar para redimensionar y comprimir imágenes.
 * Mantiene el mismo enfoque que `PdfAudit.jsx` para mejorar rendimiento.
 */
const compressImage = (src, quality = 0.7, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", quality),
        width,
        height,
      });
    };
    img.onerror = (err) => reject(err);
  });
};

const safeCompressImage = async (src, quality, maxWidth) => {
  try {
    if (!src) return null;
    return await compressImage(src, quality, maxWidth);
  } catch {
    return null;
  }
};

const formatIsoDateToEs = (isoDate) => {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const buildStudentFullName = (student) => {
  const parts = [
    student?.first_name,
    student?.second_name,
    student?.first_lastname,
    student?.second_lastname,
  ]
    .map((p) => (p || "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const calculateFinalGrade = (records = []) => {
  let sum = 0;
  let weights = 0;
  for (const r of records) {
    const grade = toNumberOrNull(r?.grade);
    const w = toNumberOrNull(r?.porcentual);
    if (grade === null || w === null) continue;
    sum += grade * (w / 100);
    weights += w;
  }
  if (weights <= 0) return null;
  return Number(sum.toFixed(2));
};

const computeFinalFromPeriods = (periodGrades) => {
  if (!periodGrades) return null;
  const values = [
    periodGrades?.p1,
    periodGrades?.p2,
    periodGrades?.p3,
    periodGrades?.p4,
  ]
    .map(toNumberOrNull)
    .filter((v) => v !== null);
  if (!values.length) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Number(avg.toFixed(2));
};

const getValoracion = (finalGrade) => {
  const n = toNumberOrNull(finalGrade);
  if (n === null) return "-";
  if (n >= 4.7 && n <= 5.0) return "DS";
  if (n >= 4.0 && n <= 4.6) return "DA";
  if (n >= 3.5 && n <= 3.9) return "DB";
  if (n >= 1.0 && n <= 3.4) return "DBJ";
  return "-";
};

const exportPDF = async (reportCard) => {
  const pdf = new jsPDF("p", "mm", "a4");

  const logoCompressed = await safeCompressImage(logo, 0.75, 300);

  // Layout base de página
  const HEADER_X = 10;
  const HEADER_Y = 10;
  const HEADER_W = 191;
  const HEADER_H = 30;
  const STUDENT_LINE_1_Y = 46;
  const STUDENT_LINE_2_Y = 52;
  const PAGE_BODY_START_Y = STUDENT_LINE_2_Y + 10;

  // ================== DATOS (para reutilizar en cada página) ==================
  const student = reportCard?.student;
  const studentName = buildStudentFullName(student);
  const year = reportCard?.report?.year ?? "-";
  const period = reportCard?.report?.period ?? "-";
  const group = reportCard?.report?.group;
  const gradeScholar = group?.grade_scholar ?? "-";
  const groupGrade = group?.group_grade ?? "";

  const pickFirstNonEmpty = (...values) => {
    for (const v of values) {
      if (v === null || v === undefined) continue;
      const s = String(v).trim();
      if (s) return s;
    }
    return "-";
  };

  const truncateToWidth = (text, maxWidth) => {
    const value = text === null || text === undefined ? "-" : String(text);
    if (pdf.getTextWidth(value) <= maxWidth) return value;
    const ellipsis = "...";
    let base = value;
    while (base.length > 0 && pdf.getTextWidth(base + ellipsis) > maxWidth) {
      base = base.slice(0, -1);
    }
    return base.length ? base + ellipsis : ellipsis;
  };

  const matricula = pickFirstNonEmpty(
    student?.matricula,
    student?.enrollmentNumber,
    reportCard?.report?.matricula,
    reportCard?.matricula
  );

  const directorGrupo = pickFirstNonEmpty(
    reportCard?.report?.group?.directorGroup,
    reportCard?.report?.group?.director_group,
    reportCard?.report?.group?.directorName,
    reportCard?.directorGroup,
    reportCard?.directorGrupo
  );

  const headerAvg = toNumberOrNull(reportCard?.summary?.finalAverage);
  const headerAvgText = headerAvg === null ? "-" : headerAvg.toFixed(2);
  const puesto = pickFirstNonEmpty(
    reportCard?.summary?.rank,
    reportCard?.summary?.puesto,
    reportCard?.summary?.position,
    reportCard?.puesto
  );

  const studentText = `Estudiante: ${studentName}`;
  const matriculaText = `No Matricula: ${matricula}`;
  const gradeText = `Grado:${String(gradeScholar)}${String(groupGrade)}`;
  const directorText = `Director de Grupo: ${directorGrupo}`;
  const periodoText = `Periodo ${period} - ${year}`;
  const promText = `Prom: ${headerAvgText}`;
  const puestoText = `Puesto: ${puesto}`;

  const drawHeader = (pdfInstance) => {
    // Altura un poco mayor para permitir líneas extra del colegio
    pdfInstance.rect(HEADER_X, HEADER_Y, HEADER_W, HEADER_H, "D");

    // Distribución 1/3 (logo) : 2/3 (texto)
    const logoColW = HEADER_W / 3;
    const textColW = HEADER_W - logoColW;
    const logoColX = HEADER_X;
    const textColX = HEADER_X + logoColW;
    const pad = 3;

    if (
      logoCompressed?.dataUrl &&
      logoCompressed?.width &&
      logoCompressed?.height
    ) {
      const maxW = logoColW - pad * 2;
      const maxH = HEADER_H - pad * 2;
      const scale = Math.min(
        maxW / logoCompressed.width,
        maxH / logoCompressed.height
      );
      const drawW = logoCompressed.width * scale;
      const drawH = logoCompressed.height * scale;
      const x = logoColX + (logoColW - drawW) / 2;
      const y = HEADER_Y + (HEADER_H - drawH) / 2;
      pdfInstance.addImage(logoCompressed.dataUrl, "JPEG", x, y, drawW, drawH);
    }

    const textX = textColX + pad;
    const textMaxW = textColW - pad * 2;
    const textCenterX = textColX + textColW / 2;

    pdfInstance.setFont("helvetica", "bold");
    pdfInstance.setFontSize(10);
    pdfInstance.text("BOLETÍN DE NOTAS", textCenterX, HEADER_Y + 7, {
      align: "center",
      maxWidth: textMaxW,
    });

    const schoolName = reportCard?.report?.school?.name || "-";
    pdfInstance.setFont("helvetica", "normal");
    pdfInstance.setFontSize(8);
    pdfInstance.text(String(schoolName), textCenterX, HEADER_Y + 12, {
      align: "center",
      maxWidth: textMaxW,
    });

    const extraLines = Array.isArray(reportCard?.report?.school?.headerLines)
      ? reportCard.report.school.headerLines
      : [];
    if (extraLines.length) {
      pdfInstance.setFontSize(6);
      let yy = HEADER_Y + 16;
      const maxY = HEADER_Y + HEADER_H - 2;
      for (const line of extraLines) {
        if (!line) continue;
        const parts = pdfInstance.splitTextToSize(String(line), textMaxW);
        for (const p of parts) {
          if (yy > maxY) break;
          pdfInstance.text(String(p), textCenterX, yy, {
            align: "center",
            maxWidth: textMaxW,
          });
          yy += 3;
        }
        if (yy > maxY) break;
      }
    }
  };

  const drawStudentInfo = (pdfInstance) => {
    pdfInstance.setFont("helvetica", "normal");
    pdfInstance.setFontSize(10);

    const infoTableX = 10;
    const infoTableW = 191;

    // Fila 1: 3 columnas (Estudiante / Matrícula / Grado)
    const row1Col1W = 115;
    const row1Col2W = 45;
    const row1Col3W = infoTableW - row1Col1W - row1Col2W;
    const row1Col1X = infoTableX;
    const row1Col2X = row1Col1X + row1Col1W;
    const row1Col3X = row1Col2X + row1Col2W;
    const row1Col3RightX = row1Col3X + row1Col3W;

    pdfInstance.text(
      truncateToWidth(studentText, row1Col1W),
      row1Col1X,
      STUDENT_LINE_1_Y
    );
    pdfInstance.text(
      truncateToWidth(matriculaText, row1Col2W),
      row1Col2X,
      STUDENT_LINE_1_Y
    );
    pdfInstance.text(
      truncateToWidth(gradeText, row1Col3W),
      row1Col3RightX,
      STUDENT_LINE_1_Y,
      { align: "right" }
    );

    // Fila 2: 4 columnas (Director / Periodo / Promedio / Puesto)
    const row2Col1W = 90;
    const row2Col2W = 35;
    const row2Col3W = 33;
    const row2Col4W = infoTableW - row2Col1W - row2Col2W - row2Col3W;
    const row2Col1X = infoTableX;
    const row2Col2X = row2Col1X + row2Col1W;
    const row2Col3X = row2Col2X + row2Col2W;
    const row2Col4X = row2Col3X + row2Col3W;

    pdfInstance.text(
      truncateToWidth(directorText, row2Col1W),
      row2Col1X,
      STUDENT_LINE_2_Y
    );
    pdfInstance.text(
      truncateToWidth(periodoText, row2Col2W),
      row2Col2X + row2Col2W / 2,
      STUDENT_LINE_2_Y,
      { align: "center" }
    );
    pdfInstance.text(
      truncateToWidth(promText, row2Col3W),
      row2Col3X + row2Col3W / 2,
      STUDENT_LINE_2_Y,
      { align: "center" }
    );
    pdfInstance.text(
      truncateToWidth(puestoText, row2Col4W),
      row2Col4X + row2Col4W,
      STUDENT_LINE_2_Y,
      { align: "right" }
    );
  };

  const checkPageBreak = (pdfInstance, y, space = 20) => {
    if (y + space > 275) {
      pdfInstance.addPage();
      drawHeader(pdfInstance);
      drawStudentInfo(pdfInstance);
      pdfInstance.setFont("helvetica", "normal");
      pdfInstance.setFontSize(10);
      return PAGE_BODY_START_Y;
    }
    return y;
  };

  // Primera página
  drawHeader(pdf);
  drawStudentInfo(pdf);
  let y = PAGE_BODY_START_Y;
  y = checkPageBreak(pdf, y, 30);

  // ================== TABLA: NOTAS POR ASIGNATURA ==================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("RESULTADO POR ASIGNATURA", 10, y);
  y += 6;

  const tableX = 10;
  const tableW = 191;
  // Debe sumar exactamente tableW (191) para evitar descuadre.
  // 60 + (8*10) + 14 + 8 + 9 + 20 = 191
  const colSubjectW = 60;
  const colP1W = 10;
  const colN1W = 10;
  const colP2W = 10;
  const colN2W = 10;
  const colP3W = 10;
  const colN3W = 10;
  const colP4W = 10;
  const colN4W = 10;
  const colDefW = 14;
  const colIhsW = 8;
  const colInasW = 9;
  const colValW = 20;
  const headerH = 8;

  const drawCentered = (text, x, w, yText) => {
    const value = text === null || text === undefined ? "-" : String(text);
    pdf.text(value, x + w / 2, yText, { align: "center" });
  };

  const drawTableHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    let x = tableX;
    pdf.rect(x, y, colSubjectW, headerH);
    pdf.text("ASIGNATURA", x + 2, y + 5.5);
    x += colSubjectW;

    // IHS / INAS / VAL después de ASIGNATURA
    pdf.rect(x, y, colIhsW, headerH);
    drawCentered("IHS", x, colIhsW, y + 5.5);
    x += colIhsW;

    pdf.rect(x, y, colInasW, headerH);
    drawCentered("INAS", x, colInasW, y + 5.5);
    x += colInasW;

    pdf.rect(x, y, colValW, headerH);
    drawCentered("VALORACIÓN", x, colValW, y + 5.5);
    x += colValW;

    pdf.rect(x, y, colP1W, headerH);
    drawCentered("P1", x, colP1W, y + 5.5);
    x += colP1W;

    pdf.rect(x, y, colN1W, headerH);
    drawCentered("N1", x, colN1W, y + 5.5);
    x += colN1W;

    pdf.rect(x, y, colP2W, headerH);
    drawCentered("P2", x, colP2W, y + 5.5);
    x += colP2W;

    pdf.rect(x, y, colN2W, headerH);
    drawCentered("N2", x, colN2W, y + 5.5);
    x += colN2W;

    pdf.rect(x, y, colP3W, headerH);
    drawCentered("P3", x, colP3W, y + 5.5);
    x += colP3W;

    pdf.rect(x, y, colN3W, headerH);
    drawCentered("N3", x, colN3W, y + 5.5);
    x += colN3W;

    pdf.rect(x, y, colP4W, headerH);
    drawCentered("P4", x, colP4W, y + 5.5);
    x += colP4W;

    pdf.rect(x, y, colN4W, headerH);
    drawCentered("N4", x, colN4W, y + 5.5);
    x += colN4W;

    pdf.rect(x, y, colDefW, headerH);
    drawCentered("DEF", x, colDefW, y + 5.5);
    x += colDefW;
    y += headerH;
  };

  const getPeriodLevelings = (subject) => {
    const candidates = [
      subject?.periodLevelings,
      subject?.levelings,
      subject?.nivelaciones,
    ];
    for (const c of candidates) {
      if (c && typeof c === "object") return c;
    }
    return null;
  };

  const drawObservationRow = (obsText) => {
    const padding = 2;
    const text = obsText || "-";

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const lines = pdf.splitTextToSize(text, tableW - padding * 2);
    const textLineH = 4.2;
    const topOffset = 5;
    const rowH = Math.max(headerH, topOffset + (lines.length - 1) * textLineH);

    y = checkPageBreak(pdf, y, rowH + 10);
    if (y === PAGE_BODY_START_Y) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("RESULTADO POR ASIGNATURA", 10, y);
      y += 6;
      drawTableHeader();
    }

    pdf.rect(tableX, y, tableW, rowH);
    pdf.text(lines, tableX + padding, y + 5);
    y += rowH;
  };

  const drawTableRow = (subject) => {
    const padding = 2;
    const subjectText = String(subject?.nombre || "-").toUpperCase();

    const p1 = toNumberOrNull(subject?.periodGrades?.p1);
    const p2 = toNumberOrNull(subject?.periodGrades?.p2);
    const p3 = toNumberOrNull(subject?.periodGrades?.p3);
    const p4 = toNumberOrNull(subject?.periodGrades?.p4);

    const periodLevelings = getPeriodLevelings(subject);
    const n1 = toNumberOrNull(periodLevelings?.p1);
    const n2 = toNumberOrNull(periodLevelings?.p2);
    const n3 = toNumberOrNull(periodLevelings?.p3);
    const n4 = toNumberOrNull(periodLevelings?.p4);

    const computedFinalFromPeriods = computeFinalFromPeriods(
      subject?.periodGrades
    );
    const computedFinalFromRecords = calculateFinalGrade(subject?.records);
    const finalGrade =
      toNumberOrNull(subject?.finalGrade) ??
      computedFinalFromPeriods ??
      computedFinalFromRecords;

    const fmt = (n) => (n === null ? "-" : n.toFixed(1));
    const defText = finalGrade === null ? "-" : finalGrade.toFixed(2);
    const valText = getValoracion(finalGrade);
    const ihsText =
      toNumberOrNull(subject?.ihs) ?? toNumberOrNull(subject?.IHS) ?? null;
    const inasText =
      toNumberOrNull(subject?.inas) ?? toNumberOrNull(subject?.INAS) ?? null;
    const obsText = subject?.teacherComment || "-";

    const subjectLines = pdf.splitTextToSize(
      subjectText,
      colSubjectW - padding * 2
    );
    const textLineH = 4.5;
    const textTopOffset = 5;

    const calcCellHeight = (lineCount, paddingBottom = 0) => {
      const safeCount = Math.max(0, Number(lineCount) || 0);
      if (safeCount <= 0) return headerH;
      const h = textTopOffset + (safeCount - 1) * textLineH + paddingBottom;
      return Math.max(headerH, h);
    };

    const rowH = calcCellHeight(subjectLines.length, 0);

    // Reserva espacio para fila de observación para evitar cortes raros
    const obsPreviewLines = pdf.splitTextToSize(
      obsText || "-",
      tableW - padding * 2
    );
    const obsRowH = Math.max(
      headerH,
      textTopOffset + (Math.max(1, obsPreviewLines.length) - 1) * 4.2
    );

    y = checkPageBreak(pdf, y, rowH + obsRowH + 12);
    if (y === PAGE_BODY_START_Y) {
      // Página nueva: reimprimir título y header de tabla
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("RESULTADO POR ASIGNATURA", 10, y);
      y += 6;
      drawTableHeader();
    }

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    let x = tableX;
    pdf.rect(x, y, colSubjectW, rowH);
    pdf.text(subjectLines, x + padding, y + 5);
    x += colSubjectW;

    // IHS / INAS / VAL después de ASIGNATURA
    pdf.rect(x, y, colIhsW, rowH);
    drawCentered(ihsText === null ? "-" : ihsText, x, colIhsW, y + 5);
    x += colIhsW;

    pdf.rect(x, y, colInasW, rowH);
    drawCentered(inasText === null ? "-" : inasText, x, colInasW, y + 5);
    x += colInasW;

    pdf.rect(x, y, colValW, rowH);
    drawCentered(valText, x, colValW, y + 5);
    x += colValW;

    pdf.rect(x, y, colP1W, rowH);
    drawCentered(fmt(p1), x, colP1W, y + 5);
    x += colP1W;

    pdf.rect(x, y, colN1W, rowH);
    drawCentered(fmt(n1), x, colN1W, y + 5);
    x += colN1W;

    pdf.rect(x, y, colP2W, rowH);
    drawCentered(fmt(p2), x, colP2W, y + 5);
    x += colP2W;

    pdf.rect(x, y, colN2W, rowH);
    drawCentered(fmt(n2), x, colN2W, y + 5);
    x += colN2W;

    pdf.rect(x, y, colP3W, rowH);
    drawCentered(fmt(p3), x, colP3W, y + 5);
    x += colP3W;

    pdf.rect(x, y, colN3W, rowH);
    drawCentered(fmt(n3), x, colN3W, y + 5);
    x += colN3W;

    pdf.rect(x, y, colP4W, rowH);
    drawCentered(fmt(p4), x, colP4W, y + 5);
    x += colP4W;

    pdf.rect(x, y, colN4W, rowH);
    drawCentered(fmt(n4), x, colN4W, y + 5);
    x += colN4W;

    pdf.rect(x, y, colDefW, rowH);
    drawCentered(defText, x, colDefW, y + 5);
    x += colDefW;

    y += rowH;

    drawObservationRow(obsText);
  };

  drawTableHeader();
  const subjects = Array.isArray(reportCard?.subjects)
    ? reportCard.subjects
    : [];
  for (const s of subjects) drawTableRow(s);

  // Espaciado mínimo antes de convenciones
  y += 4;

  // ================== CONVENCIONES ==================
  y = checkPageBreak(pdf, y, 55);
  // Padding top para que no quede pegado a la tabla
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("CONVENCIONES", 10, y);
  y += 6;

  const countDbj = subjects.reduce((acc, s) => {
    const computedFinalFromPeriods = computeFinalFromPeriods(s?.periodGrades);
    const computedFinalFromRecords = calculateFinalGrade(s?.records);
    const finalGrade =
      toNumberOrNull(s?.finalGrade) ??
      computedFinalFromPeriods ??
      computedFinalFromRecords;
    return getValoracion(finalGrade) === "DBJ" ? acc + 1 : acc;
  }, 0);

  // Tabla de convenciones (sigla + descripción)
  const legendX = 10;
  const legendW = 191;
  const codeW = 26;
  const descW = legendW - codeW;
  const cellPadX = 2;
  const baseLineH = 4.2;
  const minRowH = 10;

  const drawLegendHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.rect(legendX, y, codeW, 8);
    pdf.rect(legendX + codeW, y, descW, 8);
    pdf.text("SIGLA", legendX + codeW / 2, y + 5.5, { align: "center" });
    pdf.text("DESCRIPCIÓN", legendX + codeW + cellPadX, y + 5.5);
    y += 8;
  };

  const drawLegendRow = (code, description) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const wrapped = pdf.splitTextToSize(description, descW - cellPadX * 2);
    const rowH = Math.max(minRowH, 5 + (wrapped.length - 1) * baseLineH + 3);

    y = checkPageBreak(pdf, y, rowH + 12);
    if (y === PAGE_BODY_START_Y) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("CONVENCIONES", 10, y);
      y += 6;
      drawLegendHeader();
    }

    pdf.rect(legendX, y, codeW, rowH);
    pdf.rect(legendX + codeW, y, descW, rowH);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(String(code), legendX + codeW / 2, y + 6, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    // Texto justificado dentro de la celda
    pdf.text(String(description), legendX + codeW + cellPadX, y + 6, {
      align: "justify",
      maxWidth: descW - cellPadX * 2,
    });

    y += rowH;
  };

  const drawLegendSingleCellRow = (text) => {
    const rowH = 8;
    y = checkPageBreak(pdf, y, rowH + 12);
    if (y === PAGE_BODY_START_Y) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("CONVENCIONES", 10, y);
      y += 6;
    }

    pdf.rect(legendX, y, legendW, rowH);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(String(text), legendX + cellPadX, y + 5.5);
    y += rowH + 2;
  };

  // Fila/celda propia con el conteo
  drawLegendSingleCellRow(`Áreas con desempeño BAJO: ${countDbj}`);

  drawLegendHeader();
  drawLegendRow("VN", "Valoración Nacional");
  drawLegendRow(
    "DS",
    "Desempeño Superior: De 4.7 a 5.0 (Alcanza los desempeños esperados en el tiempo planeado y de manera independiente)"
  );
  drawLegendRow(
    "DA",
    "Desempeño Alto: De 4.0 a 4.6 (Alcanza la mayoría de los desempeños esperados y algunas veces requiere de apoyo pedagógico. Casi siempre en el tiempo planeado)"
  );
  drawLegendRow(
    "DB",
    "Desempeño Básico: De 3.5 a 3.9 (Alcanza desempeños básicos, casi siempre requiere de apoyo y lo aprovecha. Con frecuencia entrega productos por fuera del tiempo planeado y algunos están incompletos)"
  );
  drawLegendRow(
    "DBJ",
    "Desempeño Bajo: De 1.0 a 3.4 (No alcanza desempeños esperados, aunque cuente con los apoyos)"
  );

  // ================== FIRMAS ==================
  y = checkPageBreak(pdf, y, 40);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("______________________________", 20, y + 15);
  pdf.text("Director(a) de Grupo", 20, y + 20);

  pdf.text("______________________________", 120, y + 15);
  pdf.text("Rector(a)", 120, y + 20);

  const safeStudentId = student?.id_student ?? "";
  const fileName = `Boletin_${safeStudentId}_${year}_P${period}.pdf`;
  pdf.save(fileName);
};

const PdfReportCard = async (data) => {
  await exportPDF(data);
};

export default PdfReportCard;
