import { useEffect, useMemo, useState, useRef } from "react";
import AsignatureSelector from "../molecules/AsignatureSelector";
import GradeSelector from "../atoms/GradeSelector";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import SimpleButton from "../atoms/SimpleButton";
import tourProfileLogro from "../../tour/tourProfileLogro";
import { useNotify } from "../../lib/hooks/useNotify";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import useSchool from "../../lib/hooks/useSchool";

const ProfileLogro = ({ onSubmit, onClose, initialValues, onSave, initialSede, initialWorkday, initialGrade, initialAsignature, initialTipoLogro }) => {
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

  const [tipoLogro, setTipoLogro] = useState("");
  const [estadoLogro, setEstadoLogro] = useState("Activo");

  const notify = useNotify();

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const idCounter = useRef(0);
  const [periodRows, setPeriodRows] = useState({});
  const [registeringAll, setRegisteringAll] = useState(false);

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
        ? {
            idGrade: Number(grade),
            idTeacher: Number(idDocente),
            ...(workdaySelected ? { idWorkday: Number(workdaySelected) } : {}),
          }
        : {},
    [grade, idDocente, workdaySelected],
  );

  const { periods } = useSchool();
  const periodOptions = useMemo(() => {
    return (Array.isArray(periods) ? periods : [])
      .filter(Boolean)
      .map((p) => ({
        id: String(p?.id_periodo ?? p?.id ?? "").trim(),
        name: String(p?.nombre_periodo ?? p?.nombre ?? p?.name ?? "").trim(),
      }))
      .filter((p) => p.id);
  }, [periods]);

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

      // Sede: preferir initialSede del padre, fallback a campos del objeto
      setSedeSelected(String(initialSede ?? iv.fk_sede ?? iv.id_sede ?? iv.idSede ?? ""));

      // Grado: preferir initialGrade del padre
      setGrade(String(initialGrade ?? iv.fk_grado ?? iv.id_grado ?? iv.idGrade ?? ""));

      // Asignatura: preferir initialAsignature del padre
      setAsignature(String(initialAsignature ?? iv.fk_asignatura ?? iv.id_asignatura ?? iv.idAsignatura ?? ""));

      // Jornada: usar initialWorkday del padre
      if (initialWorkday) setWorkdaySelected(String(initialWorkday));

      // Tipo logro: preferir initialTipoLogro del padre
      setTipoLogro(String(initialTipoLogro ?? iv.fk_tipo_logro ?? iv.fkTipoLogro ?? ""));

      // Estado del logro
      setEstadoLogro(iv.estado_logro ?? iv.estado ?? "Activo");

      // Descripción
      const desc = iv.descripcion || "";
      if (desc) {
        setPeriodRows({ edit: [{ rowId: 0, text: desc }] });
      }
    } catch (err) {
      // ignore malformed initialValues
      console.warn("ProfileLogro - invalid initialValues:", err);
    }
  }, [initialValues, initialSede, initialWorkday, initialGrade, initialAsignature, initialTipoLogro]);

  const handleSearch = async (desc, periodId) => {
    if (!desc || !desc.trim()) {
      notify.error("La descripción es obligatoria.");
      return;
    }

    const teacherFkInstitution =
      isDocente && Array.isArray(teacherSedeData) && teacherSedes.length > 0
        ? (teacherSedeData[0]?.fk_institucion ?? null)
        : null;

    if (initialValues && typeof onSave === "function") {
      console.log(
        "ProfileLogro - modo edición, payload a enviar:",
        initialValues,
      );

      try {
        const logroId =
          initialValues.id_logro ?? initialValues.id ?? initialValues.idLogro;
        const institucionFk =
          initialValues.fk_institucion ??
          initialValues.fk_institute ??
          idInstitution;

        const updatePayload = {
          descripcion: desc.trim(),
          estado: estadoLogro,
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

    const payload = {
      fk_asignatura: asignature ? Number(asignature) : null,
      fk_grado: grade ? Number(grade) : null,
      fk_periodo: periodId ? Number(periodId) : null,
      descripcion: desc.trim(),
      fk_tipo_logro: tipoLogro ? Number(tipoLogro) : null,
      fk_institucion: teacherFkInstitution
        ? Number(teacherFkInstitution)
        : idInstitution
          ? Number(idInstitution)
          : null,
    };

    if (onSubmit) return await onSubmit(payload);
  };

  const addRow = (periodId) => {
    const rowId = idCounter.current++;
    setPeriodRows((prev) => ({
      ...prev,
      [periodId]: [...(prev[periodId] || []), { rowId, text: "" }],
    }));
  };

  const removeRow = (periodId, rowId) => {
    setPeriodRows((prev) => ({
      ...prev,
      [periodId]: (prev[periodId] || []).filter((r) => r.rowId !== rowId),
    }));
  };

  const updateRowText = (periodId, rowId, text) => {
    setPeriodRows((prev) => ({
      ...prev,
      [periodId]: (prev[periodId] || []).map((r) =>
        r.rowId === rowId ? { ...r, text } : r,
      ),
    }));
  };

  const handleRegister = (periodId, rowId) => {
    const row = (periodRows[periodId] || []).find((r) => r.rowId === rowId);
    const text = (row?.text || "").trim();
    if (!text) {
      notify.error("La descripción es obligatoria.");
      return;
    }
    handleSearch(text, periodId);
  };

  const handleRegisterAll = async () => {
    setRegisteringAll(true);
    let count = 0;
    for (const [periodId, rows] of Object.entries(periodRows)) {
      for (const row of rows) {
        const text = (row.text || "").trim();
        if (!text) continue;
        try {
          await handleSearch(text, periodId);
          count++;
        } catch {
          // error ya manejado por handleSearch/onSubmit
        }
      }
    }
    setRegisteringAll(false);
    if (count > 0) {
      notify.success(`Registro completado: ${count} logro(s) registrado(s).`);
    } else {
      notify.info("No hay descripciones pendientes por registrar.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <SimpleButton
          type="button"
          onClick={tourProfileLogro}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Sede siempre primero */}
        <div id="tour-pl-sede">
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

        {/* Orden condicional según rol */}
        {isDocente ? (
          <>
            {/* DOCENTE: Sede → Grado → Asignatura → Jornada */}
            <div id="tour-pl-grade">
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
            <div id="tour-pl-asignature">
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
            <div id="tour-pl-workday">
              <JourneySelect
                value={workdaySelected}
                onChange={(e) => {
                  setWorkdaySelected(e.target.value);
                  setAsignature("");
                  setDetectedJourney(null);
                }}
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
            <div id="tour-pl-workday">
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
            <div id="tour-pl-asignature">
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
            <div id="tour-pl-grade">
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

        <div id="tour-pl-type">
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

        {initialValues && (
          <div id="tour-pl-estado">
            <label className="">Estado del logro</label>
            <select
              className="w-full p-2 border rounded bg-surface"
              value={estadoLogro}
              onChange={(e) => setEstadoLogro(e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        )}
      </div>
      {!initialValues && (
        <div className="grid grid-cols-5 gap-4">
          <p className="col-span-4"></p>
          <SimpleButton
            msj={registeringAll ? "Registrando..." : "Registrar todas"}
            bg="bg-secondary"
            text="text-surface"
            icon="Save"
            disabled={registeringAll}
            onClick={handleRegisterAll}
          />
        </div>
      )}
      {initialValues ? (
        <div id="tour-pl-description">
          <label className="block text-sm font-medium mb-1">
            Descripción <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full p-2 border rounded bg-surface"
            value={periodRows["edit"]?.[0]?.text || ""}
            onChange={(e) =>
              setPeriodRows((prev) => ({
                ...prev,
                edit: [{ rowId: 0, text: e.target.value }],
              }))
            }
            placeholder="Descripción del logro"
          />
        </div>
      ) : (
        <div id="tour-pl-periods" className="space-y-4">
          {periodOptions.map((p) => {
            const periodId = p.id;
            const rows = periodRows[periodId] || [];
            return (
              <div key={periodId} className="border rounded-lg p-4 bg-surface">
                <div className="grid grid-cols-5 items-center gap-2 py-2">
                  <h4 className=" col-span-4 font-semibold text-sm mb-2">
                    {p.name}
                  </h4>
                  <SimpleButton
                    msj="Agregar descripción"
                    icon="Plus"
                    bg="bg-primary"
                    text="text-surface"
                    onClick={() => addRow(periodId)}
                  />
                </div>
                {rows.map((row) => (
                  <div
                    key={row.rowId}
                    className="grid grid-cols-5 items-center gap-2 py-2"
                  >
                    <input
                      className="col-span-4 p-2 border rounded bg-surface text-sm"
                      value={row.text}
                      onChange={(e) =>
                        updateRowText(periodId, row.rowId, e.target.value)
                      }
                      placeholder="Escribe la descripción"
                    />
                    <SimpleButton
                      icon="Trash2"
                      bg="bg-red-500"
                      text="text-white"
                      onClick={() => removeRow(periodId, row.rowId)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div id="tour-pl-submit" className="flex gap-2 justify-end">
        <SimpleButton
          msj="Cancelar"
          onClick={onClose}
          bg="bg-gray-200"
          text="text-gray-700"
        />

        {initialValues && (
          <SimpleButton
            msj="Guardar cambios"
            bg="bg-secondary"
            text="text-surface"
            onClick={() => {
              const text = (periodRows["edit"]?.[0]?.text || "").trim();
              if (text) handleSearch(text, "");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileLogro;
