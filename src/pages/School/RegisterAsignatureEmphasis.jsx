import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import DataTable from "../../components/atoms/DataTable";
import Loader from "../../components/atoms/Loader";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getTeacherAsignatures,
  getStudentEnfasis,
  registerAssistanceStudentEmphasis,
} from "../../services/enfasisService";

const getStudentKey = (student) =>
  String(
    student?.fk_student ?? student?.id_student ?? student?.id ?? "",
  ).trim();

const RegisterAsignatureEmphasis = ({ onClose }) => {
  const { idDocente, idSede } = useAuth();
  const notify = useNotify();

  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [asignatura, setAsignatura] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [fechaAsistencia, setFechaAsistencia] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [students, setStudents] = useState([]);
  const [attendanceByStudent, setAttendanceByStudent] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const attendanceByStudentRef = useRef(attendanceByStudent);
  attendanceByStudentRef.current = attendanceByStudent;

  useEffect(() => {
    if (!idDocente) return;
    let mounted = true;
    setLoadingAsignaturas(true);
    getTeacherAsignatures(idDocente)
      .then((res) => {
        if (mounted) setAsignaturas(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setAsignaturas([]);
      })
      .finally(() => {
        if (mounted) setLoadingAsignaturas(false);
      });
    return () => {
      mounted = false;
    };
  }, [idDocente]);

  const loadData = useCallback(async () => {
    if (!idDocente || !asignatura || !periodo) {
      setStudents([]);
      setAttendanceByStudent({});
      return;
    }
    setLoadingData(true);
    try {
      const studentsResponse = await getStudentEnfasis(asignatura);
      const studentsArray = Array.isArray(studentsResponse)
        ? studentsResponse
        : [];
      setStudents(studentsArray);

      const initial = {};
      (Array.isArray(studentsArray) ? studentsArray : []).forEach((s) => {
        const sKey = getStudentKey(s);
        initial[sKey] = "";
      });
      setAttendanceByStudent(initial);
    } catch (err) {
      console.error(
        "RegisterAsignatureEmphasis - loadData error:",
        err,
      );
      notify.error(err?.message || "No fue posible cargar los estudiantes.");
      setStudents([]);
      setAttendanceByStudent({});
    } finally {
      setLoadingData(false);
    }
  }, [idDocente, asignatura, periodo, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttendanceChange = (studentKey, value) => {
    setAttendanceByStudent((prev) => ({
      ...prev,
      [studentKey]: value,
    }));
  };

  const tableData = useMemo(
    () =>
      (Array.isArray(students) ? students : []).map((s) => ({
        ...s,
        __attendance: attendanceByStudent[getStudentKey(s)],
      })),
    [students, attendanceByStudent],
  );

  const handleSaveAll = async () => {
    if (saving) return;
    if (!asignatura || !periodo || !idSede) {
      notify.error("Faltan datos: asignatura, período o sede.");
      return;
    }
    const studentsArray = Array.isArray(students) ? students : [];
    if (studentsArray.length === 0) {
      notify.info("No hay estudiantes para registrar.");
      return;
    }
    setSaving(true);
    try {
      const rows = studentsArray.map((s) => {
        const studentKey = getStudentKey(s);
        const presente = attendanceByStudentRef.current?.[studentKey] === "Sí"
          ? "Sí"
          : "No";
        return {
          fk_estudiante: Number(studentKey),
          fk_asignatura: Number(asignatura),
          fecha_assistance: fechaAsistencia,
          fk_periodo: Number(periodo),
          presente,
          fk_sede: Number(idSede),
        };
      });
      await registerAssistanceStudentEmphasis(rows);
      notify.success("Asistencia registrada exitosamente.");
      await loadData();
    } catch (err) {
      console.error(
        "RegisterAsignatureEmphasis - registerAssistanceStudentEmphasis error:",
        err,
      );
      notify.error(err?.message || "Error al registrar la asistencia.");
    } finally {
      setSaving(false);
    }
  };

  const tableColumns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Estudiante",
        cell: ({ row }) => {
          const s = row.original;
          const name = s.nombre ?? "";
          const doc = s.numero_identificacion ?? s.identification ?? "";
          return (
            <div className="p-2 text-sm">
              <div className="font-medium">{name}</div>
              {s.grado && (
                <div className="text-xs text-gray-500">{s.grado}</div>
              )}
              {doc && (
                <div className="text-xs text-gray-400">{doc}</div>
              )}
            </div>
          );
        },
      },
      {
        id: "present",
        header: "Presente",
        cell: ({ row }) => {
          const sKey = getStudentKey(row.original);
          const present =
            attendanceByStudentRef.current?.[sKey] === "Sí";
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="w-6 h-6 cursor-pointer accent-primary"
                checked={present}
                onChange={(e) =>
                  handleAttendanceChange(sKey, e.target.checked ? "Sí" : "")
                }
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <div>
          <label className="">Asignatura énfasis</label>
          <select
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingAsignaturas
                ? "Cargando asignaturas..."
                : "Selecciona asignatura"}
            </option>
            {!loadingAsignaturas &&
              asignaturas.map((a) => (
                <option
                  key={a.id_asignatura_enfasis}
                  value={a.id_asignatura_enfasis}
                >
                  {a.name_asignatura_enfasis}
                </option>
              ))}
          </select>
        </div>
        <div>
          <PeriodSelector
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
            autoLoad={true}
          />
        </div>
        <div>
          <label className="">Fecha de asistencia</label>
          <input
            type="date"
            value={fechaAsistencia}
            onChange={(e) => setFechaAsistencia(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
      </div>

      {!asignatura || !periodo ? (
        <div className="text-sm text-gray-500 p-4 border rounded bg-surface">
          Selecciona asignatura y período para cargar los estudiantes.
        </div>
      ) : loadingData ? (
        <Loader message="Cargando estudiantes..." />
      ) : (
        <>
          <p className="text-xs text-gray-500 italic">
            Los estudiantes sin marcar se registrarán como ausentes (No).
          </p>

          <div className="relative flex-1 min-h-[300px]">
            <DataTable
              data={tableData}
              columns={tableColumns}
              fileName="Export_Asistencia_Enfasis"
              loaderMessage="Cargando estudiantes..."
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <SimpleButton
          onClick={handleSaveAll}
          msj={saving ? "Guardando..." : "Guardar asistencias"}
          icon={saving ? "Loader" : "Save"}
          bg="bg-secondary"
          text="text-surface"
          disabled={saving || students.length === 0}
        />
        <SimpleButton
          type="button"
          onClick={onClose}
          msj="Cerrar"
          icon="X"
          bg="bg-gray-200"
          text="text-gray-700"
          noRounded={false}
        />
      </div>
    </div>
  );
};

export default RegisterAsignatureEmphasis;