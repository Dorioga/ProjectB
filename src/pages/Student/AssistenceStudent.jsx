import { useEffect, useMemo, useState, useCallback } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { getStudentAssistence } from "../../services/studentService";
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

const AssistenceStudent = () => {
  const { idEstudiante, idSede, nameSchool, nameSede, userName } = useAuth();
  const notify = useNotify();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    if (!idEstudiante || !idSede) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudentAssistence({
          studentId: Number(idEstudiante),
          sedeId: Number(idSede),
        });
        setRecords(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("AssistenceStudent - error:", err);
        setError(err?.message || "Error al cargar la asistencia.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idEstudiante, idSede]);

  const columns = useMemo(() => COLUMNS, []);

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

  return (
    <div className="border p-6 rounded bg-bg h-full flex flex-col gap-6">
      <div className="w-full grid grid-cols-7 items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="font-bold text-2xl col-span-4">
          Asistencia del Estudiante
        </h2>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4 text-sm">
          {error}
        </div>
      )}

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
        loading={loading}
        loaderMessage="Cargando asistencia..."
        showDownloadButtons={false}
      />
    </div>
  );
};

export default AssistenceStudent;
