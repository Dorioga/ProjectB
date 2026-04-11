import React, { useEffect, useState, useRef, useCallback } from "react";
import Loader from "../atoms/Loader";
import AsignatureSelector from "./AsignatureSelector";
import useSchool from "../../lib/hooks/useSchool";
import { LucidePlus, LucideSave } from "lucide-react";

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

    // Convertir los grades seleccionados (ids) a objetos con id y nombre para que el padre tenga el mapeo
    const gradesWithNames = (Array.isArray(tempGrades) ? tempGrades : []).map(
      (gId) => {
        const found = (availableAsignatureGrades || []).find(
          (gr) => String(gr?.id_grado ?? gr?.id) === String(gId),
        );
        return {
          idgrade: String(gId),
          nombre_grado: found?.grado ?? found?.nombre_grado ?? String(gId),
        };
      },
    );

    const newAsign = {
      idAsignature: tempAsignature,
      nameAsignature: tempAsignatureName,
      grades: gradesWithNames,
    };

    if (typeof onAdd === "function") onAdd(newAsign);

    // limpiar estado local
    setTempAsignature("");
    setTempAsignatureName("");
    setTempGrades([]);
    setAvailableAsignatureGrades([]);
  };

  return (
    <div className="">
      <div className="md:col-span-3 font-bold  text-surface bg-primary p-2 rounded-lg">
        Asignaturas y Grados <span className="text-red-500 ml-1">*</span>
      </div>

      <div className=" py-4">
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
            labelClassName="font-semibold "
          />
          <div className="flex items-end justify-end ">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!tempAsignature || tempGrades.length === 0}
              className="bg-secondary text-surface px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <LucidePlus className="inline-block w-4 h-4 mr-1" />
              Registrar Asignatura
            </button>
          </div>
        </div>

        {tempAsignature && (
          <div className="mt-4">
            <label className="font-semibold ">
              Grados donde dictará esta asignatura:
            </label>
            {!sede || !workday ? (
              <div className="text-sm text-gray-600 mt-2">
                Selecciona primero una sede y jornada.
              </div>
            ) : loading ? (
              <Loader message="Cargando grados..." size={56} />
            ) : availableAsignatureGrades.length === 0 ? (
              <div className="text-sm text-gray-600 mt-2">
                No hay grados disponibles para esta asignatura.
              </div>
            ) : (
              <div className="grid grid-cols-2  md:grid-cols-5 gap-2 mt-2">
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
    </div>
  );
}
