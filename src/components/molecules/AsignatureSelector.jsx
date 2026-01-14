import React, { useEffect, useMemo, useState } from "react";
import useSchool from "../../lib/hooks/useSchool";

const AsignatureSelector = ({
  name = "asignature",
  label = "Asignatura",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona una asignatura",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  sedeId = null,
  workdayId = null,
  multiple = false,
  autoLoad = true,
  customFetchMethod = null,
  additionalParams = {},
  onJourneyDetected = null,
}) => {
  const { getSedeAsignature, loading: schoolLoading } = useSchool();
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serializar additionalParams para evitar re-renders infinitos
  const additionalParamsStr = JSON.stringify(additionalParams);

  // Log para debugging
  console.log(
    "AsignatureSelector RENDER - workdayId:",
    workdayId,
    "additionalParamsStr:",
    additionalParamsStr
  );

  // Cargar asignaturas cuando cambie la sede o jornada
  useEffect(() => {
    console.log("AsignatureSelector useEffect TRIGGERED - autoLoad:", autoLoad);
    if (!autoLoad) return;

    // Si hay customFetchMethod, solo verificar que haya additionalParams
    // Si no hay customFetchMethod, verificar sedeId y workdayId
    const canLoad = customFetchMethod
      ? Object.keys(JSON.parse(additionalParamsStr)).length > 0
      : sedeId && workdayId;

    if (!canLoad) {
      setAsignaturas([]);
      return;
    }

    const loadAsignaturas = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsedParams = JSON.parse(additionalParamsStr);
        const fetchMethod = customFetchMethod || getSedeAsignature;

        // Si hay customFetchMethod, solo usar additionalParams
        // Si no, usar el payload completo con idSede e idWorkDay
        const payload = customFetchMethod
          ? parsedParams
          : {
              idSede: Number(sedeId),
              idWorkDay: Number(workdayId),
            };

        console.log(
          "AsignatureSelector - Cargando asignaturas con payload:",
          payload,
          "usingCustomMethod:",
          !!customFetchMethod
        );
        const response = await fetchMethod(payload);
        console.log("AsignatureSelector - Respuesta:", response);

        // Extraer las asignaturas de la respuesta
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        console.log("AsignatureSelector - Asignaturas procesadas:", data);
        setAsignaturas(data);
      } catch (err) {
        console.error("Error al cargar asignaturas:", err);
        setError(err);
        setAsignaturas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAsignaturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Solo incluir sedeId y workdayId si NO hay customFetchMethod
    ...(customFetchMethod ? [] : [sedeId, workdayId]),
    autoLoad,
    customFetchMethod,
    additionalParamsStr,
  ]);

  const items = useMemo(() => {
    return (Array.isArray(asignaturas) ? asignaturas : [])
      .filter(Boolean)
      .filter((x) => !x?.estado || x?.estado === "Activo") // Solo asignaturas activas o sin estado
      .map((x) => ({
        id: String(x?.id_asignatura || x?.id || "").trim(),
        name: String(x?.nombre_asignatura || x?.nombre || x?.name || "").trim(),
        code: String(x?.codigo_asignatura || x?.codigo || x?.code || "").trim(),
      }))
      .filter((x) => x.id && x.name);
  }, [asignaturas]);

  const isLoading = loading || schoolLoading;

  // Determinar si el selector debe estar deshabilitado
  const isDisabled = customFetchMethod
    ? disabled || isLoading
    : disabled || isLoading || !sedeId || !workdayId;

  // Determinar el mensaje del placeholder
  const placeholderMessage = customFetchMethod
    ? isLoading
      ? "Cargando asignaturas..."
      : error
      ? "Error al cargar asignaturas"
      : items.length === 0
      ? "No hay asignaturas disponibles"
      : placeholder
    : !sedeId || !workdayId
    ? "Selecciona primero una sede y jornada"
    : isLoading
    ? "Cargando asignaturas..."
    : error
    ? "Error al cargar asignaturas"
    : items.length === 0
    ? "No hay asignaturas disponibles"
    : placeholder;

  // Manejar el cambio de asignatura
  const handleChange = (e) => {
    const selectedId = e.target.value;

    // Llamar al onChange original
    if (onChange) {
      onChange(e);
    }

    // Si hay un callback de jornada y se seleccionó una asignatura
    if (onJourneyDetected && selectedId) {
      // Buscar la asignatura seleccionada en los datos originales
      const selectedAsignature = asignaturas.find(
        (asig) =>
          String(asig?.id_asignatura || asig?.id || "") === String(selectedId)
      );

      if (selectedAsignature?.id_jornada) {
        console.log(
          "AsignatureSelector - Jornada detectada al seleccionar:",
          selectedAsignature.id_jornada,
          "nombre:",
          selectedAsignature.nombre_jornada
        );
        onJourneyDetected(selectedAsignature.id_jornada);
      }
    }
  };

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className={className}
        disabled={isDisabled}
        multiple={multiple}
      >
        <option value="">{placeholderMessage}</option>
        {items.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AsignatureSelector;
