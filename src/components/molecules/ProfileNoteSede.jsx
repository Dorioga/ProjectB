import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useTeacher from "../../lib/hooks/useTeacher";
import useSchool from "../../lib/hooks/useSchool";
import SedeSelect from "../atoms/SedeSelect";
import GradeSelector from "../atoms/GradeSelector";
import SimpleButton from "../atoms/SimpleButton";
import DataTable from "../atoms/DataTable";
import Loader from "../atoms/Loader";
import { useNotify } from "../../lib/hooks/useNotify";
import { jsPDF } from "jspdf";
import { getCurrentTheme } from "../../utils/themeManager";
import { abreviarAsignatura } from "../../utils/formatUtils";

// ─── helpers ────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 2, currentYear - 1, currentYear];

const loadLogo = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const fullSrc = src.startsWith("http")
      ? src
      : `https://www.nexusplataforma.com${src}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = fullSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxW = 300;
      let w = img.width,
        h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.75), w, h });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });

// ─── PDF export ─────────────────────────────────────────────────────────────
async function exportNotesGradesPDF(data, opts = {}) {
  const {
    nameSchool = "Institución",
    nameSede = "",
    gradeLabel = "",
    periodoLabel = "",
    anio = "",
    imgSchool = "",
    fileName = "Notas_Grado.pdf",
  } = opts;

  if (!data || !data.length) return;

  const logoData = await loadLogo(imgSchool);

  // Recopilar todas las asignaturas únicas (ordenadas alfabéticamente)
  const asigSet = new Map();
  for (const row of data) {
    for (const a of row.asignaturas ?? []) {
      if (!asigSet.has(a.id_asignatura)) {
        asigSet.set(a.id_asignatura, a.nombre_asignatura);
      }
    }
  }
  const asignaturas = Array.from(asigSet.entries()).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );

  // Dimensiones A4 landscape
  const PAGE_W = 297;
  const PAGE_H = 210;
  const MARGIN = 10;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const HDR_H = 37;
  const CONTENT_TOP = MARGIN + HDR_H;
  const CONTENT_BOT = PAGE_H - MARGIN;

  const STUDENT_COL_W = 52;
  const POS_COL_W = 10;
  const PROM_COL_W = 14;
  const ASIG_AREA_W = CONTENT_W - STUDENT_COL_W - POS_COL_W - PROM_COL_W;
  const asigW =
    asignaturas.length > 0
      ? Math.max(6, Math.min(18, ASIG_AREA_W / asignaturas.length))
      : 10;

  const TABLE_W =
    STUDENT_COL_W + POS_COL_W + asignaturas.length * asigW + PROM_COL_W;
  const HDR_ROW_H = 18;
  const ROW_H = 7;
  const SUBJ_HDR_H = 8;

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const drawPageHeader = () => {
    const y0 = MARGIN;
    const cx = PAGE_W / 2;

    if (logoData) {
      const logoH = 18;
      const logoW = (logoData.w / logoData.h) * logoH;
      pdf.addImage(logoData.dataUrl, "JPEG", MARGIN, y0 + 2, logoW, logoH);
    }

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(nameSchool.toUpperCase(), cx, y0 + 7, { align: "center" });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOTAS POR GRADO", cx, y0 + 14, { align: "center" });

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(MARGIN, y0 + 17, PAGE_W - MARGIN, y0 + 17);

    const infoY = y0 + 25;
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
    if (anio) drawInfoPair("Año", String(anio), col1X, row2Y);
    if (periodoLabel) drawInfoPair("Período", periodoLabel, col2X, row2Y);

    const fechaGen = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generado: ${fechaGen}`, PAGE_W - MARGIN, row2Y, {
      align: "right",
    });

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.6);
    pdf.line(MARGIN, y0 + HDR_H - 1, PAGE_W - MARGIN, y0 + HDR_H - 1);

    return CONTENT_TOP;
  };

  const drawTableHeader = (y) => {
    // Fila cabecera columnas
    pdf.setFillColor(255, 255, 255);
    pdf.rect(MARGIN, y, TABLE_W, HDR_ROW_H, "F");

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);

    // Pos
    pdf.text("PUESTO", MARGIN + POS_COL_W / 2, y + HDR_ROW_H / 2 + 1, {
      align: "center",
    });
    // Estudiante
    pdf.text(
      "ESTUDIANTE",
      MARGIN + POS_COL_W + STUDENT_COL_W / 2,
      y + HDR_ROW_H / 2 + 1,
      { align: "center" },
    );

    // Asignaturas (rotadas)
    for (let i = 0; i < asignaturas.length; i++) {
      const cx2 = MARGIN + POS_COL_W + STUDENT_COL_W + i * asigW + asigW / 2;
      pdf.setFontSize(5.5);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        abreviarAsignatura(asignaturas[i][1]),
        cx2,
        y + HDR_ROW_H - 1.5,
        {
          angle: 90,
          align: "center",
        },
      );
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.15);
      pdf.line(cx2 + asigW / 2, y, cx2 + asigW / 2, y + HDR_ROW_H);
    }

    // Promedio
    const promX =
      MARGIN + POS_COL_W + STUDENT_COL_W + asignaturas.length * asigW;
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROM", promX + PROM_COL_W / 2, y + HDR_ROW_H / 2 + 1, {
      align: "center",
    });

    // Líneas verticales separadoras
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN + POS_COL_W, y, MARGIN + POS_COL_W, y + HDR_ROW_H);
    pdf.line(
      MARGIN + POS_COL_W + STUDENT_COL_W,
      y,
      MARGIN + POS_COL_W + STUDENT_COL_W,
      y + HDR_ROW_H,
    );
    pdf.line(promX, y, promX, y + HDR_ROW_H);

    // Borde externo
    pdf.setLineWidth(0.4);
    pdf.rect(MARGIN, y, TABLE_W, HDR_ROW_H, "S");

    return y + HDR_ROW_H;
  };

  let y = drawPageHeader();

  // Encabezado de tabla
  if (y + HDR_ROW_H + ROW_H > CONTENT_BOT) {
    pdf.addPage();
    y = drawPageHeader();
  }
  y = drawTableHeader(y);

  for (const row of data) {
    if (y + ROW_H > CONTENT_BOT) {
      pdf.addPage();
      y = drawPageHeader();
      y = drawTableHeader(y);
    }

    pdf.setFillColor(255, 255, 255);
    pdf.rect(MARGIN, y, TABLE_W, ROW_H, "F");

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    // Posicion
    pdf.text(
      String(row.posicion ?? ""),
      MARGIN + POS_COL_W / 2,
      y + ROW_H - 2,
      { align: "center" },
    );

    // Estudiante
    const nameLine =
      pdf.splitTextToSize(row.estudiante ?? "", STUDENT_COL_W - 3)[0] ?? "";
    pdf.text(nameLine, MARGIN + POS_COL_W + 2, y + ROW_H - 2);

    // Notas por asignatura
    const notasMap = new Map(
      (row.asignaturas ?? []).map((a) => [a.id_asignatura, a.nota_asignatura]),
    );
    for (let i = 0; i < asignaturas.length; i++) {
      const nota = notasMap.get(asignaturas[i][0]);
      const cx2 = MARGIN + POS_COL_W + STUDENT_COL_W + i * asigW + asigW / 2;
      if (nota !== null && nota !== undefined) {
        pdf.setFont("helvetica", "normal");
        pdf.text(String(nota), cx2, y + ROW_H - 2, { align: "center" });
      }
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(cx2 + asigW / 2, y, cx2 + asigW / 2, y + ROW_H);
    }

    // Promedio
    const promX =
      MARGIN + POS_COL_W + STUDENT_COL_W + asignaturas.length * asigW;
    pdf.setFont("helvetica", "bold");
    pdf.text(
      String(row.promedio ?? ""),
      promX + PROM_COL_W / 2,
      y + ROW_H - 2,
      { align: "center" },
    );

    // Separadores y borde
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.15);
    pdf.line(MARGIN + POS_COL_W, y, MARGIN + POS_COL_W, y + ROW_H);
    pdf.line(
      MARGIN + POS_COL_W + STUDENT_COL_W,
      y,
      MARGIN + POS_COL_W + STUDENT_COL_W,
      y + ROW_H,
    );
    pdf.line(promX, y, promX, y + ROW_H);
    pdf.setLineWidth(0.3);
    pdf.rect(MARGIN, y, TABLE_W, ROW_H, "S");

    y += ROW_H;
  }

  // Línea de cierre
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, y, MARGIN + TABLE_W, y);

  pdf.save(fileName);
}

