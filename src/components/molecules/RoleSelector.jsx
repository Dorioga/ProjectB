import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";

const RoleSelector = ({
  name = "rol",
  label = "Rol",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un rol",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  // Permite pasar data manualmente; si no, se toma del DataContext.
  data,
  // Legacy: props que pueden venir de patrones anteriores.
  options,
  params,
  autoLoad,
}) => {
  const { roles, loadingRoles, reloadRoles } = useData();

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
    return (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((x) => {
        const id = String(
          x?.id_rol ?? x?.id ?? x?.value ?? x?.code ?? ""
        ).trim();
        const name = String(
          x?.nombre_rol ?? x?.name ?? x?.label ?? x?.rol ?? x?.role ?? ""
        ).trim();
        return { id, name };
      })
      .filter((x) => x.id && x.name);
  }, [data, roles]);

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
