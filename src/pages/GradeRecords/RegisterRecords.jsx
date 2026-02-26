import { useCallback, useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
import tourRegisterRecords from "../../tour/tourRegisterRecords";

// Función auxiliar para redondeo consistente
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const RegisterRecords = () => {
  const { createNote, loading: loadingSchool } = useSchool();
  const { getTeacherGrades, getTeacherSubjects, getTeacherSede } = useTeacher();
  const { institutionSedes } = useData();
  const { idSede, nameSede, rol, idDocente, token } = useAuth();

  // Detectar si el usuario es docente
  const isTeacher = Boolean(idDocente);

  const [sedeSelected, setSedeSelected] = useState("");
  const [workdaySelected, setWorkdaySelected] = useState("");
  const [gradeSelected, setGradeSelected] = useState("");
  const [asignatureSelected, setAsignatureSelected] = useState("");
  const [numberRecords, setNumberRecords] = useState(0);
  const [auxRecords, setAuxRecords] = useState([]);
  const [isTest, setIsTest] = useState(false);
  const [periodSelected, setPeriodSelected] = useState("");
  const [porcentualTotal, setPorcentualTotal] = useState(100);
  const [finalTest, setFinalTest] = useState({
    record: 0,
    porcentual: 20,
    goal: "",
  });

  // SedEs del docente (obtenidas vía getTeacherSede)
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [detectedJourney, setDetectedJourney] = useState(null);

  // Memoizar additionalParams para evitar re-renders
  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected && { idSede: Number(sedeSelected) }),
    }),
    [idDocente, sedeSelected],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      gradeSelected && idDocente
        ? { idGrade: Number(gradeSelected), idTeacher: Number(idDocente) }
        : {},
    [gradeSelected, idDocente],
  );

  // Obtener el fk_workday de la sede seleccionada (buscar tanto en institutionSedes como en teacherSedes)
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
    if (teacherSedes.length) return teacherSedes;
    // aceptar tanto rol numérico '7' como la cadena 'docente'
    if (
      (String(rol).toLowerCase() === "docente" || String(rol) === "7") &&
      idSede &&
      nameSede
    ) {
      return [{ id: idSede, name: nameSede }];
    }
    return null;
  }, [rol, idSede, nameSede, teacherSedes]);

  // Si existe idDocente, cargar sedes desde el servicio y mapear a {id, name}
  // Mejoras: esperar a que haya token y evitar llamadas duplicadas (deduplicación por idDocente)
  useEffect(() => {
    let mounted = true;

    // Usar cache temporal a nivel global para evitar duplicados entre mounts en StrictMode
    if (!window.__inflightTeacherSedeRequests)
      window.__inflightTeacherSedeRequests = new Map();
    const inflight = window.__inflightTeacherSedeRequests;

    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        // Si no hay idDocente o token aún, limpiar y salir
        if (mounted) setTeacherSedes([]);
        return;
      }

      const key = String(idDocente);

      // Si ya hay una petición en curso para este docente, reutilizarla
      if (inflight.has(key)) {
        try {
          if (mounted) setLoadingTeacherSedes(true);
          const mapped = await inflight.get(key);
          if (mounted) setTeacherSedes(mapped || []);
          return;
        } catch (err) {
          console.warn("RegisterRecords - petición ya en curso falló:", err);
          if (mounted) setTeacherSedes([]);
          return;
        } finally {
          if (mounted) setLoadingTeacherSedes(false);
        }
      }

      if (mounted) setLoadingTeacherSedes(true);

      const prom = (async () => {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        // Respuesta esperada: array de objetos o { code, data: [...] }
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
            fk_workday: s?.fk_workday ?? s?.fkWorkday ?? undefined,
          }));
        return mapped;
      })();

      inflight.set(key, prom);

      try {
        const mapped = await prom;
        if (mounted) setTeacherSedes(mapped || []);

        // Si solo hay una sede, autoseleccionar si no hay selección
        if (mounted && mapped.length === 1 && !sedeSelected) {
          setSedeSelected(mapped[0].id);
        }
      } catch (err) {
        console.error(
          "RegisterRecords - Error cargando sedes de docente:",
          err,
        );
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
  }, [idDocente, getTeacherSede, token]);

  // Handlers de cascada: limpian los selectores hijos al cambiar el padre.
  // Se ejecutan inline (no en useEffect) para evitar un render intermedio
  // con valores obsoletos que dispararía llamadas a la API con parámetros inválidos.
  const handleSedeChange = (e) => {
    const val = e.target.value;
    setSedeSelected(val);
    setGradeSelected("");
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
    setNumberRecords(0);
    setAuxRecords([]);
  };

  // Para docentes: Sede -> Grado -> Asignatura -> Jornada
  const handleGradeChangeTeacher = (e) => {
    setGradeSelected(e.target.value);
    setAsignatureSelected("");
    setWorkdaySelected("");
    setDetectedJourney(null);
  };

  // Para no docentes: Sede -> Jornada -> Asignatura -> Grado
  const handleWorkdayChangeNonTeacher = (e) => {
    setWorkdaySelected(e.target.value);
    setAsignatureSelected("");
    setGradeSelected("");
  };

  const handleAsignatureChangeNonTeacher = (e) => {
    setAsignatureSelected(e.target.value);
    setGradeSelected("");
  };

  // Auto-seleccionar jornada basada en el fk_workday de la sede (solo docentes)
  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    if (isTeacher) {
      setWorkdaySelected(sedeWorkday);
    }
  }, [sedeWorkday, isTeacher]);

  useEffect(() => {
    if (isTest) {
      const examPct = Math.min(
        99,
        Math.max(1, Number(finalTest.porcentual) || 20),
      );
      setPorcentualTotal(100 - examPct);
    } else {
      setPorcentualTotal(100);
    }
  }, [isTest, finalTest.porcentual]);

  // Función auxiliar para calcular distribución de porcentajes
  const distributePercentages = useCallback((records, total) => {
    const lockedSum = records.reduce(
      (sum, r) => (r.locked ? sum + (Number(r.porcentual) || 0) : sum),
      0,
    );
    const unlockedCount = records.filter((r) => !r.locked).length;
    const remaining = Math.max(0, total - lockedSum);
    const perUnlocked = unlockedCount > 0 ? remaining / unlockedCount : 0;

    return records.map((r) => ({
      ...r,
      porcentual: round2(r.locked ? Number(r.porcentual) || 0 : perUnlocked),
    }));
  }, []);

  // Reconstruir el array de notas solo cuando cambia la cantidad de notas
  useEffect(() => {
    const safeNumber = Number(numberRecords);
    if (!safeNumber || safeNumber < 1) {
      setAuxRecords([]);
      return;
    }

    setAuxRecords((prev) => {
      const next = Array.from({ length: safeNumber }, (_, idx) => ({
        name: prev[idx]?.name ?? "",
        record: prev[idx]?.record ?? 0,
        porcentual: Number(prev[idx]?.porcentual) || 0,
        goal: prev[idx]?.goal ?? "",
        locked: Boolean(prev[idx]?.locked),
      }));

      return distributePercentages(next, porcentualTotal);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberRecords, distributePercentages]);

  // Redistribuir porcentuales cuando cambia el total (ej: se edita el examen final)
  useEffect(() => {
    setAuxRecords((prev) => {
      if (!prev.length) return prev;
      return distributePercentages(prev, porcentualTotal);
    });
  }, [porcentualTotal, distributePercentages]);

  const canSetNumberRecords =
    Boolean(sedeSelected) &&
    Boolean(asignatureSelected) &&
    Boolean(periodSelected);

  const canSubmit =
    Boolean(sedeSelected) &&
    Boolean(asignatureSelected) &&
    Boolean(periodSelected) &&
    Boolean(gradeSelected) &&
    Boolean(workdaySelected) &&
    auxRecords.length > 0 &&
    auxRecords.every(
      (r) => String(r.name ?? "").trim() !== "" && Number(r.porcentual) > 0,
    );

  const handleRecordChange = (index, field, value) => {
    setAuxRecords((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const current = list[index] ?? {
        name: "",
        record: 0,
        porcentual: "",
        goal: "",
        locked: false,
      };
      list[index] = {
        ...current,
        [field]: value,
      };
      return list;
    });
  };

  const togglePorcentualLock = useCallback(
    (index) => {
      setAuxRecords((prev) => {
        if (!prev.length) return prev;

        const list = prev.slice();
        list[index] = { ...list[index], locked: !list[index].locked };

        return distributePercentages(list, porcentualTotal);
      });
    },
    [porcentualTotal, distributePercentages],
  );

  const handlePorcentualChange = useCallback(
    (index, rawValue) => {
      setAuxRecords((prev) => {
        if (!prev.length) return prev;

        const list = prev.slice();
        const value = Math.max(0, Number(rawValue) || 0);

        // Calcular suma de otros valores bloqueados
        const lockedSumOther = list.reduce(
          (sum, r, idx) =>
            idx !== index && r.locked ? sum + (Number(r.porcentual) || 0) : sum,
          0,
        );

        // Limitar el valor al máximo permitido
        const maxAllowed = Math.max(0, porcentualTotal - lockedSumOther);
        const clamped = Math.min(maxAllowed, value);

        // Caso especial: solo una nota
        if (list.length === 1) {
          list[0] = { ...list[0], porcentual: round2(porcentualTotal) };
          return list;
        }

        // Actualizar el valor en el índice actual
        list[index] = { ...list[index], porcentual: clamped };

        // Distribuir el resto entre los no bloqueados
        const otherUnlocked = list.filter(
          (r, idx) => idx !== index && !r.locked,
        );
        const remaining = Math.max(
          0,
          porcentualTotal - lockedSumOther - clamped,
        );
        const perOther =
          otherUnlocked.length > 0 ? remaining / otherUnlocked.length : 0;

        return list.map((r, idx) => {
          if (idx === index) return { ...r, porcentual: round2(clamped) };
          if (r.locked)
            return { ...r, porcentual: round2(Number(r.porcentual) || 0) };
          return { ...r, porcentual: round2(perOther) };
        });
      });
    },
    [porcentualTotal],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const commonFields = {
      fk_asignature: Number(asignatureSelected),
      fk_docente: Number(idDocente),
      fk_period: Number(periodSelected),
      fk_grade: Number(gradeSelected),
    };

    const notes = auxRecords.map((rec) => ({
      name_note: rec.name || "",
      porcentage: String(rec.porcentual || 0),
      logro: rec.goal || "",
      ...commonFields,
    }));

    if (isTest) {
      notes.push({
        name_note: "Examen final",
        porcentage: "20",
        logro: finalTest.goal || "",
        ...commonFields,
      });
    }

    try {
      await createNote({ notes });
      // Limpiar formulario
      setSedeSelected("");
      setWorkdaySelected("");
      setGradeSelected("");
      setAsignatureSelected("");
      setPeriodSelected("");
      setNumberRecords(0);
      setAuxRecords([]);
      setIsTest(false);
      setFinalTest({ record: 0, porcentual: 20, goal: "" });
    } catch (error) {
      console.error("Error al registrar notas:", error);
    }
  };

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div className="grid grid-cols-5 items-center justify-between">
        <h2 className="col-span-4 text-2xl font-bold">Registrar Notas</h2>
        <SimpleButton
          type="button"
          onClick={tourRegisterRecords}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          id="tour-filters"
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <SedeSelect
            value={sedeSelected}
            onChange={handleSedeChange}
            className="w-full p-2 border rounded bg-surface"
            labelClassName="text-lg font-semibold"
            data={teacherSedeData}
            loading={loadingTeacherSedes}
          />

          {/* Orden para Docentes: Sede -> Grado -> Asignatura -> Jornada */}
          {isTeacher ? (
            <>
              <div id="tour-grade">
                <GradeSelector
                  name="grade"
                  label="Grado"
                  labelClassName="text-lg font-semibold"
                  value={gradeSelected}
                  onChange={handleGradeChangeTeacher}
                  className="w-full p-2 border rounded bg-surface"
                  sedeId={sedeSelected}
                  workdayId={workdaySelected}
                  customFetchMethod={getTeacherGrades}
                  additionalParams={teacherGradesParams}
                  disabled={!sedeSelected}
                />
              </div>
              <div id="tour-asignature">
                <AsignatureSelector
                  name="asignature"
                  label="Asignatura"
                  labelClassName="text-lg font-semibold"
                  value={asignatureSelected}
                  onChange={(e) => setAsignatureSelected(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                  sedeId={sedeSelected}
                  workdayId={workdaySelected}
                  customFetchMethod={getTeacherSubjects}
                  additionalParams={teacherSubjectsParams}
                  onJourneyDetected={(journey) => {
                    console.log(
                      "RegisterRecords - Jornada detectada de asignatura:",
                      journey,
                    );
                    if (journey && journey.id) {
                      setWorkdaySelected(String(journey.id));
                      setDetectedJourney(journey);
                    }
                  }}
                  disabled={!gradeSelected}
                />
              </div>
              <JourneySelect
                name="workday"
                label="Jornada"
                labelClassName="text-lg font-semibold"
                value={workdaySelected}
                onChange={(e) => setWorkdaySelected(e.target.value)}
                className="w-full p-2 border rounded bg-surface"
                filterValue={sedeWorkday}
                includeAmbas={false}
                subjectJourney={detectedJourney}
                useTeacherSubjects={
                  !Boolean(asignatureSelected) && Boolean(gradeSelected)
                }
                sedeId={sedeSelected}
                idTeacher={idDocente}
                lockByAsignature={true}
              />
            </>
          ) : (
            /* Orden para No Docentes: Sede -> Jornada -> Asignatura -> Grado */
            <>
              <JourneySelect
                name="workday"
                label="Jornada"
                labelClassName="text-lg font-semibold"
                value={workdaySelected}
                onChange={handleWorkdayChangeNonTeacher}
                className="w-full p-2 border rounded bg-surface"
                filterValue={sedeWorkday}
                includeAmbas={false}
                disabled={!sedeSelected}
              />
              <div id="tour-asignature">
                <AsignatureSelector
                  name="asignature"
                  label="Asignatura"
                  labelClassName="text-lg font-semibold"
                  value={asignatureSelected}
                  onChange={handleAsignatureChangeNonTeacher}
                  className="w-full p-2 border rounded bg-surface"
                  sedeId={sedeSelected}
                  workdayId={workdaySelected}
                  disabled={!workdaySelected}
                />
              </div>
              <div id="tour-grade">
                <GradeSelector
                  name="grade"
                  label="Grado"
                  labelClassName="text-lg font-semibold"
                  value={gradeSelected}
                  onChange={(e) => setGradeSelected(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                  sedeId={sedeSelected}
                  workdayId={workdaySelected}
                  disabled={!asignatureSelected}
                />
              </div>
            </>
          )}

          <PeriodSelector
            name="period"
            label="Período"
            labelClassName="text-lg font-semibold"
            value={periodSelected}
            onChange={(e) => setPeriodSelected(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
            autoLoad={true}
          />

          <div id="tour-num-records" className="col-span-2 ">
            <label className="text-lg font-semibold">
              ¿Cuántas notas deseas registrar?
            </label>
            <input
              type="number"
              min={1}
              className="w-full p-2 border rounded bg-surface"
              value={numberRecords || ""}
              onChange={(e) => setNumberRecords(Number(e.target.value))}
              disabled={!canSetNumberRecords}
            />
            {!canSetNumberRecords ? (
              <div className="text-xs opacity-70 mt-1">
                Selecciona sede, asignatura y periodo para habilitar este campo.
              </div>
            ) : null}
          </div>
        </div>

        <div id="tour-final-test" className="flex items-center gap-2">
          <input
            id="useFinalTest"
            type="checkbox"
            checked={isTest}
            onChange={(e) => setIsTest(e.target.checked)}
          />
          <label htmlFor="useFinalTest" className="text-lg font-semibold">
            Usar examen final como 20%
          </label>
        </div>

        <div className="text-sm opacity-80">
          Porcentual total para notas: {porcentualTotal}%
        </div>

        {Array.isArray(auxRecords) && auxRecords.length > 0 ? (
          <div id="tour-records-list" className="flex flex-col gap-3">
            {auxRecords.map((rec, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface border border-gray-300 rounded-sm p-3"
              >
                <div>
                  <label className="text-sm font-semibold">Nombre</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface tour-note-name"
                    value={rec?.name ?? ""}
                    onChange={(e) =>
                      handleRecordChange(idx, "name", e.target.value)
                    }
                    placeholder={`Nota ${idx + 1}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Porcentual (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-full p-2 border rounded bg-surface tour-note-porcentual"
                      value={rec?.porcentual ?? 0}
                      onChange={(e) =>
                        handlePorcentualChange(idx, e.target.value)
                      }
                    />
                    <label className="flex items-center gap-1 text-xs opacity-80 select-none">
                      <input
                        type="checkbox"
                        className="tour-note-lock"
                        checked={Boolean(rec?.locked)}
                        onChange={() => togglePorcentualLock(idx)}
                      />
                      Fijar
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Objetivo de la nota
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface tour-note-goal"
                    value={rec?.goal ?? ""}
                    onChange={(e) =>
                      handleRecordChange(idx, "goal", e.target.value)
                    }
                    placeholder="Objetivo de la nota"
                  />
                </div>
              </div>
            ))}

            {isTest ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface border border-gray-300 rounded-sm p-3">
                <div>
                  <label className="text-sm font-semibold">Nombre</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface"
                    value="Examen final"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Porcentual (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min={1}
                    max={99}
                    className="w-full p-2 border rounded bg-surface"
                    value={finalTest.porcentual}
                    onChange={(e) => {
                      const val = Math.min(
                        99,
                        Math.max(1, Number(e.target.value) || 1),
                      );
                      setFinalTest((prev) => ({ ...prev, porcentual: val }));
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Objetivo de la nota
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface"
                    value={finalTest.goal}
                    onChange={(e) =>
                      setFinalTest((prev) => ({
                        ...prev,
                        goal: e.target.value,
                      }))
                    }
                    placeholder="Objetivo de la nota"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div id="tour-submit" className="mt-2 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Registrar notas"
              text={"text-surface"}
              bg={"bg-secondary"}
              icon={"Save"}
              disabled={loadingSchool || !canSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterRecords;