// ─── Component ───────────────────────────────────────────────────────────────
const ProfileNoteSede = () => {
  const {
    rol,
    idSede,
    nameSede,
    idDocente,
    idInstitution,
    nameSchool,
    imgSchool,
  } = useAuth();
  const {
    getNotesGradesSede,
    getTeacherSede,
    getTeacherGrades,
    loadingTeachers,
  } = useTeacher();
  const { getGradeOnlySede } = useSchool();
  const notify = useNotify();

  const isDocente = String(rol) === "7";
  const isAdmin = String(rol) === "3";

  // ── Sedes del docente ─────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  useEffect(() => {
    if (!isDocente || !idDocente) return;
    let mounted = true;
    setLoadingTeacherSedes(true);
    getTeacherSede({ idDocente: Number(idDocente) })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setTeacherSedes(
          list.map((s) => ({
            id: s.id_sede ?? s.id,
            name: s.nombre_sede ?? s.name ?? s.nombre,
          })),
        );
      })
      .catch(() => {
        if (mounted) setTeacherSedes([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeacherSedes(false);
      });
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede]);

  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState(() =>
    isDocente ? String(idSede ?? "") : "",
  );
  const [gradeId, setGradeId] = useState("");
  const [anio, setAnio] = useState(String(currentYear));
  const [periodoId, setPeriodoId] = useState("");

  // Periodos (hardcoded según el patrón de la app, o se puede cargar via PeriodSelector)
  const [periods, setPeriods] = useState([]);
  const { periods: ctxPeriods, loadPeriods } = useSchool();

  useEffect(() => {
    if (!ctxPeriods || ctxPeriods.length === 0) {
      loadPeriods().catch(() => {});
    }
  }, [ctxPeriods, loadPeriods]);

  const periodOptions = useMemo(() => {
    if (!Array.isArray(ctxPeriods)) return [];
    return ctxPeriods.map((p) => ({
      value: String(p.id_periodo ?? p.id),
      label: p.nombre_periodo ?? p.nombre ?? `Periodo ${p.id_periodo ?? p.id}`,
    }));
  }, [ctxPeriods]);

  // Params para GradeSelector según rol
  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId && { idSede: Number(sedeId) }),
    }),
    [idDocente, sedeId],
  );

  const gradeSede3Params = useMemo(
    () => ({ idSede: Number(sedeId) }),
    [sedeId],
  );

  // ── Resultado ─────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodoLabel, setPeriodoLabel] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [sedeLabel, setSedeLabel] = useState(isDocente ? (nameSede ?? "") : "");

  // Detectar labels para el PDF
  const handleFetch = useCallback(async () => {
    if (!sedeId || !gradeId || !anio || !periodoId) {
      notify("Completa todos los filtros para consultar.", "warning");
      return;
    }
    setIsLoading(true);
    try {
      const res = await getNotesGradesSede({
        fk_grade: Number(gradeId),
        fk_sede: Number(sedeId),
        anio: Number(anio),
        id_periodo: Number(periodoId),
      });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setTableData(list);
      // label for PDF
      const pOpt = periodOptions.find((p) => p.value === String(periodoId));
      if (pOpt) setPeriodoLabel(pOpt.label);
    } catch {
      notify("Error al consultar las notas.", "error");
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    sedeId,
    gradeId,
    anio,
    periodoId,
    getNotesGradesSede,
    notify,
    periodOptions,
  ]);

  // ── Columnas dinámicas ────────────────────────────────────────────────────
  const columns = useMemo(() => {
    if (!tableData.length) return [];

    // Recopilar asignaturas únicas
    const asigMap = new Map();
    for (const row of tableData) {
      for (const a of row.asignaturas ?? []) {
        if (!asigMap.has(a.id_asignatura)) {
          asigMap.set(a.id_asignatura, a.nombre_asignatura);
        }
      }
    }
    const asignaturas = Array.from(asigMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );

    const fixedCols = [
      {
        header: "Puesto",
        accessorKey: "posicion",
        size: 40,
      },
      {
        header: "Estudiante",
        accessorKey: "estudiante",
        size: 180,
      },
    ];

    const asigCols = asignaturas.map(([id, nombre]) => ({
      header: abreviarAsignatura(nombre),
      id: `asig_${id}`,
      accessorFn: (row) => {
        const found = (row.asignaturas ?? []).find(
          (a) => a.id_asignatura === id,
        );
        return found?.nota_asignatura ?? "";
      },
      size: 80,
    }));

    const promCol = {
      header: "Promedio",
      accessorKey: "promedio",
      size: 70,
    };

    return [...fixedCols, ...asigCols, promCol];
  }, [tableData]);

  // ── Export PDF ────────────────────────────────────────────────────────────
    const handleExportPDF = useCallback(async () => {
    if (!tableData.length) {
      notify("No hay datos para exportar.", "warning");
      return;
    }
    await exportNotesGradesPDF(tableData, {
      nameSchool: nameSchool ?? "Institución",
      nameSede: sedeLabel,
      gradeLabel,
      periodoLabel,
      anio,
      imgSchool: imgSchool ?? "",
      fileName: `Notas_Grado_${gradeLabel}_${anio}_${periodoLabel}.pdf`,
    });
  }, [
    tableData,
    nameSchool,
    sedeLabel,
    gradeLabel,
    periodoLabel,
    anio,
    imgSchool,
    notify,
  ]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">Notas por Grado</h2>
      </div>

      {/* ── Filtros ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
        {/* Sede */}
        <SedeSelect
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setGradeId("");
            // Buscar label
            const opt = (teacherSedeData ?? []).find(
              (s) => String(s.id) === String(e.target.value),
            );
            setSedeLabel(opt?.name ?? e.target.value);
          }}
          data={isDocente ? teacherSedeData : null}
          loading={isDocente ? loadingTeacherSedes : false}
          disabled={isDocente}
        />

        {/* Grado */}
        {isDocente ? (
          <GradeSelector
            label="Grado"
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
              // label capturado por el select nativo via option text
            }}
            placeholder="Selecciona grado"
            sedeId={sedeId}
            customFetchMethod={getTeacherGrades}
            additionalParams={teacherGradesParams}
            disabled={!sedeId}
            onOptionChange={(label) => setGradeLabel(label)}
          />
        ) : (
          <GradeSelector
            label="Grado"
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
            }}
            placeholder="Selecciona grado"
            sedeId={sedeId}
            customFetchMethod={getGradeOnlySede}
            additionalParams={gradeSede3Params}
            disabled={!sedeId}
            onOptionChange={(label) => setGradeLabel(label)}
          />
        )}

        {/* Año */}
        <div>
          <label className="block text-sm font-medium mb-1">Año</label>
          <select
            className="w-full p-2 border rounded bg-surface"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Periodo */}
        <div>
          <label className="block text-sm font-medium mb-1">Período</label>
          <select
            className="w-full p-2 border rounded bg-surface"
            value={periodoId}
            onChange={(e) => setPeriodoId(e.target.value)}
          >
            <option value="">Selecciona un período</option>
            {periodOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Consultar */}
        <div className="flex items-end gap-2">
          <SimpleButton
            msj="Consultar"
            icon="Search"
            bg="bg-primary"
            text="text-surface"
            noRounded={false}
            disabled={!sedeId || !gradeId || !anio || !periodoId || isLoading}
            onClick={handleFetch}
          />
          {tableData.length > 0 && (
            <SimpleButton
              msj="PDF"
              icon="FileText"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              onClick={handleExportPDF}
            />
          )}
        </div>
      </div>

      {/* ── Tabla ── */}
      {isLoading ? (
        <Loader size={80} message="Cargando notas..." />
      ) : tableData.length > 0 ? (
        <DataTable
          data={tableData}
          columns={columns}
          fileName={`Notas_Grado_${anio}`}
          loading={false}
          showDownloadButtons={true}
        />
      ) : (
        <p className="text-center text-sm opacity-70 mt-4">
          Selecciona los filtros y presiona Consultar para ver las notas.
        </p>
      )}
    </div>
  );
};

export default ProfileNoteSede;
