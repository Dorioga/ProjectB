import React, { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import useStudent from "../../lib/hooks/useStudent";
import useAuth from "../../lib/hooks/useAuth";
import Loader from "../../components/atoms/Loader";

/**
 * Genera y descarga un PDF con el reporte de notas del estudiante.
 */
async function generateNotesPDF(grouped, studentName, nameSchool) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210;
  const marginX = 14;
  const contentW = pageW - marginX * 2;

  // ── Encabezado ──
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageW, 22, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text(nameSchool || "Institución Educativa", pageW / 2, 10, {
    align: "center",
  });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Reporte de Notas del Estudiante", pageW / 2, 17, {
    align: "center",
  });

  // ── Nombre del estudiante ──
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Estudiante: ${studentName || "—"}`, marginX, 30);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(`Fecha de generación: ${today}`, pageW - marginX, 30, {
    align: "right",
  });

  pdf.setDrawColor(200, 200, 200);
  pdf.line(marginX, 33, pageW - marginX, 33);

  let y = 38;
  const checkPage = (needed) => {
    if (y + needed > 280) {
      pdf.addPage();
      y = 15;
    }
  };

  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    const na = parseInt(a.replace(/\D/g, "") || "0", 10);
    const nb = parseInt(b.replace(/\D/g, "") || "0", 10);
    return na - nb;
  });
  for (const [periodo, asignaturas] of sortedEntries) {
    // Título de periodo
    checkPage(12);
    pdf.setFillColor(230, 240, 255);
    pdf.rect(marginX, y, contentW, 8, "F");
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 82, 150);
    pdf.text(periodo, marginX + 2, y + 5.5);
    y += 10;

    for (const [asignatura, info] of Object.entries(asignaturas)) {
      checkPage(30);

      // Encabezado de asignatura
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(40, 40, 40);
      pdf.text(asignatura, marginX, y + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Docente: ${info.docente}`, marginX, y + 9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(41, 128, 185);
      pdf.roundedRect(pageW - marginX - 38, y, 38, 7, 2, 2, "F");
      pdf.setFontSize(8);
      pdf.text(
        `Nota periodo: ${info.nota_periodo}`,
        pageW - marginX - 36,
        y + 4.8,
      );
      y += 13;

      // Logro
      if (info.logro_estudiante) {
        checkPage(8);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(80, 80, 80);
        const logroLines = pdf.splitTextToSize(
          `Logro: ${info.logro_estudiante}`,
          contentW,
        );
        pdf.text(logroLines, marginX, y + 4);
        y += logroLines.length * 4.5 + 2;
      }

      // Cabecera de tabla
      checkPage(8);
      const cols = [
        { label: "Nota", x: marginX, w: contentW * 0.3 },
        { label: "Porcentaje", x: marginX + contentW * 0.3, w: contentW * 0.2 },
        { label: "Valor", x: marginX + contentW * 0.5, w: contentW * 0.18 },
        { label: "Logro", x: marginX + contentW * 0.68, w: contentW * 0.32 },
      ];
      pdf.setFillColor(70, 70, 70);
      pdf.rect(marginX, y, contentW, 6, "F");
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      cols.forEach((col) => pdf.text(col.label, col.x + 1, y + 4.2));
      y += 6;

      // Filas de notas
      info.items.forEach((item, idx) => {
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        const logroCell = pdf.splitTextToSize(item.logro || "—", cols[3].w - 2);
        const lineH = 4.5;
        const rowH = Math.max(5.5, logroCell.length * lineH + 2);
        checkPage(rowH);
        const bg = idx % 2 === 0 ? [248, 248, 248] : [255, 255, 255];
        pdf.setFillColor(...bg);
        pdf.rect(marginX, y, contentW, rowH, "F");
        const valor = parseFloat(item.valor_nota);
        const valColor = valor >= 3 ? [22, 128, 50] : [185, 28, 28];
        const rowData = [
          { text: item.nombre_nota || "—", col: cols[0] },
          { text: `${item.porcentaje ?? "—"}%`, col: cols[1] },
        ];
        pdf.setTextColor(40, 40, 40);
        rowData.forEach(({ text, col }) =>
          pdf.text(String(text), col.x + 1, y + 4),
        );
        pdf.setTextColor(...valColor);
        pdf.text(String(item.valor_nota ?? "—"), cols[2].x + 1, y + 4);
        pdf.setTextColor(80, 80, 80);
        pdf.text(logroCell, cols[3].x + 1, y + 4, {
          lineHeightFactor: lineH / 3.5,
        });
        y += rowH;
      });

      y += 4; // espacio entre asignaturas
    }

    y += 4; // espacio entre periodos
  }

  // Pie de página en cada página
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(160, 160, 160);
    pdf.text(`Página ${i} de ${totalPages}`, pageW / 2, 292, {
      align: "center",
    });
  }

  pdf.save(
    `reporte_notas_${(studentName || "estudiante").replace(/\s+/g, "_")}.pdf`,
  );
}

