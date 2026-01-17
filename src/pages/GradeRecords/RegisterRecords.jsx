import { useEffect, useMemo, useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import { asignatureResponse } from "../../services/DataExamples/asignatureResponse";
import useSchool from "../../lib/hooks/useSchool";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";

const RegisterRecords = () => {
  const {
    createNote,
    loading: loadingSchool,
    getTeacherGrades,
    getTeacherSubjects,
  } = useSchool();
  const { institutionSedes } = useData();
  const { idSede, nameSede, rol, idDocente } = useAuth();
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
    goal: "",
  });

  // Memoizar additionalParams para evitar re-renders
  const teacherGradesParams = useMemo(() => {
    return idDocente ? { idTeacher: Number(idDocente) } : {};
  }, [idDocente]);

  const teacherSubjectsParams = useMemo(() => {
    return gradeSelected && idDocente
      ? { idGrade: Number(gradeSelected), idTeacher: Number(idDocente) }
      : {};
  }, [gradeSelected, idDocente]);

  const asignatures = useMemo(() => {
    return Array.isArray(asignatureResponse) ? asignatureResponse : [];
  }, []);

  // Obtener el fk_workday de la sede seleccionada
  const sedeWorkday = useMemo(() => {
    if (!sedeSelected || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(sedeSelected)
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [sedeSelected, institutionSedes]);

  // Datos de la sede del docente desde AuthContext
  const teacherSedeData = useMemo(() => {
    console.log("RegisterRecords - rol:", rol);
    console.log("RegisterRecords - idSede:", idSede);
    console.log("RegisterRecords - nameSede:", nameSede);

    if ((rol === "7" || rol === 7) && idSede && nameSede) {
      const data = [{ id: idSede, name: nameSede }];
      console.log("RegisterRecords - teacherSedeData creado:", data);
      return data;
    }
    return null;
  }, [rol, idSede, nameSede]);

  // Si el rol es 7, cargar idsede y establecerlo como seleccionado
  useEffect(() => {
    if ((rol === "7" || rol === 7) && idSede) {
      console.log("RegisterRecords - Estableciendo sede seleccionada:", idSede);
      setSedeSelected(idSede);
    }
  }, [rol, idSede]);

  // Limpiar jornada cuando cambia la sede
  useEffect(() => {
    setWorkdaySelected("");
  }, [sedeSelected]);

  // Auto-seleccionar jornada basada en el fk_workday de la sede
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (Ambas/Completa), el usuario debe elegir manualmente
    if (sedeWorkday === "3") return;

    setWorkdaySelected(sedeWorkday);
  }, [sedeWorkday]);

  useEffect(() => {
    setPorcentualTotal(isTest ? 80 : 100);
  }, [isTest]);

  useEffect(() => {
    const safeNumber = Number(numberRecords);
    if (!safeNumber || safeNumber < 1) {
      setAuxRecords([]);
      return;
    }

    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    const total = Number(porcentualTotal);

    setAuxRecords((prev) => {
      const prevList = Array.isArray(prev) ? prev : [];
      const next = Array.from({ length: safeNumber }, (_, idx) => {
        const existing = prevList[idx] ?? {};
        return {
          name: existing.name ?? "",
          record: existing.record ?? 0,
          porcentual: Number.isFinite(Number(existing.porcentual))
            ? Number(existing.porcentual)
            : 0,
          goal: existing.goal ?? "",
          locked: Boolean(existing.locked),
        };
      });

      const lockedSum = next.reduce((acc, r) => {
        if (!r.locked) return acc;
        const value = Number(r.porcentual);
        return acc + (Number.isFinite(value) ? value : 0);
      }, 0);

      const unlockedCount = next.filter((r) => !r.locked).length;
      const remaining = Math.max(0, total - lockedSum);
      const perUnlocked = unlockedCount > 0 ? remaining / unlockedCount : 0;

      return next.map((r) => {
        if (r.locked) {
          const v = Number(r.porcentual);
          return { ...r, porcentual: round2(Number.isFinite(v) ? v : 0) };
        }
        return { ...r, porcentual: round2(perUnlocked) };
      });
    });
  }, [numberRecords, porcentualTotal]);

  const canSetNumberRecords =
    Boolean(sedeSelected) &&
    Boolean(asignatureSelected) &&
    Boolean(periodSelected);

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

  const togglePorcentualLock = (index) => {
    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

    setAuxRecords((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const total = Number(porcentualTotal);
      if (!list.length || !Number.isFinite(total) || total < 0) return list;

      list[index] = {
        ...(list[index] ?? { name: "", record: 0, porcentual: 0, goal: "" }),
        locked: !Boolean(list[index]?.locked),
      };

      const lockedSum = list.reduce((acc, r) => {
        if (!r?.locked) return acc;
        const value = Number(r?.porcentual);
        return acc + (Number.isFinite(value) ? value : 0);
      }, 0);
      const unlockedIndexes = list
        .map((r, idx) => ({ r, idx }))
        .filter(({ r }) => !r?.locked)
        .map(({ idx }) => idx);

      const remaining = Math.max(0, total - lockedSum);
      const perUnlocked =
        unlockedIndexes.length > 0 ? remaining / unlockedIndexes.length : 0;

      return list.map((r, idx) => {
        if (unlockedIndexes.includes(idx)) {
          return { ...r, porcentual: round2(perUnlocked) };
        }
        const v = Number(r?.porcentual);
        return { ...r, porcentual: round2(Number.isFinite(v) ? v : 0) };
      });
    });
  };

  const handlePorcentualChange = (index, rawValue) => {
    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

    setAuxRecords((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const count = list.length;
      const total = Number(porcentualTotal);

      if (!count || !Number.isFinite(total) || total < 0) return list;

      const lockedSumOther = list.reduce((acc, r, idx) => {
        if (idx === index) return acc;
        if (!r?.locked) return acc;
        const value = Number(r?.porcentual);
        return acc + (Number.isFinite(value) ? value : 0);
      }, 0);

      const value = Number(rawValue);
      const safeValue = Number.isFinite(value) ? value : 0;
      const maxAllowed = Math.max(0, total - lockedSumOther);
      const clamped = Math.max(0, Math.min(maxAllowed, safeValue));

      if (count === 1) {
        list[0] = { ...list[0], porcentual: round2(total) };
        return list;
      }

      const unlockedIndexes = list
        .map((r, idx) => ({ r, idx }))
        .filter(({ r, idx }) => !r?.locked && idx !== index)
        .map(({ idx }) => idx);

      const remaining = Math.max(0, total - lockedSumOther - clamped);
      const perOther =
        unlockedIndexes.length > 0 ? remaining / unlockedIndexes.length : 0;

      return list.map((rec, idx) => {
        if (idx === index) {
          return { ...rec, porcentual: round2(clamped) };
        }

        if (rec?.locked) {
          const v = Number(rec?.porcentual);
          return { ...rec, porcentual: round2(Number.isFinite(v) ? v : 0) };
        }

        if (unlockedIndexes.includes(idx)) {
          return { ...rec, porcentual: round2(perOther) };
        }

        const v = Number(rec?.porcentual);
        return { ...rec, porcentual: round2(Number.isFinite(v) ? v : 0) };
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir el array de notas en el formato requerido
    const notes = auxRecords.map((rec) => ({
      name_note: rec.name || "",
      porcentage: String(rec.porcentual || 0),
      logro: rec.goal || "",
      fk_asignature: Number(asignatureSelected),
      fk_docente: parseInt(idDocente, 10),
      fk_period: Number(periodSelected),
      fk_grade: Number(gradeSelected),
    }));

    // Si hay examen final, agregarlo al array
    if (isTest) {
      notes.push({
        name_note: "Examen final",
        porcentage: "20",
        logro: finalTest.goal || "",
        fk_asignature: Number(asignatureSelected),
        fk_docente: parseInt(idDocente, 10),
        fk_period: Number(periodSelected),
        fk_grade: Number(gradeSelected),
      });
    }

    const payload = { notes };

    console.log("Registro de notas - Payload:", payload);

    try {
      const result = await createNote(payload);
      console.log("Notas registradas exitosamente:", result);

      // Limpiar formulario después del éxito
      setSedeSelected("");
      setWorkdaySelected("");
      setGradeSelected("");
      setAsignatureSelected("");
      setPeriodSelected("");
      setNumberRecords(0);
      setAuxRecords([]);
      setIsTest(false);
      setFinalTest({ record: 0, goal: "" });
    } catch (error) {
      console.error("Error al registrar notas:", error);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Registrar Notas</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SedeSelect
            value={sedeSelected}
            onChange={(e) => setSedeSelected(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            labelClassName="text-lg font-semibold"
            disabled={rol === "7" || rol === 7}
            data={teacherSedeData}
          />
          <GradeSelector
            name="grade"
            label="Grado"
            labelClassName="text-lg font-semibold"
            value={gradeSelected}
            onChange={(e) => setGradeSelected(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            sedeId={sedeSelected}
            workdayId={workdaySelected}
            customFetchMethod={getTeacherGrades}
            additionalParams={teacherGradesParams}
          />
          <AsignatureSelector
            name="asignature"
            label="Asignatura"
            labelClassName="text-lg font-semibold"
            value={asignatureSelected}
            onChange={(e) => setAsignatureSelected(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            sedeId={sedeSelected}
            workdayId={workdaySelected}
            customFetchMethod={getTeacherSubjects}
            additionalParams={teacherSubjectsParams}
            onJourneyDetected={(journeyId) => {
              console.log(
                "RegisterRecords - Jornada detectada de asignatura:",
                journeyId
              );
              setWorkdaySelected(String(journeyId));
            }}
          />
          <JourneySelect
            name="workday"
            label="Jornada"
            labelClassName="text-lg font-semibold"
            value={workdaySelected}
            onChange={(e) => setWorkdaySelected(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            filterValue={sedeWorkday}
            includeAmbas={false}
          />

          <PeriodSelector
            name="period"
            label="Período"
            labelClassName="text-lg font-semibold"
            value={periodSelected}
            onChange={(e) => setPeriodSelected(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            autoLoad={true}
          />

          <div>
            <label className="text-lg font-semibold">
              ¿Cuántas notas deseas registrar?
            </label>
            <input
              type="number"
              min={1}
              className="w-full p-2 border rounded bg-white"
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

        <div className="flex items-center gap-2">
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
          <div className="flex flex-col gap-3">
            {auxRecords.map((rec, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-gray-300 rounded-sm p-3"
              >
                <div>
                  <label className="text-sm font-semibold">Nombre</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
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
                      className="w-full p-2 border rounded bg-white"
                      value={rec?.porcentual ?? 0}
                      onChange={(e) =>
                        handlePorcentualChange(idx, e.target.value)
                      }
                    />
                    <label className="flex items-center gap-1 text-xs opacity-80 select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(rec?.locked)}
                        onChange={() => togglePorcentualLock(idx)}
                      />
                      Fijar
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Logros</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value={rec?.goal ?? ""}
                    onChange={(e) =>
                      handleRecordChange(idx, "goal", e.target.value)
                    }
                    placeholder="Logros"
                  />
                </div>
              </div>
            ))}

            {isTest ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-gray-300 rounded-sm p-3">
                <div>
                  <label className="text-sm font-semibold">Nombre</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value="Examen final"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Porcentual (%)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value="20"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Logros</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-white"
                    value={finalTest.goal}
                    onChange={(e) =>
                      setFinalTest((prev) => ({
                        ...prev,
                        goal: e.target.value,
                      }))
                    }
                    placeholder="Logros"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex justify-center">
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Registrar notas"
              text={"text-white"}
              bg={"bg-accent"}
              icon={"Save"}
              disabled={loadingSchool}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterRecords;
