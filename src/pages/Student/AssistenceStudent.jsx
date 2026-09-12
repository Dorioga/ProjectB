import { useEffect, useMemo, useState, useCallback } from "react";
import useAuth from "../../lib/hooks/useAuth";
import {
  getStudentAssistence,
  getStudentAssistenceEmphasis,
  getStudentGuardian,
} from "../../services/studentService";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import { exportAttendancePDF } from "../../utils/exportPdf";
import { useNotify } from "../../lib/hooks/useNotify";

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

const COLUMNS = [
  {
    accessorKey: "nombre_asignatura",
    header: "Asignatura",
    meta: { exportHeader: "Asignatura" },
  },
  {
    accessorKey: "nombre_periodo",
    header: "Período",
    meta: { exportHeader: "Período" },
  },
  {
    accessorKey: "nombre_grado",
    header: "Grado",
    meta: { exportHeader: "Grado" },
  },
  {
    accessorKey: "grupo",
    header: "Grupo",
    meta: { exportHeader: "Grupo" },
  },
  {
    accessorKey: "nombre_sede",
    header: "Sede",
    meta: { exportHeader: "Sede" },
  },
  {
    accessorKey: "fecha_assistance",
    header: "Fecha",
    meta: { exportHeader: "Fecha" },
    accessorFn: (row) => fmtDate(row.fecha_assistance),
  },
  {
    accessorKey: "presente",
    header: "Presente",
    meta: { exportHeader: "Presente" },
    cell: ({ getValue }) => {
      const val = getValue();
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            val === "Si"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {val ?? "-"}
        </span>
      );
    },
  },
];

const EMPHASIS_COLUMNS = [
  {
    accessorKey: "name_asignatura_enfasis",
    header: "Asignatura",
    meta: { exportHeader: "Asignatura" },
  },
  {
    accessorKey: "nombre_periodo",
    header: "Período",
    meta: { exportHeader: "Período" },
  },
  {
    accessorKey: "nombre_sede",
    header: "Sede",
    meta: { exportHeader: "Sede" },
  },
  {
    accessorKey: "date_asistencia_asignatura_enfasis",
    header: "Fecha",
    meta: { exportHeader: "Fecha" },
    accessorFn: (row) => fmtDate(row.date_asistencia_asignatura_enfasis),
  },
  {
    accessorKey: "presente",
    header: "Presente",
    meta: { exportHeader: "Presente" },
    cell: ({ getValue }) => {
      const val = getValue();
      const isPresent =
        String(val).toLowerCase() === "si" ||
        String(val).toLowerCase() === "sí" ||
        val === true ||
        val === 1;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            isPresent
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isPresent ? "Sí" : "No"}
        </span>
      );
    },
  },
];

