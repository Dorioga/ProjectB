import React, { useEffect, useMemo, useState } from "react";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";

const RoleSelector = ({
  name = "rol",
  label = "Rol",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un rol",
  className = "w-full p-2 border rounded bg-surface",
  disabled = false,
  // Permite pasar data manualmente; si no, se toma del DataContext.
  data,
  // Legacy: props que pueden venir de patrones anteriores.
  options,
  params,
  autoLoad,
}) => {
  const { roles, loadingRoles, reloadRoles } = useData();
  const { rol } = useAuth();

  const shouldAutoLoad = useMemo(() => {
    if (typeof autoLoad === "boolean") return autoLoad;
    if (typeof options?.autoLoad === "boolean") return options.autoLoad;
    return true;
  }, [autoLoad, options?.autoLoad]);

  useEffect(() => {
    if (!shouldAutoLoad) return;
    if (loadingRoles) return;
    if (Array.isArray(data) && data.length > 0) return;
    if (Array.isArray(roles) && roles.length > 0) return;
    reloadRoles().catch(() => {});
  }, [data, loadingRoles, reloadRoles, roles, shouldAutoLoad]);

  const items = useMemo(() => {
    const source = Array.isArray(data) && data.length ? data : roles;
    const allItems = (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((x) => {
        const id = String(
          x?.id_rol ?? x?.id ?? x?.value ?? x?.code ?? "",
        ).trim();
        const name = String(
          x?.nombre_rol ?? x?.name ?? x?.label ?? x?.rol ?? x?.role ?? "",
        ).trim();
        return { id, name };
      })
      .filter((x) => x.id && x.name);

    console.log("rol in RoleSelector:", rol);

    // Filtrar roles según el valor numérico de rol
    const rolNumber = String(rol).trim();

    if (rolNumber === "1") {
      // Si es rol 1 (Administrador), mostrar todos los roles
      return allItems;
    } else if (rolNumber === "2" || rolNumber === "3" || rolNumber === "4") {
      // Si es rol 2, 3 o 4, solo mostrar roles 2, 3 y 4
      return allItems.filter(
        (item) => item.id === "2" || item.id === "3" || item.id === "4",
      );
    }

    // Por defecto, mostrar todos
    return allItems;
  }, [data, roles, rol]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled || loadingRoles}
      >
        <option value="">
          {loadingRoles ? "Cargando roles..." : placeholder}
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

export default RoleSelector;
