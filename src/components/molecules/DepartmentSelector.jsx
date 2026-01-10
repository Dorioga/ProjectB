import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";

const DepartmentSelector = ({
  name = "department_id",
  label = "Department",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Seleccionar un departamento",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  // Permite pasar data manualmente; si no, se toma del DataContext.
  data,
  // Legacy: para compatibilidad con la firma anterior.
  options,
  // Params para el servicio (si aplica)
  params,
  autoLoad,
}) => {
  const {
    departments,
    loadingDepartments,
    reloadDepartments,
    // errorDepartments,
  } = useData();

  const shouldAutoLoad = useMemo(() => {
    if (typeof autoLoad === "boolean") return autoLoad;
    if (typeof options?.autoLoad === "boolean") return options.autoLoad;
    return true; // Habilitar carga automática por defecto
  }, [autoLoad, options?.autoLoad]);

  useEffect(() => {
    if (!shouldAutoLoad) return;
    if (loadingDepartments) return;
    if (Array.isArray(data) && data.length > 0) return;
    if (Array.isArray(departments) && departments.length > 0) return;
    reloadDepartments().catch(() => {});
  }, [
    data,
    loadingDepartments,
    reloadDepartments,
    shouldAutoLoad,
    departments,
  ]);

  const items = useMemo(() => {
    const source = Array.isArray(data) && data.length ? data : departments;
    const normalized = (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((x) => ({
        id: String(x?.id ?? "").trim(),
        name: String(x?.name ?? "").trim(),
      }))
      .filter((x) => x.id && x.name);

    return normalized;
  }, [data, departments]);

  const isDisabled = disabled || loadingDepartments;
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
          {loadingDepartments ? "Cargando Departamentos..." : placeholder}
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

export default DepartmentSelector;