const AssistenceStudent = () => {
  const {
    idEstudiante,
    idSede,
    idPersona,
    rol,
    nameSchool,
    nameSede,
    userName,
  } = useAuth();
  const notify = useNotify();

  const isGuardian = useMemo(() => String(rol) === "5", [rol]);

  const [records, setRecords] = useState([]);
  const [emphasisRecords, setEmphasisRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState("asistencia");

  // ── Estudiantes del acudiente (rol 5) ──────────────────────────────────
  const [guardianStudents, setGuardianStudents] = useState([]);
  const [loadingGuardianStudents, setLoadingGuardianStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    if (!isGuardian || !idPersona) {
      setGuardianStudents([]);
      return;
    }
    let mounted = true;
    setLoadingGuardianStudents(true);
    getStudentGuardian({ idPersonaGuardian: Number(idPersona) })
      .then((res) => {
        if (mounted) setGuardianStudents(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("AssistenceStudent - getStudentGuardian error:", err);
        if (mounted) setGuardianStudents([]);
      })
      .finally(() => {
        if (mounted) setLoadingGuardianStudents(false);
      });
    return () => {
      mounted = false;
    };
  }, [isGuardian, idPersona]);

  const selectedGuardianStudent = useMemo(
    () =>
      isGuardian
        ? guardianStudents.find(
            (s) => String(s.id_estudiante) === String(selectedStudentId),
          )
        : null,
    [isGuardian, guardianStudents, selectedStudentId],
  );

  const studentId = isGuardian ? selectedStudentId : idEstudiante;
  const sedeId = isGuardian
    ? selectedGuardianStudent?.id_sede ??
      selectedGuardianStudent?.fk_sede ??
      idSede
    : idSede;

  useEffect(() => {
    if (!studentId || !sedeId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [normal, emphasis] = await Promise.all([
          getStudentAssistence({
            studentId: Number(studentId),
            sedeId: Number(sedeId),
          }),
          getStudentAssistenceEmphasis({
            studentId: Number(studentId),
            sedeId: Number(sedeId),
          }),
        ]);
        setRecords(Array.isArray(normal) ? normal : []);
        setEmphasisRecords(Array.isArray(emphasis) ? emphasis : []);
      } catch (err) {
        console.error("AssistenceStudent - error:", err);
        setError(err?.message || "Error al cargar la asistencia.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, sedeId]);

  const columns = useMemo(() => COLUMNS, []);
  const emphasisColumns = useMemo(() => EMPHASIS_COLUMNS, []);

  const handleExportPDF = useCallback(async () => {
    if (!records.length) {
      notify.warning("Sin datos, no se puede generar el PDF.");
      return;
    }
    setIsExportingPDF(true);
    try {
      const studentName = userName || "Estudiante";
      const rowsWithName = records.map((r) => ({
        ...r,
        nombre_estudiante: studentName,
      }));
      const firstRow = records[0] || {};
      const gradeLabel = [firstRow.nombre_grado, firstRow.grupo]
        .filter(Boolean)
        .join(" ");
      const dates = records
        .map((r) => r.fecha_assistance)
        .filter(Boolean)
        .sort();
      const startDate = dates[0] || "";
      const endDate = dates[dates.length - 1] || "";
      const sedeLabel = firstRow.nombre_sede || nameSede || "";
      await exportAttendancePDF(rowsWithName, {
        nameSchool: nameSchool || "Institución",
        nameSede: sedeLabel,
        gradeLabel,
        journeyLabel: "",
        startDate,
        endDate,
        fileName: `Asistencias_${gradeLabel || "estudiante"}_${startDate}_${endDate}.pdf`,
      });
    } catch (err) {
      console.error("AssistenceStudent - exportPDF error:", err);
    } finally {
      setIsExportingPDF(false);
    }
  }, [records, nameSchool, nameSede, userName]);

  const noStudentSelected = isGuardian && !selectedStudentId;

  return (
    <div className="border p-6 rounded bg-bg h-full flex flex-col gap-6">
      <div className="w-full grid grid-cols-7 items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="font-bold text-2xl col-span-4">
          Asistencia del Estudiante
        </h2>
      </div>

      {isGuardian && (
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">Estudiante</label>
          {loadingGuardianStudents ? (
            <p className="text-sm text-gray-500 py-1">
              Cargando estudiantes...
            </p>
          ) : (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
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

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab("asistencia")}
          className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
            activeTab === "asistencia"
              ? "bg-primary text-white border-2 border-primary"
              : "bg-secondary text-primary hover:bg-gray-100"
          }`}
        >
          Asistencia
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enfasis")}
          className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
            activeTab === "enfasis"
              ? "bg-primary text-white border-2 border-primary"
              : "bg-secondary text-primary hover:bg-gray-100"
          }`}
        >
          Asistencia Énfasis
        </button>
      </div>

      {noStudentSelected ? (
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          Selecciona un estudiante para ver la asistencia.
        </div>
      ) : activeTab === "asistencia" ? (
        <>
          <div className="flex justify-end">
            <SimpleButton
              type="button"
              msj={isExportingPDF ? "Generando PDF..." : "Exportar PDF"}
              icon="FileText"
              bg="bg-red-600"
              text="text-white"
              noRounded={false}
              disabled={isExportingPDF}
              onClick={handleExportPDF}
              msjtooltip="Genera tabla Estudiante × Fecha segmentada por asignatura"
            />
          </div>
          <DataTable
            data={records}
            columns={columns}
            fileName="asistencia_estudiante"
            initialSorting={[{ id: "nombre_asignatura", desc: false }]}
            loading={loading}
            loaderMessage="Cargando asistencia..."
            showDownloadButtons={false}
          />
        </>
      ) : (
        <DataTable
          data={emphasisRecords}
          columns={emphasisColumns}
          fileName="asistencia_enfasis_estudiante"
          initialSorting={[{ id: "name_asignatura_enfasis", desc: false }]}
          loading={loading}
          loaderMessage="Cargando asistencia de énfasis..."
          showDownloadButtons={false}
        />
      )}
    </div>
  );
};

export default AssistenceStudent;