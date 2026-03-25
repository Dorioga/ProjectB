import { useEffect, useMemo, useState } from "react";
import AsignatureSelector from "../molecules/AsignatureSelector";
import GradeSelector from "../atoms/GradeSelector";
import PeriodSelector from "../atoms/PeriodSelector";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import SimpleButton from "../atoms/SimpleButton";
import { useNotify } from "../../lib/hooks/useNotify";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import useSchool from "../../lib/hooks/useSchool";

const ProfileLogro = ({ onSubmit, onClose, initialValues, onSave }) => {
  const { idInstitution, idSede, nameSede, idDocente, token, rol } = useAuth();
  const { institutionSedes, loadInstitutionSedes } = useData();
  const {
    getLogroType,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
    getTeacherSedes,
  } = useTeacher();
  const { getGradeSede } = useSchool();

  // Si se pasó initialValues, inicializar campos con los valores de la fila (modo edición)

  // Select states (replicando la lógica de RegisterStudentRecords)
  const [sedeSelected, setSedeSelected] = useState("");
  const [workdaySelected, setWorkdaySelected] = useState("");
  const [grade, setGrade] = useState("");
  const [asignature, setAsignature] = useState("");
  const [period, setPeriod] = useState("");

  const [tipoLogro, setTipoLogro] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const notify = useNotify();

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const descripcionIsValid = String(descripcion || "").trim().length > 0;

  // Teacher sedes (mismo comportamiento que en RegisterStudentRecords)
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // Detectar jornada proveniente de la asignatura (igual que en RegisterStudentRecords)
  const [detectedJourney, setDetectedJourney] = useState(null);

  // Memoizar la verificación de docente para evitar recalcular en cada render
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

  // Local caches para cargar y auto-seleccionar opciones en cascada (principalmente para docentes)

  const [prefetchTeacherGrades, setPrefetchTeacherGrades] = useState([]);
  const [prefetchTeacherAsignatures, setPrefetchTeacherAsignatures] = useState(
    [],
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

  // Datos de la sede del docente: preferir resultado de getTeacherSede si existe
  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) {
      return [{ id: idSede, name: nameSede }];
    }
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  useEffect(() => {
    // Solo cargar sedes del docente si el usuario es docente
    if (!isDocente) {
      setTeacherSedes([]);
      return;
    }

    let mounted = true;

    if (!window.__inflightTeacherSedeRequests)
      window.__inflightTeacherSedeRequests = new Map();
    const inflight = window.__inflightTeacherSedeRequests;

    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }

      const key = String(idDocente);
      if (inflight.has(key)) {
        try {
          if (mounted) setLoadingTeacherSedes(true);
          const mapped = await inflight.get(key);
          if (mounted) setTeacherSedes(mapped || []);
          return;
        } catch (err) {
          console.warn("ProfileLogro - petición teacherSedes falló:", err);
          if (mounted) setTeacherSedes([]);
          return;
        } finally {
          if (mounted) setLoadingTeacherSedes(false);
        }
      }

      if (mounted) setLoadingTeacherSedes(true);
      const prom = (async () => {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
            fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
            // incluir fk_institucion si viene en la respuesta del servicio
            fk_institucion:
              s?.fk_institucion ??
              s?.fkInstitution ??
              s?.id_institucion ??
              s?.fk_institute ??
              undefined,
          }));
        return mapped;
      })();

      inflight.set(key, prom);
      try {
        const mapped = await prom;
        if (mounted) setTeacherSedes(mapped || []);
        // no auto-seleccionar la sede aunque el docente tenga solo 1 sede
        // el usuario debe elegir explícitamente la sede (sedeSelected queda vacía por defecto)
      } catch (err) {
        console.error("ProfileLogro - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        inflight.delete(key);
        if (mounted) setLoadingTeacherSedes(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede, token, sedeSelected]);

  // Si el usuario NO es docente, cargar sedes de la institución usando idInstitution
  useEffect(() => {
    if (isDocente) return;
    if (!idInstitution || typeof loadInstitutionSedes !== "function") return;

    let mounted = true;
    const load = async () => {
      try {
        await loadInstitutionSedes(idInstitution);
      } catch (err) {
        console.warn("ProfileLogro - loadInstitutionSedes failed:", err);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idInstitution, loadInstitutionSedes]);

  // --- Prefetch/load en cascada cuando es docente ---
  useEffect(() => {
    // Solo para docentes y cuando la sede seleccionada sea distinta al valor por defecto
    if (!isDocente || !sedeSelected || String(sedeSelected) === String(idSede))
      return;
    let mounted = true;

    const loadGrades = async () => {
      try {
        if (!idDocente) return;
        const res = await getTeacherGrades(teacherGradesParams);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;
        setPrefetchTeacherGrades(list || []);

        // auto-seleccionar si solo hay una opción y todavía no hay selección
        if (
          (!grade || String(grade).trim() === "") &&
          (list || []).length === 1
        ) {
          const only = list[0];
          const id = String(
            only?.id_grade ?? only?.id ?? only?.id_grado ?? "",
          ).trim();
          if (id) setGrade(id);
        }
      } catch (err) {
        console.warn("ProfileLogro - prefetch teacher grades failed:", err);
        setPrefetchTeacherGrades([]);
      }
    };

    loadGrades();

    return () => {
      mounted = false;
    };
  }, [
    isDocente,
    idDocente,
    sedeSelected,
    idSede,
    teacherGradesParams,
    grade,
    getTeacherGrades,
  ]);

  useEffect(() => {
    if (!isDocente) return;
    if (!grade) {
      setPrefetchTeacherAsignatures([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const res = await getTeacherSubjects(teacherSubjectsParams);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;
        setPrefetchTeacherAsignatures(list || []);

        // auto-seleccionar si solo hay una asignatura
        if (
          (!asignature || String(asignature).trim() === "") &&
          (list || []).length === 1
        ) {
          const only = list[0];
          const id = String((only?.id_asignatura ?? only?.id) || "").trim();
          if (id) {
            setAsignature(id);
            // si la asignatura trae jornada, aplicarla
            const jornadaId =
              only?.id_jornada ?? only?.fk_jornada ?? only?.id_workday;
            if (jornadaId) {
              setDetectedJourney({
                id: String(jornadaId),
                name: only?.nombre_jornada || only?.nombre || "",
              });
              setWorkdaySelected(String(jornadaId));
            }
          }
        }
      } catch (err) {
        console.warn(
          "ProfileLogro - prefetch teacher asignatures failed:",
          err,
        );
        setPrefetchTeacherAsignatures([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, grade, teacherSubjectsParams, asignature, getTeacherSubjects]);

  // Auto-seleccionar jornada basada en fk_workday de la sede (solo para docentes)
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    // Solo auto-seleccionar para docentes; para no-docentes se selecciona manualmente
    if (isDocente) {
      setWorkdaySelected(sedeWorkday);
    }
  }, [sedeWorkday, isDocente]);

  useEffect(() => {
    let mounted = true;
    const loadTipos = async () => {
      setLoadingTipos(true);
      try {
        const res = await getLogroType();
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;
        setTipos(data);
      } catch (err) {
        console.error("ProfileLogro - getLogroType error:", err);
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    };
    loadTipos();
    return () => {
      mounted = false;
    };
  }, [getLogroType]);

  // Si vienen valores iniciales (editar), poblar los campos del formulario
  useEffect(() => {
    if (!initialValues) return;
    try {
      const iv = initialValues || {};
      if (iv.fk_sede || iv.id_sede || iv.idSede) {
        setSedeSelected(String(iv.fk_sede ?? iv.id_sede ?? iv.idSede ?? ""));
      }
      if (iv.fk_grado || iv.id_grado || iv.idGrade) {
        setGrade(String(iv.fk_grado ?? iv.id_grado ?? iv.idGrade ?? ""));
      }
      if (iv.fk_asignatura || iv.id_asignatura || iv.idAsignatura) {
        setAsignature(
          String(iv.fk_asignatura ?? iv.id_asignatura ?? iv.idAsignatura ?? ""),
        );
      }
      if (iv.fk_periodo || iv.id_periodo || iv.periodo) {
        setPeriod(String(iv.fk_periodo ?? iv.id_periodo ?? iv.periodo ?? ""));
      }
      if (iv.fk_tipo_logro || iv.fkTipoLogro) {
        setTipoLogro(String(iv.fk_tipo_logro ?? iv.fkTipoLogro ?? ""));
      }
      if (iv.descripcion) setDescripcion(String(iv.descripcion));
    } catch (err) {
      // ignore malformed initialValues
      console.warn("ProfileLogro - invalid initialValues:", err);
    }
  }, [initialValues]);

  const handleSearch = async () => {
    if (!descripcionIsValid) {
      notify.error("La descripción es obligatoria.");
      return;
    }

    const teacherFkInstitution =
      isDocente && Array.isArray(teacherSedeData) && teacherSedes.length > 0
        ? (teacherSedeData[0]?.fk_institucion ?? null)
        : null;

    const payload = {
      fk_asignatura: asignature ? Number(asignature) : null,
      fk_grado: grade ? Number(grade) : null,
      fk_periodo: period ? Number(period) : null,
      descripcion: descripcion.trim(),
      fk_tipo_logro: tipoLogro ? Number(tipoLogro) : null,
      // si es docente, preferir fk_institucion desde las sedes del docente
      fk_institucion: teacherFkInstitution
        ? Number(teacherFkInstitution)
        : idInstitution
          ? Number(idInstitution)
          : null,
    };

    // Si estamos en modo edición (initialValues) y nos pasaron onSave, llamar a onSave
    if (initialValues && typeof onSave === "function") {
      try {
        const logroId =
          initialValues.id_logro ?? initialValues.id ?? initialValues.idLogro;
        const institucionFk =
          initialValues.fk_institucion ??
          initialValues.fk_institute ??
          idInstitution;

        // payload para update: { descripcion, estado, fk_tipo_logro }
        const updatePayload = {
          descripcion: descripcion.trim(),
          estado:
            initialValues.estado_logro ?? initialValues.estado ?? "Activo",
          fk_tipo_logro: tipoLogro ? Number(tipoLogro) : null,
        };

        await onSave(logroId, institucionFk, updatePayload);
        if (onClose) onClose();
      } catch (err) {
        notify.error(err?.message || "Error al actualizar logro");
        throw err;
      }
      return;
    }

    if (onSubmit) await onSubmit(payload);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Sede siempre primero */}
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

        {/* Orden condicional según rol */}
        {isDocente ? (
          <>
            {/* DOCENTE: Sede → Grado → Asignatura → Jornada */}
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
          </>
        ) : (
          <>
            {/* NO DOCENTE: Sede → Jornada → Asignatura → Grado */}
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
          </>
        )}

        <PeriodSelector
          label="Periodo"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          autoLoad={true}
        />

        <div>
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

      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción <span className="text-red-600">*</span>
        </label>
        <input
          className="w-full p-2 border rounded bg-surface"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Texto para filtrar descripción"
        />
        {!descripcionIsValid && (
          <p className="text-sm text-red-600 mt-1">
            La descripción es obligatoria.
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <SimpleButton
          msj="Cancelar"
          onClick={onClose}
          bg="bg-gray-200"
          text="text-gray-700"
        />
        <SimpleButton
          msj={initialValues ? "Guardar cambios" : "Agregar logros"}
          onClick={handleSearch}
          bg="bg-secondary"
          text="text-surface"
          disabled={!descripcionIsValid}
        />
      </div>
    </div>
  );
};

export default ProfileLogro;
