import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";

const CitySelector = ({
  name = "city_id",
  label = "City",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Seleccionar un municipio",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  // ID del departamento seleccionado para cargar municipios
  departmentId = "",
  // Permite pasar data manualmente; si no, se toma del DataContext.
  data,
  // Legacy: para compatibilidad con la firma anterior.
  options,
  // Params para el servicio (si aplica)
  params,
  autoLoad,
}) => {
  const {
    cities,
    loadingCities,
    loadCities,
    selectedDepartment,
    // errorCities,
  } = useData();

  const shouldAutoLoad = useMemo(() => {
    if (typeof autoLoad === "boolean") return autoLoad;
    if (typeof options?.autoLoad === "boolean") return options.autoLoad;
    return true; // Habilitar carga automática por defecto
  }, [autoLoad, options?.autoLoad]);

  // Efecto para cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (!shouldAutoLoad) return;
    if (!departmentId) {
      // Si no hay departamento seleccionado, limpiar municipios
      if (selectedDepartment) {
        loadCities(null).catch(() => {});
      }
      return;
    }

    // Solo cargar si es diferente al departamento actualmente seleccionado
    if (departmentId !== selectedDepartment) {
      loadCities(departmentId).catch(() => {});
    }
  }, [departmentId, selectedDepartment, loadCities, shouldAutoLoad]);

  const items = useMemo(() => {
    // Si se proporciona data manualmente, usarla
    if (Array.isArray(data) && data.length > 0) {
      const normalized = data
        .filter(Boolean)
        .map((x) => ({
          id: String(x?.id ?? "").trim(),
          name: String(x?.name ?? "").trim(),
        }))
        .filter((x) => x.id && x.name);
      return normalized;
    }

    // Si no hay departamento seleccionado, no mostrar municipios
    if (!departmentId) return [];

    // Usar municipios del contexto solo si coincide el departamento
    const source = selectedDepartment === departmentId ? cities : [];
    const normalized = (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((x) => ({
        id: String(x?.id ?? "").trim(),
        name: String(x?.name ?? "").trim(),
      }))
      .filter((x) => x.id && x.name);

    return normalized;
  }, [data, cities, departmentId, selectedDepartment]);

  const isDisabled = disabled || loadingCities || !departmentId;

  const selectClassName = isDisabled
    ? `${className} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 opacity-60`
    : className;

  return (
    <div>
      <label
        className={`${labelClassName} ${isDisabled ? "text-gray-400" : ""}`}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={selectClassName}
        disabled={isDisabled}
      >
        <option value="">
          {!departmentId
            ? "Seleccionar un departamento primero"
            : loadingCities
            ? "Cargando municipios..."
            : placeholder}
        </option>
        {items.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CitySelector;
