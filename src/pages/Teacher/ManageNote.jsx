import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterRecords from "../GradeRecords/RegisterRecords";
import RegisterStudentRecords from "../School/RegisterStudentRecords";
import ProfileNote from "../../components/molecules/ProfileNote";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import tourManageNote from "../../tour/tourManageNote";

const ManageNote = () => {
  const {
    getNotesTeacher,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
  } = useTeacher();
  const { idSede, nameSede, idDocente, token } = useAuth();
  const notify = useNotify();

  // Refs estables para evitar bucles infinitos en useEffect
  const getNotesTeacherRef = useRef(getNotesTeacher);
  useEffect(() => {
    getNotesTeacherRef.current = getNotesTeacher;
  });
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
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Params para GradeSelector
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
        console.error("ManageNote - Error cargando sedes de docente:", err);
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

  // ── Fetch de notas (reutilizable) ───────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!gradeId || !asignatureId || !periodId) return;

    const fk_docente = idDocente ? Number(idDocente) : undefined;
    setIsLoading(true);

    try {
      const payload = {
        ...(fk_docente !== undefined && { fk_docente }),
        fk_grade: Number(gradeId),
        fk_periodo: Number(periodId),
        fk_asignatura: Number(asignatureId),
      };
      console.log("ManageNote - payload:", payload);
      const res = await getNotesTeacherRef.current(payload);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setTableData(data);
      if (data.length === 0)
        notifyRef.current.info(
          "No se encontraron notas con los filtros seleccionados.",
        );
    } catch (err) {
      console.error("ManageNote - fetchNotes error:", err);
      setTableData([]);
      notifyRef.current.error(err?.message || "Error al consultar notas");
    } finally {
      setIsLoading(false);
    }
  }, [gradeId, asignatureId, periodId, idDocente]);

  // Invocación automática cuando cambian los filtros necesarios
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Limpiar tabla cuando cambien los selectores padres ───────────────────
  useEffect(() => {
    setTableData([]);
  }, [sedeId, workdayId]);

  // ── Columnas de la tabla ─────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      { accessorKey: "id_nota", header: "ID", meta: { hideOnLG: true } },
      { accessorKey: "nombre_nota", header: "Nombre" },
      { accessorKey: "porcentaje", header: "Porcentaje (%)" },
      { accessorKey: "logro", header: "Logro", meta: { hideOnLG: true } },
      { accessorKey: "estado", header: "Estado", meta: { hideOnLG: true } },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div
        id="tour-mn-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5  justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className=" lg:col-span-2 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Notas</h2>
        </div>
        <div className=" grid grid-cols-3 col-span-3  gap-2">
          <div id="tour-mn-add-btn">
            <SimpleButton
              type="button"
              onClick={() => setIsAddOpen(true)}
              msj="Registrar nota"
              icon="Plus"
              bg="bg-secondary"
              text="text-surface"
            />
          </div>
          <div id="tour-mn-assign-btn">
            <SimpleButton
              type="button"
              onClick={() => setIsAssignOpen(true)}
              msj="Asignar notas"
              icon="ClipboardList"
              bg="bg-secondary"
              text="text-surface"
            />
          </div>
          <div>
            <SimpleButton
              type="button"
              onClick={tourManageNote}
              icon="HelpCircle"
              msjtooltip="Iniciar tutorial"
              noRounded={false}
              bg="bg-info"
              text="text-surface"
              className="w-auto px-3 py-1.5"
            />
          </div>
        </div>
      </div>

      {/* ── Selectores en cascada ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
        {/* Sede siempre primero */}
        <div id="tour-mn-sede">
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
        </div>

        {/* Sede → Grado → Asignatura → Jornada */}
        <div id="tour-mn-grade">
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
        </div>
        <div id="tour-mn-asignature">
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
        </div>
        <div id="tour-mn-jornada">
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
        </div>

        <div id="tour-mn-period">
          <PeriodSelector
            label="Periodo"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            autoLoad={true}
          />
        </div>
      </div>

      {/* ── Tabla de resultados ──────────────────────────────────────────── */}
      <div id="tour-mn-table" className="flex-1 mt-4">
        {" "}
        {tableData.length > 0 && !isLoading && (
          <div className="flex justify-end mb-2">
            <div id="tour-mn-edit-btn" className="w-40">
              <SimpleButton
                type="button"
                onClick={() => setIsEditOpen(true)}
                msj="Editar notas"
                icon="Pencil"
                bg="bg-secondary"
                text="text-surface"
              />
            </div>
          </div>
        )}{" "}
        {isLoading ? (
          <Loader message="Cargando notas..." size={96} />
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            fileName="Export_Notas"
          />
        )}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Registrar nota"
        size="7xl"
      >
        <RegisterRecords onClose={() => setIsAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Asignar notas"
        size="7xl"
      >
        <RegisterStudentRecords onClose={() => setIsAssignOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          fetchNotes(); // refresh after closing
        }}
        title="Editar notas"
        size="7xl"
      >
        <ProfileNote
          sedeId={sedeId}
          gradeId={gradeId}
          asignatureId={asignatureId}
          workdayId={workdayId}
          periodId={periodId}
          initialNotes={tableData}
          onClose={() => {
            setIsEditOpen(false);
            fetchNotes();
          }}
        />
      </Modal>
    </div>
  );
};

export default ManageNote;
