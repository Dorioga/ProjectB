import React, { useEffect, useMemo, useState } from "react";
import useSchool from "../../lib/hooks/useSchool";

const GradeSelector = ({
  name = "gradeId",
  label = "Grado",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un grado",
  className = "w-full p-2 border rounded bg-surface",
  disabled = false,
  sedeId = null,
  workdayId = null,
  autoLoad = false,
  customFetchMethod = null,
  additionalParams = {},
}) => {
  const { getGradeSede, loading } = useSchool();
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Serializar additionalParams para evitar re-renders infinitos
  const additionalParamsStr = JSON.stringify(additionalParams);

  // Cargar grados cuando se proporciona sedeId y workdayId
  useEffect(() => {
    // Si hay customFetchMethod, solo verificar que haya additionalParams
    // Si no hay customFetchMethod, verificar sedeId y workdayId
    const canLoad = customFetchMethod
      ? Object.keys(JSON.parse(additionalParamsStr)).length > 0
      : sedeId && workdayId;

    if (!canLoad) {
      setGrades([]);
      return;
    }

    const loadGrades = async () => {
      setLoadingGrades(true);
      try {
        const parsedParams = JSON.parse(additionalParamsStr);
        console.log("GradeSelector - Cargando grados:", {
          sedeId,
          workdayId,
          additionalParams: parsedParams,
          usingCustomMethod: !!customFetchMethod,
        });

        const fetchMethod = customFetchMethod || getGradeSede;

        // Si hay customFetchMethod, solo usar additionalParams
        // Si no, usar el payload completo con idSede e idWorkDay
        const payload = customFetchMethod
          ? parsedParams
          : {
              idSede: Number(sedeId),
              idWorkDay: Number(workdayId),
              ...parsedParams,
            };

        const result = await fetchMethod(payload);

        // Manejar diferentes formatos de respuesta
        const gradesData = Array.isArray(result)
          ? result
          : result?.data
            ? Array.isArray(result.data)
              ? result.data
              : []
            : [];

        console.log("GradeSelector - Grados cargados:", gradesData);
        setGrades(gradesData);
      } catch (err) {
        console.error("GradeSelector - Error al cargar grados:", err);
        setGrades([]);
      } finally {
        setLoadingGrades(false);
      }
    };

    if (autoLoad || canLoad) {
      loadGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeId, workdayId, autoLoad, customFetchMethod, additionalParamsStr]);

  const gradeOptions = useMemo(() => {
    if (!Array.isArray(grades)) return [];

    return grades
      .filter(Boolean)
      .filter((grade) => !grade?.estado || grade?.estado === "Activo")
      .map((grade) => ({
        id: grade.id_grade || grade.id || grade.id_grado,
        nombre:
          grade.grado || grade.nombre || grade.nombre_grado || grade.name || "",
        grupo: grade.grupo || "",
      }))
      .filter((g) => g.id && g.nombre);
  }, [grades]);

  const isLoading = loadingGrades || loading;

  // Determinar si el selector debe estar deshabilitado
  const isDisabled = customFetchMethod
    ? disabled || isLoading
    : disabled || isLoading || !sedeId || !workdayId;

  // Determinar el mensaje del placeholder
  const placeholderMessage = isLoading
    ? "Cargando grados..."
    : customFetchMethod
      ? placeholder
      : !sedeId
        ? "Selecciona una sede primero"
        : !workdayId
          ? "Selecciona una jornada primero"
          : placeholder;

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={isDisabled}
      >
        <option value="">{placeholderMessage}</option>
        {gradeOptions.map((grade) => (
          <option key={grade.id} value={grade.id}>
            {grade.grupo ? `${grade.nombre} - ${grade.grupo}` : grade.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GradeSelector;
