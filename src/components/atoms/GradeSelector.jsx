import React, { useEffect, useMemo, useState } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";

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
  console.log("GradeSelector - props:", {
    name,
    label,
    labelClassName,
    value,
    onChange,
    placeholder,
    className,
    disabled,
    sedeId,
    workdayId,
    autoLoad,
    customFetchMethod,
    additionalParams,
  });

  const { getGradeSede, loading } = useSchool();
  const { token } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Serializar additionalParams para evitar re-renders infinitos
  const additionalParamsStr = JSON.stringify(additionalParams);

  // Intentar parsear additionalParams de forma segura para reutilizarlo en checks
  let parsedAdditionalParams = {};
  try {
    parsedAdditionalParams = JSON.parse(additionalParamsStr) || {};
  } catch (e) {
    parsedAdditionalParams = {};
  }

  // Cargar grados cuando se proporciona sedeId y workdayId
  useEffect(() => {
    console.log(
      "GradeSelector useEffect TRIGGERED - disabled:",
      disabled,
      "sedeId:",
      sedeId,
      "workdayId:",
      workdayId,
      "hasToken:",
      !!token,
    );

    // No intentar cargar si no hay token (usuario desconectado)
    if (!token) {
      setGrades([]);
      return;
    }

    // No cargar si el selector está deshabilitado
    if (disabled) {
      setGrades([]);
      return;
    }

    // Si hay customFetchMethod, requerir explícitamente que exista una sede seleccionada
    // (ya sea via prop `sedeId` o en `additionalParams` como `idSede` / `id_sede`)
    const hasSedeInParams = Boolean(
      parsedAdditionalParams?.idSede ||
      parsedAdditionalParams?.id_sede ||
      parsedAdditionalParams?.sedeId,
    );

    const isValidSedeId =
      sedeId && String(sedeId).trim() !== "" && Number(sedeId) > 0;
    const isValidWorkdayId =
      workdayId && String(workdayId).trim() !== "" && Number(workdayId) > 0;

    const canLoad = customFetchMethod
      ? Boolean(sedeId) || hasSedeInParams
      : isValidSedeId && isValidWorkdayId;

    console.log("GradeSelector - canLoad:", canLoad, {
      sedeId,
      workdayId,
      isValidSedeId,
      isValidWorkdayId,
      customFetchMethod,
      hasSedeInParams,
    });

    if (!canLoad) {
      setGrades([]);
      return;
    }

    const loadGrades = async () => {
      setLoadingGrades(true);
      try {
        const parsedParams = parsedAdditionalParams;
        console.log("GradeSelector - Cargando grados:", {
          sedeId,
          workdayId,
          additionalParams: parsedParams,
          usingCustomMethod: !!customFetchMethod,
        });

        const fetchMethod = customFetchMethod || getGradeSede;

        // Si hay customFetchMethod, usar additionalParams (que debe incluir idSede)
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
        // Silenciar errores relacionados con token inválido para evitar spam al hacer logout
        if (err?.message && /token|autenticaci/i.test(String(err.message))) {
          console.warn("GradeSelector: petición abortada por token inválido");
        } else {
          console.error("GradeSelector - Error al cargar grados:", err);
        }
        setGrades([]);
      } finally {
        setLoadingGrades(false);
      }
    };

    if (autoLoad || canLoad) {
      loadGrades();
    }
  }, [
    sedeId,
    workdayId,
    autoLoad,
    customFetchMethod,
    additionalParamsStr,
    disabled,
    token,
  ]);

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
    ? disabled || isLoading || !sedeId
    : disabled || isLoading || !sedeId || !workdayId;

  // Determinar el mensaje del placeholder
  const placeholderMessage = isLoading
    ? "Cargando grados..."
    : customFetchMethod
      ? !sedeId
        ? "Selecciona una sede primero"
        : placeholder
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
