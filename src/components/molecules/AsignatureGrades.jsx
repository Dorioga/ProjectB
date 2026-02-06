import React, { useEffect, useState, useRef, useCallback } from "react";
import AsignatureSelector from "./AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";

export default function AsignatureGrades({
  sede,
  workday,
  asignatures = [],
  onAdd,
  onRemove,
}) {
  const { getGradeAsignature } = useSchool();

  // Estabilizar la referencia para evitar re-renders infinitos
  const getGradeAsignatureRef = useRef(getGradeAsignature);
  useEffect(() => {
    getGradeAsignatureRef.current = getGradeAsignature;
  });

  const [tempAsignature, setTempAsignature] = useState("");
  const [tempAsignatureName, setTempAsignatureName] = useState("");
  const [tempGrades, setTempGrades] = useState([]);
  const [availableAsignatureGrades, setAvailableAsignatureGrades] = useState(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tempAsignature || !sede) {
      setAvailableAsignatureGrades([]);
      return;
    }

    let canceled = false;
    const loadGrades = async () => {
      setLoading(true);
      try {
        const payload = {
          idAsignature: Number(tempAsignature),
          idSede: Number(sede),
          idWorkDay: Number(workday),
        };
        const response = await getGradeAsignatureRef.current(payload);
        const grades = Array.isArray(response) ? response : [];
        if (!canceled) setAvailableAsignatureGrades(grades);
      } catch (err) {
        console.error("AsignatureGrades - error fetching grades:", err);
        if (!canceled) setAvailableAsignatureGrades([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadGrades();

    return () => {
      canceled = true;
    };
  }, [tempAsignature, sede, workday]);

  const toggleAsignatureGrade = (gradeId) => {
    setTempGrades((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const exists = current.includes(gradeId);
      return exists
        ? current.filter((g) => g !== gradeId)
        : [...current, gradeId];
    });
  };

  const handleAdd = () => {
    if (!tempAsignature || tempGrades.length === 0) return;

    const newAsign = {
      idAsignature: tempAsignature,
      nameAsignature: tempAsignatureName,
      grades: tempGrades,
    };

    if (typeof onAdd === "function") onAdd(newAsign);

    // limpiar estado local
    setTempAsignature("");
    setTempAsignatureName("");
    setTempGrades([]);
    setAvailableAsignatureGrades([]);
  };

  return (
    <>
      <div className="md:col-span-3 font-bold mt-4">Asignaturas y Grados</div>

      <div className="md:col-span-3 border p-4 rounded bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AsignatureSelector
            name="tempAsignature"
            label="Seleccionar Asignatura"
            value={tempAsignature}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedName =
                e.target.options[e.target.selectedIndex]?.text || "";
              setTempAsignature(selectedId);
              setTempAsignatureName(selectedName);
            }}
            sedeId={sede}
            workdayId={workday}
            labelClassName="font-semibold"
          />
        </div>

        {tempAsignature && (
          <div className="mt-4">
            <label className="font-semibold">
              Grados donde dictará esta asignatura:
            </label>
            {!sede || !workday ? (
              <div className="text-sm text-gray-600 mt-2">
                Selecciona primero una sede y jornada.
              </div>
            ) : loading ? (
              <div className="text-sm text-gray-600 mt-2">
                Cargando grados...
              </div>
            ) : availableAsignatureGrades.length === 0 ? (
              <div className="text-sm text-gray-600 mt-2">
                No hay grados disponibles para esta asignatura.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {availableAsignatureGrades.map((grade) => {
                  const gradeId = String(grade?.id_grado ?? "");
                  const gradeName = String(grade?.grado ?? "");
                  const checked = tempGrades.includes(gradeId);
                  return (
                    <label
                      key={gradeId}
                      className="flex items-center gap-2 bg-surface rounded-sm p-2 border border-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAsignatureGrade(gradeId)}
                      />
                      <span>{gradeName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!tempAsignature || tempGrades.length === 0}
            className="bg-blue-500 text-surface px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Agregar Asignatura
          </button>
        </div>
      </div>

      {asignatures.length > 0 && (
        <div className="md:col-span-3 mt-2">
          <label className="font-semibold">Asignaturas agregadas:</label>
          <div className="space-y-2 mt-2">
            {asignatures.map((asig, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-surface p-3 border rounded"
              >
                <div>
                  <span className="font-medium">
                    Asignatura: {asig.nameAsignature || asig.idAsignature}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({asig.grades.length} grado
                    {asig.grades.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    typeof onRemove === "function" ? onRemove(index) : null
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
