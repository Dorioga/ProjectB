import React, { useEffect, useMemo, useState } from "react";

import useSchool from "../../lib/hooks/useSchool";

const JourneySelect = ({
  name = "jornada",
  label = "Jornada",
  labelClassName = "",
  value = "",
  filterValue,
  onChange,
  placeholder = "Selecciona una jornada",
  className = "w-full p-2 border rounded bg-surface",
  includeAmbas = true,
  useServiceJourneys = true,
  disabled = false,
  // Cuando se proporciona, `subjectJourney` tiene forma { id, name } y
  // el selector mostrará únicamente esa opción (y la seleccionará automáticamente)
  subjectJourney = null,

  // Cuando hay una asignatura seleccionada, bloquear la jornada para evitar cambios manuales
  lockByAsignature = false,
}) => {
  const { journeys, loadingJourneys, errorJourneys, reloadJourneys } =
    useSchool();

  // Cargar jornadas cuando se monta el componente
  useEffect(() => {
    if (!journeys || journeys.length === 0) {
      reloadJourneys();
    }
  }, []);

  const normalizedFilterValue = useMemo(() => {
    // Aceptar strings y números; ignorar null/undefined/vacío
    if (filterValue === null || filterValue === undefined || filterValue === "")
      return "";
    return String(filterValue).trim().toLowerCase();
  }, [filterValue]);

  const options = useMemo(() => {
    // Si viene una jornada proveniente de la asignatura, usar SOLO esa
    if (subjectJourney && subjectJourney.id) {
      const id = String(subjectJourney.id).trim();
      const label =
        String(subjectJourney.name || subjectJourney.label || "").trim() || id;
      return [{ value: id, label }];
    }

    if (!Array.isArray(journeys) || journeys.length === 0) {
      return [];
    }

    let filtered = [...journeys];

    // Aplicar filtro por filterValue (cuando viene desde sedesResponse)
    if (normalizedFilterValue) {
      // Si filterValue es "ambas" (id=3), mostrar Mañana (1), Tarde (2) y Ambas (3)
      if (normalizedFilterValue === "ambas" || normalizedFilterValue === "3") {
        filtered = filtered.filter(
          (opt) => opt.value === "1" || opt.value === "2" || opt.value === "3",
        );
      } else {
        // Buscar coincidencia exacta por value o label
        const match = filtered.find(
          (opt) =>
            String(opt.value).toLowerCase() === normalizedFilterValue ||
            String(opt.label).toLowerCase() === normalizedFilterValue,
        );
        filtered = match ? [match] : [];
      }
    }

    // Excluir "Ambas" (id=3) si includeAmbas es false
    if (!includeAmbas) {
      filtered = filtered.filter(
        (opt) =>
          opt.value !== "3" && String(opt.label).toLowerCase() !== "ambas",
      );
    }

    return filtered;
  }, [includeAmbas, journeys, normalizedFilterValue, subjectJourney]);

  // Validar que el valor seleccionado existe en las opciones disponibles
  const effectiveValue = useMemo(() => {
    // Si la jornada viene desde la asignatura, priorizar su id
    if (subjectJourney && subjectJourney.id)
      return String(subjectJourney.id).trim();

    if (!value) return "";

    const isValidOption = options.some(
      (opt) => String(opt.value) === String(value),
    );

    // Si el valor no existe en opciones y hay opciones disponibles, limpiar
    return isValidOption || options.length === 0 ? value : "";
  }, [options, value, subjectJourney]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <label className={labelClassName}>{label}</label>
        {subjectJourney && subjectJourney.id ? (
          <span
            role="img"
            aria-label="info"
            title="La jornada fue establecida por la asignatura"
            className="text-sm text-gray-500"
          >
            ℹ️
          </span>
        ) : null}
      </div>

      <select
        name={name}
        value={effectiveValue}
        onChange={onChange}
        className={className}
        title={
          subjectJourney
            ? "Jornada establecida por la asignatura"
            : lockByAsignature
              ? "Jornada no editable"
              : undefined
        }
        disabled={
          disabled ||
          loadingJourneys ||
          Boolean(subjectJourney && subjectJourney.id) ||
          Boolean(lockByAsignature)
        }
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

      {lockByAsignature && !subjectJourney ? (
        <div className="text-sm italic text-gray-500 mt-1">
          Jornada bloqueada
        </div>
      ) : null}
    </div>
  );
};

export default JourneySelect;
