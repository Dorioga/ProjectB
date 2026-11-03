import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import Loader from "../../components/atoms/Loader";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageYearScholar = () => {
  const { getStudentGrades, getGradeOnlySede } = useSchool();
  const { getTeacherSede, getTeacherGrades } = useTeacher();
  const { idSede, nameSede, idDocente, token, rol } = useAuth();
  const notify = useNotify();

  const [sedeId, setSedeId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  const isTeacher = Boolean(idDocente);
  const isRol3 = useMemo(() => String(rol) === "3", [rol]);

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId ? { idSede: Number(sedeId) } : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeId, idSede],
  );

  const gradeSede3Params = useMemo(
    () => ({ idSede: Number(sedeId || idSede) }),
    [sedeId, idSede],
  );

  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [idSede, nameSede, teacherSedes]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      if (mounted) setLoadingTeacherSedes(true);
      try {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = list.filter(Boolean).map((s) => ({
          id: String(s?.id ?? s?.id_sede ?? "").trim(),
          name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
          fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
          fk_institucion:
            s?.fk_institucion ??
            s?.fkInstitution ??
            s?.id_institucion ??
            undefined,
        }));
        if (mounted) setTeacherSedes(mapped);
      } catch (err) {
        console.error("ManageYearScholar - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [idDocente, getTeacherSede, token]);

  const fetchStudents = useCallback(async () => {
    if (!gradeId) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getStudentGrades({ idGrade: Number(gradeId) });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setStudents(data);
      if (data.length === 0) {
        notifyRef.current.info(
          "No se encontraron estudiantes para el grado seleccionado.",
        );
      }
    } catch (err) {
      console.error("ManageYearScholar - fetchStudents error:", err);
      setStudents([]);
      notifyRef.current.error(err?.message || "Error al cargar estudiantes.");
    } finally {
      setIsLoading(false);
    }
  }, [gradeId, getStudentGrades]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setStudents([]);
  }, [sedeId]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_estudiante",
        header: "ID",
        meta: { hideOnLG: true },
      },
      {
        accessorFn: (row) =>
          `${row.nombre_estudiante ?? row.nombre ?? ""} ${row.apellido_estudiante ?? row.apellido ?? ""}`.trim(),
        id: "nombre_completo",
        header: "Nombre",
      },
      {
        accessorKey: "grado",
        header: "Grado",
        meta: { hideOnLG: true },
      },
    ],
    [],
  );

  const canShowTable = Boolean(sedeId && gradeId);

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <div className="lg:col-span-4 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Año Escolar</h2>
        </div>
        <SimpleButton
          type="button"
          icon="HelpCircle"
          msjtooltip="Ayuda"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SedeSelect
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setGradeId("");
          }}
          labelClassName="text-lg font-semibold"
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />
        {isTeacher ? (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            customFetchMethod={getTeacherGrades}
            additionalParams={teacherGradesParams}
            disabled={!sedeId}
          />
        ) : isRol3 ? (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            customFetchMethod={getGradeOnlySede}
            additionalParams={gradeSede3Params}
            disabled={!sedeId}
          />
        ) : (
          <GradeSelector
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            sedeId={sedeId}
            disabled={!sedeId}
          />
        )}
      </div>

      {!sedeId && (
        <p className="text-sm opacity-70">Selecciona una sede para comenzar.</p>
      )}
      {sedeId && !gradeId && (
        <p className="text-sm opacity-70">
          Selecciona un grado para ver los estudiantes.
        </p>
      )}

      {canShowTable && (
        <div className="flex-1 mt-2">
          {isLoading ? (
            <Loader message="Cargando estudiantes..." size={96} />
          ) : (
            <DataTable
              data={students}
              columns={columns}
              fileName="gestion_anio_escolar"
              pageSize={50}
              initialSorting={[{ id: "nombre_completo", desc: false }]}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ManageYearScholar;
