import { useCallback, useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";

// Redondeo consistente a 2 decimales
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const TOTAL_PERCENTAGE = 100;

/**
 * ProfileNote – muestra las notas existentes de un grado/asignatura/periodo
 * y permite editarlas o añadir nuevas, redistribuyendo porcentajes automáticamente.
 *
 * Props:
 *  - sedeId, gradeId, asignatureId, workdayId, periodId (IDs de los filtros activos)
 *  - sedeNombre, gradeNombre, asignatureNombre, workdayNombre, periodNombre (etiquetas opcionales)
 *  - initialNotes: Array de notas ya cargadas desde /notes/data
 *    { id_nota, nombre_nota, porcentaje, logro, estado }
 *  - onClose: callback para cerrar el modal
 */
const ProfileNote = ({
  sedeId,
  gradeId,
  asignatureId,
  workdayId,
  periodId,
  sedeNombre,
  gradeNombre,
  asignatureNombre,
  workdayNombre,
  periodNombre,
  initialNotes = [],
  onClose,
}) => {
  const {
    createNote,
    updateNote,
    createOrUpdateNote,
    loading: loadingSchool,
  } = useSchool();
  const { idDocente } = useAuth();
  const notify = useNotify();

  // Mapear las notas iniciales al formato interno de trabajo
  const [records, setRecords] = useState(() =>
    initialNotes.map((n) => ({
      id: n.id_nota ?? null,
      name: n.nombre_nota ?? "",
      porcentual: Number(n.porcentaje) || 0,
      goal: n.logro ?? "",
      estado: n.estado ?? "Activo",
      active: (n.estado ?? "Activo") === "Activo",
      locked: true, // las notas existentes arrancan bloqueadas
      isNew: false,
    })),
  );

  // ── Distribución de porcentajes (solo notas activas) ─────────────────────
  const distributePercentages = useCallback((recs) => {
    // Las notas inactivas quedan siempre en 0
    const activeRecs = recs.filter((r) => r.active !== false);
    const lockedSum = activeRecs.reduce(
      (sum, r) => (r.locked ? sum + (Number(r.porcentual) || 0) : sum),
      0,
    );
    const unlockedCount = activeRecs.filter((r) => !r.locked).length;
    const remaining = Math.max(0, TOTAL_PERCENTAGE - lockedSum);
    const perUnlocked = unlockedCount > 0 ? remaining / unlockedCount : 0;

    return recs.map((r) => {
      if (r.active === false) return { ...r, porcentual: 0 };
      return {
        ...r,
        porcentual: round2(r.locked ? Number(r.porcentual) || 0 : perUnlocked),
      };
    });
  }, []);

  // ── Agregar nueva nota ────────────────────────────────────────────
  const handleAddNote = () => {
    setRecords((prev) =>
      distributePercentages([
        ...prev,
        {
          id: null,
          name: "",
          porcentual: 0,
          goal: "",
          estado: "Activo",
          active: true,
          locked: false,
          isNew: true,
        },
      ]),
    );
  };

  // ── Toggle activo/inactivo ─────────────────────────────────────────────
  const toggleActive = useCallback(
    (index) => {
      setRecords((prev) => {
        const list = prev.slice();
        const isNowActive = !list[index].active;

        list[index] = {
          ...list[index],
          active: isNowActive,
          estado: isNowActive ? "Activo" : "Inactivo",
          // al desactivar: liberar bloqueo para que no cuente en lockedSum
          // al activar: entra sin bloqueo para recibir su parte del reparto
          locked: false,
        };

        // Si tras el cambio los locked activos ya suman más de 100,
        // desbloquear todos para forzar un reparto limpio
        const newList = list.slice();
        const lockedActiveSum = newList.reduce(
          (sum, r) =>
            r.active !== false && r.locked
              ? sum + (Number(r.porcentual) || 0)
              : sum,
          0,
        );
        if (lockedActiveSum > TOTAL_PERCENTAGE) {
          return distributePercentages(
            newList.map((r) => ({ ...r, locked: false })),
          );
        }

        return distributePercentages(newList);
      });
    },
    [distributePercentages],
  );

  // ── Eliminar nota nueva ─────────────────────────────────────────────────
  const handleRemove = (index) => {
    setRecords((prev) =>
      distributePercentages(prev.filter((_, i) => i !== index)),
    );
  };

  // ── Cambiar campo genérico ──────────────────────────────────────────────
  const handleRecordChange = (index, field, value) => {
    setRecords((prev) => {
      const list = prev.slice();
      list[index] = { ...list[index], [field]: value };
      return list;
    });
  };

  // ── Fijar / desfijar porcentaje ─────────────────────────────────────────
  const toggleLock = useCallback(
    (index) => {
      setRecords((prev) => {
        const list = prev.slice();
        list[index] = { ...list[index], locked: !list[index].locked };
        return distributePercentages(list);
      });
    },
    [distributePercentages],
  );

  // ── Editar porcentaje con redistribución ────────────────────────────────
  const handlePorcentualChange = useCallback((index, rawValue) => {
    setRecords((prev) => {
      const list = prev.slice();
      // Solo permitir editar notas activas
      if (list[index].active === false) return list;

      const value = Math.max(0, Number(rawValue) || 0);

      const lockedSumOther = list.reduce(
        (sum, r, idx) =>
          idx !== index && r.locked && r.active !== false
            ? sum + (Number(r.porcentual) || 0)
            : sum,
        0,
      );
      const maxAllowed = Math.max(0, TOTAL_PERCENTAGE - lockedSumOther);
      const clamped = Math.min(maxAllowed, value);

      const activeList = list.filter((r) => r.active !== false);
      if (activeList.length === 1) {
        list[index] = { ...list[index], porcentual: round2(TOTAL_PERCENTAGE) };
        return list;
      }

      const otherUnlocked = list.filter(
        (r, idx) => idx !== index && !r.locked && r.active !== false,
      );
      const remaining = Math.max(
        0,
        TOTAL_PERCENTAGE - lockedSumOther - clamped,
      );
      const perOther =
        otherUnlocked.length > 0 ? remaining / otherUnlocked.length : 0;

      return list.map((r, idx) => {
        if (r.active === false) return { ...r, porcentual: 0 };
        if (idx === index) return { ...r, porcentual: round2(clamped) };
        if (r.locked)
          return { ...r, porcentual: round2(Number(r.porcentual) || 0) };
        return { ...r, porcentual: round2(perOther) };
      });
    });
  }, []);

  // ── Porcentual total entre notas activas ─────────────────────────────────
  const porcentualActual = records
    .filter((r) => r.active !== false)
    .reduce((sum, r) => sum + (Number(r.porcentual) || 0), 0);

  // ── Validación ──────────────────────────────────────────────────────────
  const activeRecords = records.filter((r) => r.active !== false);
  const percentageIsValid = round2(porcentualActual) === 100;
  const canSubmit =
    records.length > 0 &&
    percentageIsValid &&
    activeRecords.every(
      (r) => String(r.name ?? "").trim() !== "" && Number(r.porcentual) > 0,
    );

  // ── Envío ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newNotes = records.filter((r) => r.isNew);
    const existingNotes = records.filter((r) => !r.isNew && r.id);

    try {
      if (newNotes.length === 0) {
        // ── Solo actualizar notas existentes: PATCH /note/:noteId por cada una ──
        // Enviar todas las notas existentes en un solo PATCH usando el array
        if (existingNotes.length === 0) {
          notify.info("No hay cambios que guardar.");
          return;
        }
        const notasPayload = existingNotes.map((rec) => ({
          id_nota: String(rec.id),
          nombre_nota: rec.name,
          porcentaje: String(rec.porcentual),
          logro: rec.goal,
          estado: rec.estado ?? (rec.active ? "Activo" : "Inactivo"),
        }));
        // Se usa el id de la primera nota como referencia del endpoint
        await updateNote(existingNotes[0].id, notasPayload);
      } else {
        // ── Hay al menos una nota nueva: POST /createourupdatenote ──
        // Se envía UNA nueva nota por request junto con notasActualizar
        for (const newRec of newNotes) {
          const payload = {
            nombre_nota: newRec.name,
            porcentaje: String(newRec.porcentual),
            logro: newRec.goal,
            fk_docente: idDocente ? Number(idDocente) : undefined,
            fk_grade: Number(gradeId),
            fk_period: Number(periodId),
            fk_asignatura: Number(asignatureId),
            notasActualizar: existingNotes.map((rec) => ({
              id_nota: String(rec.id),
              nombre_nota: rec.name,
              porcentaje: String(rec.porcentual),
              logro: rec.goal,
              estado: rec.estado ?? (rec.active ? "Activo" : "Inactivo"),
            })),
          };
          await createOrUpdateNote(payload);
        }
      }

      onClose?.();
    } catch (error) {
      console.error("ProfileNote - Error guardando notas:", error);
      notify.error(error?.message || "Error al guardar notas");
    }
  };

  // ── Labels con fallback a ID ────────────────────────────────────────────
  const filterInfo = [
    { label: "Sede", value: sedeNombre || sedeId },
    { label: "Grado", value: gradeNombre || gradeId },
    { label: "Asignatura", value: asignatureNombre || asignatureId },
    { label: "Jornada", value: workdayNombre || workdayId },
    { label: "Periodo", value: periodNombre || periodId },
  ];

  return (
    <div className="p-2 h-full gap-4 flex flex-col">
      {/* ── Resumen de filtros ──────────────────────────────────────────── */}
      {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-primary rounded-lg p-3">
        {filterInfo.map(({ label, value }) => (
          <div key={label} className="text-surface text-sm">
            <span className="font-semibold">{label}: </span>
            <span className="opacity-90">{value ?? "—"}</span>
          </div>
        ))}
      </div> */}

      {/* ── Indicador de porcentual total ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-70">
          Porcentual total: {round2(porcentualActual)}%
          {round2(porcentualActual) !== 100 && (
            <span className="ml-2 text-error font-semibold">≠ 100%</span>
          )}
        </span>
        <div className="w-48">
          <SimpleButton
            type="button"
            onClick={handleAddNote}
            msj="Agregar nota"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
        </div>
      </div>

      {/* ── Formulario ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {records.length === 0 ? (
          <div className="text-center opacity-60 p-8 border-2 border-dashed rounded-lg">
            No hay notas cargadas. Agrega una nueva nota con el botón superior.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((rec, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-primary border-gray-300 rounded-lg p-5"
              >
                <h2 className="text-lg text-surface font-bold text-center md:text-left md:col-span-3 flex justify-between items-center">
                  <span>{rec.isNew ? "✦ Nueva nota" : `Nota ${idx + 1}`}</span>
                  <div className="flex items-center gap-3">
                    {/* Checkbox de estado */}
                    <label className="flex items-center gap-1 text-sm font-normal text-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rec.active !== false}
                        onChange={() => toggleActive(idx)}
                        title="Activo / Inactivo"
                      />
                      <span>
                        {rec.active !== false ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                    {rec.isNew && (
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="text-sm text-error font-normal hover:underline cursor-pointer"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </h2>

                {/* Nombre */}
                <div className="w-full flex flex-col gap-1 rounded-t-lg">
                  <label className="text-sm font-semibold bg-secondary text-surface p-2 w-full rounded-t-lg">
                    Descripción
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface"
                    value={rec.name ?? ""}
                    onChange={(e) =>
                      handleRecordChange(idx, "name", e.target.value)
                    }
                  />
                </div>

                {/* Porcentual */}
                <div className="w-full flex flex-col gap-1 rounded-t-lg">
                  <div className="flex flex-row bg-secondary justify-between rounded-t-lg pr-4">
                    <label className="text-sm font-semibold text-surface p-2 w-full">
                      Porcentual (%)
                    </label>
                    <div className="flex flex-row items-center gap-1">
                      <input
                        type="checkbox"
                        checked={Boolean(rec.locked)}
                        onChange={() => toggleLock(idx)}
                        title="Fijar porcentaje"
                      />
                      <label className="text-sm font-semibold text-surface p-2">
                        Fijar
                      </label>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="w-full p-2 border rounded bg-surface"
                    value={rec.porcentual ?? 0}
                    onChange={(e) =>
                      handlePorcentualChange(idx, e.target.value)
                    }
                  />
                </div>

                {/* Objetivo */}
                <div className="w-full flex flex-col gap-1 rounded-t-lg">
                  <label className="text-sm font-semibold bg-secondary text-surface p-2 w-full rounded-t-lg text-center">
                    Objetivo de la nota
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-surface"
                    value={rec.goal ?? ""}
                    onChange={(e) =>
                      handleRecordChange(idx, "goal", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-col items-center gap-2">
          {!percentageIsValid && records.length > 0 && (
            <p className="text-error text-sm font-semibold">
              El porcentaje total debe ser exactamente 100% antes de guardar
              (actual: {round2(porcentualActual)}%)
            </p>
          )}
          <div className="w-full md:w-1/2">
            <SimpleButton
              msj="Guardar cambios"
              text="text-surface"
              bg="bg-secondary"
              icon="Save"
              disabled={loadingSchool || !canSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileNote;
