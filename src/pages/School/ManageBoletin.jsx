import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import Loader from "../../components/atoms/Loader";
import BoletinSelector from "../../components/molecules/BoletinSelector";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageBoletin = () => {
  const { getStudentGrades } = useSchool();
  const { getTeacherSede, getTeacherGrades } = useTeacher();
  const { institutionSedes } = useData();
  const { idSede, nameSede, idDocente, token } = useAuth();
  const notify = useNotify();

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [workdayId, setWorkdayId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [isTransicion, setIsTransicion] = useState(false);

  // ── Sedes del docente ────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // ── Tabla ────────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Modal boletín ─────────────────────────────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isBoletinOpen, setIsBoletinOpen] = useState(false);

  // Refs para evitar stale closures en callbacks
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  // ── Params memoizados para selectores ────────────────────────────────────
  const isTeacher = Boolean(idDocente);

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId ? { idSede: Number(sedeId) } : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeId, idSede],
  );

  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [idSede, nameSede, teacherSedes]);

  const sedeWorkday = useMemo(() => {
    if (!sedeId) return null;
    const candidates = [
      ...(Array.isArray(institutionSedes) ? institutionSedes : []),
      ...(Array.isArray(teacherSedes) ? teacherSedes : []),
    ];
    const sede = candidates.find(
      (s) => String(s?.id ?? s?.id_sede) === String(sedeId),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeId, institutionSedes, teacherSedes]);

  // ── Cargar sedes del docente ─────────────────────────────────────────────
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
        console.error("ManageBoletin - Error cargando sedes de docente:", err);
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

  // ── Auto-seleccionar jornada si es única ─────────────────────────────────
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    setWorkdayId(sedeWorkday);
  }, [sedeWorkday]);

  // ── Cargar estudiantes ───────────────────────────────────────────────────
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
      console.error("ManageBoletin - fetchStudents error:", err);
      setStudents([]);
      notifyRef.current.error(err?.message || "Error al cargar estudiantes.");
    } finally {
      setIsLoading(false);
    }
  }, [gradeId, getStudentGrades]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Limpiar tabla cuando cambien filtros padres
  useEffect(() => {
    setStudents([]);
  }, [sedeId, workdayId]);

  // ── Columnas de la tabla ─────────────────────────────────────────────────
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
        accessorKey: "nombre_grado",
        header: "Grado",
        meta: { hideOnLG: true },
      },
      {
        id: "acciones",
        header: "Boletín",
        cell: ({ row }) => {
          const student = row.original;
          const studentId =
            student?.id_estudiante ?? student?.id_student ?? student?.id;
          return (
            <SimpleButton
              type="button"
              msj="Ver boletín"
              icon="FileText"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              onClick={() => {
                setSelectedStudent(student);
                setIsBoletinOpen(true);
              }}
              disabled={!studentId}
            />
          );
        },
      },
    ],
    [],
  );

  const handleDownloadCurso = useCallback(() => {
    console.log("descargando", students.length, "boletines del curso...");
  }, [students]);

  const canShowTable = Boolean(sedeId && gradeId);

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <div className="lg:col-span-4 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Boletines</h2>
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

      {/* ── Checkbox Grado Transición ────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <input
          id="checkbox-transicion"
          type="checkbox"
          checked={isTransicion}
          onChange={(e) => setIsTransicion(e.target.checked)}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
        <label
          htmlFor="checkbox-transicion"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Grado Transición
        </label>
      </div>

      {/* ── Selectores en cascada ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SedeSelect
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setWorkdayId("");
            setGradeId("");
          }}
          labelClassName="text-lg font-semibold"
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />

        {isTeacher ? (
          <>
            <GradeSelector
              label="Grado"
              labelClassName="text-lg font-semibold"
              value={gradeId}
              onChange={(e) => {
                setGradeId(e.target.value);
              }}
              sedeId={sedeId}
              workdayId={workdayId}
              customFetchMethod={getTeacherGrades}
              additionalParams={teacherGradesParams}
              disabled={!sedeId}
            />
            <JourneySelect
              label="Jornada"
              labelClassName="text-lg font-semibold"
              value={workdayId}
              onChange={(e) => setWorkdayId(e.target.value)}
              filterValue={sedeWorkday}
              includeAmbas={false}
              sedeId={sedeId}
              idTeacher={idDocente}
            />
          </>
        ) : (
          <>
            <JourneySelect
              label="Jornada"
              labelClassName="text-lg font-semibold"
              value={workdayId}
              onChange={(e) => {
                setWorkdayId(e.target.value);
                setGradeId("");
              }}
              filterValue={sedeWorkday}
              includeAmbas={false}
              disabled={!sedeId}
            />
            <GradeSelector
              label="Grado"
              labelClassName="text-lg font-semibold"
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              sedeId={sedeId}
              workdayId={workdayId}
              disabled={!workdayId}
            />
          </>
        )}

        <PeriodSelector
          label="Período"
          labelClassName="text-lg font-semibold"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          autoLoad={true}
        />
      </div>

      {/* ── Mensajes de guía ──────────────────────────────────────────────── */}
      {!sedeId && (
        <p className="text-sm opacity-70">Selecciona una sede para comenzar.</p>
      )}
      {sedeId && !gradeId && (
        <p className="text-sm opacity-70">
          Selecciona un grado para ver los estudiantes.
        </p>
      )}

      {/* ── Loader / Tabla ────────────────────────────────────────────────── */}
      {canShowTable && (
        <div className="flex-1 mt-2">
          {!isLoading && students.length > 0 && (
            <div className="flex justify-end mb-3">
              <div className="w-56">
                <SimpleButton
                  type="button"
                  msj="Descargar boletines curso"
                  icon="Download"
                  bg="bg-secondary"
                  text="text-surface"
                  onClick={handleDownloadCurso}
                />
              </div>
            </div>
          )}
          {isLoading ? (
            <Loader message="Cargando estudiantes..." size={96} />
          ) : (
            <DataTable
              data={students}
              columns={columns}
              fileName="gestion_boletines"
              pageSize={50}
            />
          )}
        </div>
      )}

      {/* ── Modal Boletín ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isBoletinOpen}
        onClose={() => {
          setIsBoletinOpen(false);
          setSelectedStudent(null);
        }}
        title={
          selectedStudent
            ? `Boletín — ${selectedStudent.nombre_estudiante ?? selectedStudent.nombre ?? ""} ${selectedStudent.apellido_estudiante ?? selectedStudent.apellido ?? ""}`.trim()
            : "Boletín"
        }
        size="7xl"
      >
        {selectedStudent && (
          <BoletinSelector
            studentId={
              selectedStudent.id_estudiante ??
              selectedStudent.id_student ??
              selectedStudent.id
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageBoletin;
