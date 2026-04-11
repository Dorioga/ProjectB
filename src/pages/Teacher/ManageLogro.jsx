import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Modal from "../../components/atoms/Modal";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProfileLogro from "../../components/molecules/ProfileLogro";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import useSchool from "../../lib/hooks/useSchool";
import Loader from "../../components/atoms/Loader";
import tourManageLogro from "../../tour/tourManageLogro";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageLogro = () => {
  const {
    getLogroInstitution,
    getAllLogros,
    getLogroType,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
    updateLogro,
  } = useTeacher();
  const { idInstitution, idSede, nameSede, idDocente, token, rol } = useAuth();
  const { institutionSedes, loadInstitutionSedes } = useData();
  const { getGradeSede } = useSchool();
  const notify = useNotify();

  // Refs estables para evitar bucles infinitos en useEffect
  const getAllLogrosRef = useRef(getAllLogros);
  useEffect(() => {
    getAllLogrosRef.current = getAllLogros;
  });
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLogro, setSelectedLogro] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Select states ---
  const [sedeSelected, setSedeSelected] = useState("");
  const [workdaySelected, setWorkdaySelected] = useState("");
  const [grade, setGrade] = useState("");
  const [asignature, setAsignature] = useState("");
  const [period, setPeriod] = useState("");
  const [tipoLogro, setTipoLogro] = useState("");

  // --- Tipo logro options ---
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  // --- Teacher sedes ---
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // --- Detected journey ---
  const [detectedJourney, setDetectedJourney] = useState(null);

  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected
        ? { idSede: Number(sedeSelected) }
        : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeSelected],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      grade && idDocente
        ? { idGrade: Number(grade), idTeacher: Number(idDocente) }
        : {},
    [grade, idDocente],
  );

  const sedeWorkday = useMemo(() => {
    if (!sedeSelected) return null;
    const candidates = Array.isArray(institutionSedes) ? institutionSedes : [];
    const teacherCandidates = Array.isArray(teacherSedes) ? teacherSedes : [];
    const combined = [...candidates, ...teacherCandidates];
    const sede = combined.find(
      (s) => String(s?.id ?? s?.id_sede) === String(sedeSelected),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeSelected, institutionSedes, teacherSedes]);

  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  // --- Load teacher sedes ---
  useEffect(() => {
    if (!isDocente) {
      setTeacherSedes([]);
      return;
    }
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
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
            fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
            fk_institucion:
              s?.fk_institucion ??
              s?.fkInstitution ??
              s?.id_institucion ??
              undefined,
          }));
        if (mounted) setTeacherSedes(mapped || []);
      } catch (err) {
        console.error("ManageLogro - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede, token]);

  // --- Load institution sedes for non-teachers ---
  useEffect(() => {
    if (isDocente) return;
    if (!idInstitution || typeof loadInstitutionSedes !== "function") return;
    loadInstitutionSedes(idInstitution).catch((err) =>
      console.warn("ManageLogro - loadInstitutionSedes failed:", err),
    );
  }, [isDocente, idInstitution, loadInstitutionSedes]);

  // --- Auto-select workday for teachers ---
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    if (isDocente) setWorkdaySelected(sedeWorkday);
  }, [sedeWorkday, isDocente]);

  // --- Load tipo logro ---
  useEffect(() => {
    let mounted = true;
    const loadTipos = async () => {
      setLoadingTipos(true);
      try {
        const res = await getLogroType();
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        if (mounted) setTipos(data);
      } catch (err) {
        console.error("ManageLogro - getLogroType error:", err);
        if (mounted) setTipos([]);
      } finally {
        if (mounted) setLoadingTipos(false);
      }
    };
    loadTipos();
    return () => {
      mounted = false;
    };
  }, [getLogroType]);

  // --- Derive fk_institucion ---
  const fkInstitucion = useMemo(() => {
    if (
      isDocente &&
      Array.isArray(teacherSedeData) &&
      teacherSedeData.length > 0
    ) {
      return teacherSedeData[0]?.fk_institucion ?? null;
    }
    return idInstitution ? Number(idInstitution) : null;
  }, [isDocente, teacherSedeData, idInstitution]);

  // --- Auto-fetch when all selects are filled ---
  useEffect(() => {
    if (!asignature || !grade || !period || !tipoLogro || !fkInstitucion)
      return;

    let mounted = true;
    const fetchLogros = async () => {
      setLoading(true);
      try {
        const payload = {
          fk_institucion: Number(fkInstitucion),
          fk_asignatura: Number(asignature),
          fk_grado: Number(grade),
          fk_periodo: Number(period),
          fk_tipo_logro: Number(tipoLogro),
        };
        const res = await getAllLogrosRef.current(payload);
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        if (mounted) {
          setResults(data);
          if (data.length === 0)
            notifyRef.current.info(
              "No se encontraron logros con los filtros seleccionados.",
            );
        }
      } catch (err) {
        console.error("ManageLogro - getAllLogros error:", err);
        if (mounted) {
          setResults([]);
          notifyRef.current.error(err?.message || "Error al consultar logros");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLogros();
    return () => {
      mounted = false;
    };
    // Se usan refs estables (getAllLogrosRef, notifyRef) para evitar bucles infinitos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asignature, grade, period, tipoLogro, fkInstitucion]);

  // --- ProfileLogro submit handler ---
  const handleSearch = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        const res = await getLogroInstitution(payload);
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setResults(data);
        setIsModalOpen(false);
        notify.success("Resultados cargados");
      } catch (err) {
        console.error("ManageLogro - error:", err);
        notify.error(err?.message || "Error al consultar logros");
      } finally {
        setLoading(false);
      }
    },
    [getLogroInstitution, notify],
  );

  const columns = [
    { accessorKey: "id_logro", header: "ID", meta: { hideOnLG: true } },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      meta: { hideOnLG: true },
    },
    { accessorKey: "nombre_asignatura", header: "Asignatura" },
    { accessorKey: "grado", header: "Grado", meta: { hideOnLG: true } },
    { accessorKey: "fk_periodo", header: "Periodo", meta: { hideOnLG: true } },
    { accessorKey: "nombre_tipo", header: "Tipo logro" },
    { accessorKey: "estado_logro", header: "Estado" },
    {
      accessorKey: "fecha_creacion",
      header: "Fecha creación",
      meta: { hideOnLG: true },
      accessorFn: (row) => {
        const d = row.fecha_creacion;
        if (!d) return "";
        return new Date(d).toLocaleDateString("es-CO");
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="w-full h-full flex items-stretch gap-2 p-2">
          <SimpleButton
            className="h-full"
            onClick={() => {
              setSelectedLogro(row.original);
              setIsEditOpen(true);
            }}
            icon="Pencil"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
            msjtooltip="Editar logro"
          />
        </div>
      ),
    },
  ];

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <div
        id="tour-ml-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className=" lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Logros</h2>
        </div>
        <div
          id="tour-ml-add-btn"
          className=" grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsModalOpen(true)}
            msj="Registrar logros"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
          <SimpleButton
            type="button"
            onClick={tourManageLogro}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      {/* Selectores en cascada */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
        {/* Sede siempre primero */}
        <div id="tour-ml-sede">
          <SedeSelect
            value={sedeSelected}
            onChange={(e) => {
              setSedeSelected(e.target.value);
              setGrade("");
              setAsignature("");
              setWorkdaySelected("");
              setDetectedJourney(null);
            }}
            data={teacherSedeData}
            loading={loadingTeacherSedes}
          />
        </div>

        {isDocente ? (
          <>
            {/* DOCENTE: Sede → Grado → Asignatura → Jornada */}
            <div id="tour-ml-grade">
              <GradeSelector
                label="Grado"
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setAsignature("");
                  setDetectedJourney(null);
                }}
                placeholder="Selecciona grado"
                sedeId={sedeSelected}
                workdayId={workdaySelected}
                autoLoad={true}
                customFetchMethod={getTeacherGrades}
                additionalParams={teacherGradesParams}
                disabled={!sedeSelected}
              />
            </div>
            <div id="tour-ml-asignature">
              <AsignatureSelector
                label="Asignatura"
                value={asignature}
                onChange={(e) => setAsignature(e.target.value)}
                placeholder="Selecciona asignatura"
                sedeId={sedeSelected || idSede}
                workdayId={workdaySelected}
                autoLoad={true}
                customFetchMethod={getTeacherSubjects}
                additionalParams={teacherSubjectsParams}
                onJourneyDetected={(journey) => {
                  if (journey?.id) {
                    setWorkdaySelected(String(journey.id));
                    setDetectedJourney(journey);
                  }
                }}
                disabled={!grade}
              />
            </div>
            <div id="tour-ml-jornada">
              <JourneySelect
                value={workdaySelected}
                onChange={(e) => setWorkdaySelected(e.target.value)}
                filterValue={sedeWorkday}
                subjectJourney={detectedJourney}
                useTeacherSubjects={!asignature && !!grade}
                sedeId={sedeSelected || idSede}
                idTeacher={idDocente}
                lockByAsignature={true}
              />
            </div>
          </>
        ) : (
          <>
            {/* NO DOCENTE: Sede → Jornada → Asignatura → Grado */}
            <div id="tour-ml-jornada">
              <JourneySelect
                value={workdaySelected}
                onChange={(e) => {
                  setWorkdaySelected(e.target.value);
                  setAsignature("");
                  setGrade("");
                }}
                filterValue={sedeWorkday}
                subjectJourney={detectedJourney}
                sedeId={sedeSelected || idSede}
                lockByAsignature={false}
                disabled={!sedeSelected}
              />
            </div>
            <div id="tour-ml-asignature">
              <AsignatureSelector
                label="Asignatura"
                value={asignature}
                onChange={(e) => {
                  setAsignature(e.target.value);
                  setGrade("");
                }}
                placeholder="Selecciona asignatura"
                sedeId={sedeSelected || idSede}
                workdayId={workdaySelected}
                autoLoad={true}
                customFetchMethod={undefined}
                additionalParams={{}}
                disabled={!workdaySelected}
              />
            </div>
            <div id="tour-ml-grade">
              <GradeSelector
                label="Grado"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Selecciona grado"
                sedeId={sedeSelected}
                workdayId={workdaySelected}
                autoLoad={true}
                disabled={!asignature}
              />
            </div>
          </>
        )}

        <div id="tour-ml-period">
          <PeriodSelector
            label="Periodo"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            autoLoad={true}
          />
        </div>

        <div id="tour-ml-type">
          <label className="">Tipo de logro</label>
          <select
            className="w-full p-2 border rounded bg-surface"
            value={tipoLogro}
            onChange={(e) => setTipoLogro(e.target.value)}
            disabled={loadingTipos}
          >
            <option value="">
              {loadingTipos ? "Cargando..." : "Seleccione tipo"}
            </option>
            {Array.isArray(tipos) &&
              tipos.map((t) => (
                <option
                  key={t.id_type_logro ?? t.id}
                  value={t.id_type_logro ?? t.id}
                >
                  {t.nombre_tipo_logro || t.nombre || t.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* DataTable con resultados */}
      <div id="tour-ml-table" className="flex-1 mt-4">
        {loading ? (
          <Loader message="Cargando resultados..." size={96} />
        ) : (
          <DataTable
            data={results || []}
            columns={columns}
            fileName="Export_Logros"
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar logros"
        size="7xl"
      >
        <ProfileLogro
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSearch}
        />
      </Modal>

      {/* Modal editar logro (abre ProfileLogro con datos de la fila) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedLogro(null);
        }}
        title="Editar logro"
        size="7xl"
      >
        <ProfileLogro
          initialValues={selectedLogro}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedLogro(null);
          }}
          onSave={async (logroId, institucionFk, payload) => {
            try {
              setLoading(true);
              const res = await updateLogro(logroId, institucionFk, payload);
              const updated = Array.isArray(res) ? res : (res?.data ?? res);

              // Si los filtros actuales están completos, refrescar la consulta completa
              if (asignature && grade && period && tipoLogro && fkInstitucion) {
                try {
                  const p = {
                    fk_institucion: Number(fkInstitucion),
                    fk_asignatura: Number(asignature),
                    fk_grado: Number(grade),
                    fk_periodo: Number(period),
                    fk_tipo_logro: Number(tipoLogro),
                  };
                  const list = await getAllLogrosRef.current(p);
                  const data = Array.isArray(list)
                    ? list
                    : (list?.data ?? list);
                  setResults(data);
                } catch (err) {
                  console.warn(
                    "ManageLogro - refresh after update failed:",
                    err,
                  );
                }
              } else {
                // Reemplazar la fila editada en `results` si existe
                setResults((prev) =>
                  (prev || []).map((r) =>
                    Number(r?.id_logro) === Number(logroId) ? updated || r : r,
                  ),
                );
              }

              notify.success("Logro actualizado");
              setIsEditOpen(false);
              setSelectedLogro(null);
            } catch (err) {
              console.error("ManageLogro - updateLogro error:", err);
              notify.error(err?.message || "Error al actualizar logro");
              throw err;
            } finally {
              setLoading(false);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default ManageLogro;