const StudentNotes = () => {
  const { getStudentNotesById } = useStudent();
  const { idEstudiante, userName, nameSchool } = useAuth();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState("");

  useEffect(() => {
    if (!idEstudiante) {
      setError("No se encontró el ID del estudiante.");
      setLoading(false);
      return;
    }

    getStudentNotesById(idEstudiante)
      .then((data) => setNotes(data))
      .catch((err) => setError(err.message || "Error al cargar las notas."))
      .finally(() => setLoading(false));
  }, [getStudentNotesById, idEstudiante]);

  // Agrupar notas por periodo → asignatura
  const grouped = useMemo(() => {
    const map = {};
    notes.forEach((n) => {
      const periodo = n.nombre_periodo || "Sin periodo";
      const asignatura = n.nombre_asignatura || "Sin asignatura";
      if (!map[periodo]) map[periodo] = {};
      if (!map[periodo][asignatura]) {
        map[periodo][asignatura] = {
          docente: n.nombre_docente || "",
          nota_periodo: n.nota_periodo_porcentual || "",
          logro_estudiante: n.logro_nota_estudiante || "",
          items: [],
        };
      }
      map[periodo][asignatura].items.push(n);
    });
    return map;
  }, [notes]);

  const periodos = useMemo(
    () =>
      Object.keys(grouped).sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, "") || "0", 10);
        const nb = parseInt(b.replace(/\D/g, "") || "0", 10);
        return na - nb;
      }),
    [grouped],
  );

  const filteredGrouped = useMemo(() => {
    if (!selectedPeriodo) return grouped;
    return { [selectedPeriodo]: grouped[selectedPeriodo] };
  }, [grouped, selectedPeriodo]);

  if (loading) return <Loader message="Cargando notas..." size={96} />;

  if (error) {
    return (
      <div className="border p-6 rounded bg-bg h-full flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="border p-6 rounded bg-bg h-full flex items-center justify-center">
        <p className="text-muted text-lg">No hay notas registradas.</p>
      </div>
    );
  }

  return (
    <div className="border p-6 rounded bg-bg h-full gap-6 flex flex-col overflow-auto">
      <div className="flex items-center justify-between gap-4 bg-primary text-surface p-4 rounded-lg">
        <h2 className="font-bold text-2xl">Notas del Estudiante</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            className="p-2 rounded-lg text-sm text-black bg-surface border border-secondary/40 outline-none focus:ring-2  focus:ring-primary/40"
            aria-label="Filtrar por periodo"
          >
            <option value="">Todos los periodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              setPdfLoading(true);
              try {
                await generateNotesPDF(grouped, userName, nameSchool);
              } finally {
                setPdfLoading(false);
              }
            }}
            disabled={pdfLoading}
            className="flex items-center gap-2 bg-secondary text-surface px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Generando…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z" />
                </svg>
                Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {Object.entries(filteredGrouped)
        .sort(([a], [b]) => {
          const na = parseInt(a.replace(/\D/g, "") || "0", 10);
          const nb = parseInt(b.replace(/\D/g, "") || "0", 10);
          return na - nb;
        })
        .map(([periodo, asignaturas]) => (
          <div key={periodo} className="flex flex-col gap-4">
            <h3 className="font-semibold text-xl  border-b pb-2">{periodo}</h3>
            {Object.entries(asignaturas).map(([asignatura, info]) => (
              <div
                key={asignatura}
                className="bg-surface rounded-lg shadow p-4 flex flex-col gap-3"
              >
                {/* Header de asignatura */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-lg">{asignatura}</h4>
                    <p className="text-muted text-sm">
                      Docente: {info.docente}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-secondary text-surface px-3 py-2 rounded-lg text-sm font-semibold">
                      Nota periodo: {info.nota_periodo}
                    </span>
                  </div>
                </div>

                {/* Logro del estudiante */}
                {info.logro_estudiante && (
                  <div className="bg-bg rounded p-3 text-sm">
                    <span className="font-semibold">
                      Logro del estudiante:{" "}
                    </span>
                    {info.logro_estudiante}
                  </div>
                )}

                {/* Tabla de notas */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-surface">
                        <th className="text-left p-2 rounded-tl-lg">Nota</th>
                        <th className="text-center p-2">Porcentaje</th>
                        <th className="text-center p-2">Valor</th>
                        <th className="text-left p-2 rounded-tr-lg">Logro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {info.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border-b ${idx % 2 === 0 ? "bg-bg" : "bg-surface"}`}
                        >
                          <td className="p-2 capitalize">{item.nombre_nota}</td>
                          <td className="p-2 text-center">
                            {item.porcentaje}%
                          </td>
                          <td className="p-2 text-center font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                parseFloat(item.valor_nota) >= 3
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.valor_nota}
                            </span>
                          </td>
                          <td className="p-2 text-muted">
                            {item.logro || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default StudentNotes;
