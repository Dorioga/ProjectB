import React, { useEffect, useMemo } from "react";

import useSchool from "../../lib/hooks/useSchool";

const DEFAULT_OPTIONS = [
  { value: "mañana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "unica", label: "Única" },
  { value: "ambas", label: "Ambas" },
];

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
  useServiceJourneys = false,
  disabled = false,
}) => {
  const {
    journeys,
    loadingJourneys,
    reloadJourneys,
    // errorJourneys,
  } = useSchool();

  const normalizedValue = useMemo(() => {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  }, [value]);

  const normalizedFilterValue = useMemo(() => {
    if (typeof filterValue !== "string") return "";
    return filterValue.trim().toLowerCase();
  }, [filterValue]);

  useEffect(() => {
    if (!useServiceJourneys) return;
    if (loadingJourneys) return;
    if (Array.isArray(journeys) && journeys.length > 0) return;
    reloadJourneys();
  }, [journeys, loadingJourneys, reloadJourneys, useServiceJourneys]);

  const options = useMemo(() => {
    const baseFromService =
      Array.isArray(journeys) && journeys.length > 0
        ? journeys
        : DEFAULT_OPTIONS;
    const base = useServiceJourneys
      ? baseFromService
      : includeAmbas
      ? DEFAULT_OPTIONS
      : DEFAULT_OPTIONS.filter((opt) => opt.value !== "ambas");

    // Si NO usamos servicio y llega un filterValue (por ejemplo desde sedesResponse):
    // - si es "ambas": mostrar "mañana" y "tarde"
    // - si no: mostrar SOLO el valor que entra
    // Nota: NO restringimos por el value seleccionado, para que el usuario
    // pueda volver a abrir el select y ver todas las opciones.
    if (!useServiceJourneys && normalizedFilterValue) {
      const refValue = normalizedFilterValue;

      if (refValue === "ambas") {
        return base.filter(
          (opt) => opt.value === "mañana" || opt.value === "tarde"
        );
      }

      const isKnown = base.some((opt) => opt.value === refValue);
      if (isKnown) {
        return base.filter((opt) => opt.value === refValue);
      }
    }

    return includeAmbas ? base : base.filter((opt) => opt.value !== "ambas");
  }, [
    includeAmbas,
    journeys,
    normalizedFilterValue,
    normalizedValue,
    useServiceJourneys,
  ]);

  const effectiveValue = useMemo(() => {
    if (!useServiceJourneys) {
      const hasValueOption = options.some(
        (opt) => String(opt.value).toLowerCase() === normalizedValue
      );
      if (normalizedValue && !hasValueOption) return "";
    }

    return value;
  }, [normalizedValue, options, useServiceJourneys, value]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={effectiveValue}
        onChange={onChange}
        className={className}
        disabled={disabled || (useServiceJourneys && loadingJourneys)}
      >
        <option value="">
          {useServiceJourneys && loadingJourneys
            ? "Cargando jornadas..."
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
