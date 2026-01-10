import React, { useMemo } from "react";

import useSchool from "../../lib/hooks/useSchool";

const JourneySelect = ({
  name = "jornada",
  label = "Jornada",
  labelClassName = "",
  value = "",
  filterValue,
  onChange,
  placeholder = "Selecciona una jornada",
  className = "w-full p-2 border rounded bg-white",
  includeAmbas = true,
  useServiceJourneys = true,
  disabled = false,
}) => {
  const { journeys, loadingJourneys, errorJourneys } = useSchool();

  const normalizedFilterValue = useMemo(() => {
    if (typeof filterValue !== "string") return "";
    return filterValue.trim().toLowerCase();
  }, [filterValue]);

  const options = useMemo(() => {
    if (!Array.isArray(journeys) || journeys.length === 0) {
      return [];
    }

    let filtered = [...journeys];

    // Aplicar filtro por filterValue (cuando viene desde sedesResponse)
    if (normalizedFilterValue) {
      // Si filterValue es "ambas" (id=3), mostrar solo Mañana (id=1) y Tarde (id=2)
      if (normalizedFilterValue === "ambas" || normalizedFilterValue === "3") {
        filtered = filtered.filter(
          (opt) => opt.value === "1" || opt.value === "2"
        );
      } else {
        // Buscar coincidencia exacta por value o label
        const match = filtered.find(
          (opt) =>
            String(opt.value).toLowerCase() === normalizedFilterValue ||
            String(opt.label).toLowerCase() === normalizedFilterValue
        );
        filtered = match ? [match] : [];
      }
    }

    // Excluir "Ambas" (id=3) si includeAmbas es false
    if (!includeAmbas) {
      filtered = filtered.filter(
        (opt) =>
          opt.value !== "3" && String(opt.label).toLowerCase() !== "ambas"
      );
    }

    return filtered;
  }, [includeAmbas, journeys, normalizedFilterValue]);

  // Validar que el valor seleccionado existe en las opciones disponibles
  const effectiveValue = useMemo(() => {
    if (!value) return "";

    const isValidOption = options.some(
      (opt) => String(opt.value) === String(value)
    );

    // Si el valor no existe en opciones y hay opciones disponibles, limpiar
    return isValidOption || options.length === 0 ? value : "";
  }, [options, value]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={effectiveValue}
        onChange={onChange}
        className={className}
        disabled={disabled || loadingJourneys}
      >
        <option value="">
          {loadingJourneys
            ? "Cargando jornadas..."
            : errorJourneys
            ? "Error al cargar jornadas"
            : options.length === 0
            ? "No hay jornadas disponibles"
            : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JourneySelect;
