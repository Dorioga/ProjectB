import { useEffect, useMemo, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { getStudentAssistence } from "../../services/studentService";
import DataTable from "../../components/atoms/DataTable";

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
  const { idEstudiante, idSede } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
