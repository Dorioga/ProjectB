import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterDBA from "../../components/molecules/RegisterDBA";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageDBA = () => {
  const { getTeacherSede, getTeacherGrades, getTeacherSubjects } = useTeacher();
  const { idSede, nameSede, idDocente, token } = useAuth();
  const notify = useNotify();
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [workdayId, setWorkdayId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [asignatureId, setAsignatureId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [detectedJourney, setDetectedJourney] = useState(null);

  // ── Sedes del docente ────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // ── Tabla ────────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // ── Params derivados ─────────────────────────────────────────────────────
  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId ? { idSede: Number(sedeId) } : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeId, idSede],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      gradeId && idDocente
        ? { idGrade: Number(gradeId), idTeacher: Number(idDocente) }
        : {},
    [gradeId, idDocente],
  );

  const teacherSedeData = useMemo(() => {
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [idSede, nameSede, teacherSedes]);

  const sedeWorkday = useMemo(() => {
    if (!sedeId) return null;
    const sede = (Array.isArray(teacherSedes) ? teacherSedes : []).find(
      (s) => String(s?.id ?? s?.id_sede) === String(sedeId),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeId, teacherSedes]);

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
        console.error("ManageDBA - Error cargando sedes de docente:", err);
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

  // ── Limpiar tabla cuando cambien los selectores padres ───────────────────
  useEffect(() => {
    setTableData([]);
  }, [sedeId, workdayId]);

  // ── Columnas maqueta ─────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", meta: { hideOnLG: true } },
      { accessorKey: "proposito", header: "Propósito" },
      { accessorKey: "descripcion", header: "Descripción" },
      {
        accessorKey: "derechos_basicos",
        header: "Derechos Básicos",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "asignatura",
        header: "Asignatura",
        meta: { hideOnLG: true },
      },
      { accessorKey: "grado", header: "Grado", meta: { hideOnLG: true } },
      { accessorKey: "periodo", header: "Periodo", meta: { hideOnLG: true } },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <div className="lg:col-span-3 xl:col-span-3 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de DBA</h2>
        </div>
        <div className="grid grid-cols-2 col-span-2 gap-2">
          <SimpleButton
            type="button"
            onClick={() => setIsAddOpen(true)}
            msj="Registrar DBA"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
          <div />
        </div>
      </div>

      {/* ── Selectores en cascada ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
        <SedeSelect
          value={sedeId}
          onChange={(e) => {
            setSedeId(e.target.value);
            setWorkdayId("");
            setGradeId("");
            setAsignatureId("");
            setDetectedJourney(null);
          }}
          data={teacherSedeData}
          loading={loadingTeacherSedes}
        />

        <GradeSelector
          label="Grado"
          value={gradeId}
          onChange={(e) => {
            setGradeId(e.target.value);
            setAsignatureId("");
            setDetectedJourney(null);
          }}
          placeholder="Selecciona grado"
          sedeId={sedeId}
          workdayId={workdayId}
          autoLoad={true}
          customFetchMethod={getTeacherGrades}
          additionalParams={teacherGradesParams}
          disabled={!sedeId}
        />

        <AsignatureSelector
          label="Asignatura"
          value={asignatureId}
          onChange={(e) => setAsignatureId(e.target.value)}
          placeholder="Selecciona asignatura"
          sedeId={sedeId || idSede}
          workdayId={workdayId}
          autoLoad={true}
          customFetchMethod={getTeacherSubjects}
          additionalParams={teacherSubjectsParams}
          onJourneyDetected={(journey) => {
            if (journey?.id) {
              setWorkdayId(String(journey.id));
              setDetectedJourney(journey);
            }
          }}
          disabled={!gradeId}
        />

        <JourneySelect
          value={workdayId}
          onChange={(e) => setWorkdayId(e.target.value)}
          filterValue={sedeWorkday}
          subjectJourney={detectedJourney}
          useTeacherSubjects={!asignatureId && !!gradeId}
          sedeId={sedeId || idSede}
          idTeacher={idDocente}
          lockByAsignature={true}
        />

        <PeriodSelector
          label="Periodo"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          autoLoad={true}
        />
      </div>

      {/* ── Tabla de resultados ──────────────────────────────────────────── */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <Loader message="Cargando DBA..." size={96} />
        ) : (
          <DataTable data={tableData} columns={columns} fileName="Export_DBA" />
        )}
      </div>

      {/* ── Modal registrar DBA ──────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Registrar Derechos Básicos de Aprendizaje"
        size="4xl"
      >
        <RegisterDBA
          onClose={() => setIsAddOpen(false)}
          sedeId={sedeId}
          gradeId={gradeId}
          asignatureId={asignatureId}
          periodId={periodId}
        />
      </Modal>
    </div>
  );
};

export default ManageDBA;
