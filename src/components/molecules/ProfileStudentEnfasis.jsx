import { useState, useEffect, useMemo } from "react";
import SimpleButton from "../atoms/SimpleButton";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import GradeSelector from "../atoms/GradeSelector";
import DataTable from "../atoms/DataTable";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getInstitutionEmphasisArea,
  getStudentsByGrade,
  registerStudentsEnfasis,
} from "../../services/enfasisService";

const ProfileStudentEnfasis = ({ onSave, onClose }) => {
  const { idInstitution } = useAuth();
  const { institutionSedes } = useData();
  const notify = useNotify();

  const [sede, setSede] = useState("");
  const [jornada, setJornada] = useState("");
  const [grado, setGrado] = useState("");

  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [asignatura, setAsignatura] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!idInstitution) return;
    let mounted = true;
    setLoadingAsignaturas(true);
    getInstitutionEmphasisArea({ institution: Number(idInstitution) })
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
  }, [idInstitution]);

  const sedeWorkday = useMemo(() => {
    if (!sede || !Array.isArray(institutionSedes)) return null;
    const s = institutionSedes.find((x) => String(x?.id) === String(sede));
    return s?.fk_workday ? String(s.fk_workday) : null;
  }, [sede, institutionSedes]);

  useEffect(() => {
    setJornada("");
    setGrado("");
    setStudents([]);
    setSelectedIds([]);
  }, [sede]);

  useEffect(() => {
    setGrado("");
    setStudents([]);
    setSelectedIds([]);
  }, [jornada]);

  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    setJornada(sedeWorkday);
  }, [sedeWorkday]);

  useEffect(() => {
    setStudents([]);
    setSelectedIds([]);
    if (!grado) return;
    let mounted = true;
    setLoadingStudents(true);
    getStudentsByGrade(grado)
      .then((res) => {
        if (mounted) setStudents(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setStudents([]);
      })
      .finally(() => {
        if (mounted) setLoadingStudents(false);
      });
    return () => {
      mounted = false;
    };
  }, [grado]);

  const studentId = (row) =>
    row?.id_estudiante ?? row?.id ?? row?.id_student ?? null;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_identificacion",
        header: "Número de identificación",
        accessorFn: (row) => row.numero_identificacion ?? "",
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        accessorFn: (row) => row.nombre ?? "",
      },
      {
        id: "select",
        header: "Seleccionar",
        cell: ({ row }) => {
          const enfasis = String(row.original.enfasis ?? "").toLowerCase();
          const id = studentId(row.original);
          if (enfasis === "asignado") {
            return (
              <div className="flex items-center justify-center">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                  Asignado
                </span>
              </div>
            );
          }
          if (id == null) return null;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(id)}
                onChange={() => toggleSelect(id)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds],
  );

  const validate = (showErrors = true) => {
    const next = {};
    if (!asignatura) next.asignatura = "Selecciona una asignatura.";
    if (!sede) next.sede = "Selecciona una sede.";
    if (!jornada) next.jornada = "Selecciona una jornada.";
    if (!grado) next.grado = "Selecciona un grado.";
    if (selectedIds.length === 0)
      next.students = "Selecciona al menos un estudiante.";
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate(true)) return;
    setSaving(true);
    try {
      await registerStudentsEnfasis({
        asignature: Number(asignatura),
        students: selectedIds.map((id) => ({ student: Number(id) })),
      });
      notify.success("Estudiantes registrados al énfasis exitosamente.");
      if (typeof onSave === "function") onSave();
    } catch (err) {
      console.error(
        "ProfileStudentEnfasis - registerStudentsEnfasis error:",
        err,
      );
      notify.error(err?.message || "Error al registrar los estudiantes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="font-semibold">Asignatura</label>
          <select
            name="asignatura"
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
          {errors.asignatura && (
            <div className="text-sm text-red-600 mt-1">
              {errors.asignatura}
            </div>
          )}
        </div>

        <div>
          <SedeSelect
            labelClassName="font-semibold"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          />
          {errors.sede && (
            <div className="text-sm text-red-600 mt-1">{errors.sede}</div>
          )}
        </div>

        <div>
          <JourneySelect
            labelClassName="font-semibold"
            value={jornada}
            onChange={(e) => setJornada(e.target.value)}
            filterValue={sedeWorkday}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.jornada && (
            <div className="text-sm text-red-600 mt-1">{errors.jornada}</div>
          )}
        </div>

        <div>
          <GradeSelector
            labelClassName="font-semibold"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            sedeId={sede}
            workdayId={jornada}
            autoLoad={true}
            disabled={!sede || !jornada}
          />
          {errors.grado && (
            <div className="text-sm text-red-600 mt-1">{errors.grado}</div>
          )}
        </div>
      </div>

      {loadingStudents || students.length > 0 ? (
        <div className="relative flex-1 min-h-[200px]">
          <DataTable
            data={students}
            columns={columns}
            fileName="Export_Estudiantes_Enfasis"
            loading={loadingStudents}
            loaderMessage="Cargando estudiantes..."
          />
        </div>
      ) : null}

      {errors.students && (
        <div className="text-sm text-red-600">{errors.students}</div>
      )}

      <div className="flex justify-end gap-2">
        <div className="w-36">
          <SimpleButton
            type="button"
            onClick={onClose}
            msj="Cancelar"
            icon="X"
            bg="bg-gray-200"
            text="text-gray-700"
            noRounded={false}
          />
        </div>
        <div className="w-56">
          <SimpleButton
            onClick={handleSubmit}
            msj={saving ? "Registrando..." : "Registrar estudiantes"}
            icon={saving ? "Loader" : "Save"}
            bg="bg-primary"
            text="text-surface"
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileStudentEnfasis;