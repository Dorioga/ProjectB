import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";

const TypeDocumentSelector = ({
  name = "identification_type",
  label = "Tipo de documento",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un tipo",
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
  console.log("Rendering TypeDocumentSelector with value:", value);
  const {
    typeIdentification,
    loadingTypeIdentification,
    reloadTypeIdentification,
    // errorTypeIdentification,
  } = useData();

  const effectiveParams = useMemo(() => {
    if (params && typeof params === "object" && !Array.isArray(params))
      return params;
    const optParams = options?.params;
    if (
      optParams &&
      typeof optParams === "object" &&
      !Array.isArray(optParams)
    ) {
      return optParams;
    }
    return {};
  }, [options?.params, params]);

  const shouldAutoLoad = useMemo(() => {
    if (typeof autoLoad === "boolean") return autoLoad;
    if (typeof options?.autoLoad === "boolean") return options.autoLoad;
    return true;
  }, [autoLoad, options?.autoLoad]);

  useEffect(() => {
    if (!shouldAutoLoad) return;
    if (loadingTypeIdentification) return;
    if (Array.isArray(data) && data.length > 0) return;
    if (Array.isArray(typeIdentification) && typeIdentification.length > 0)
      return;
    reloadTypeIdentification(effectiveParams).catch(() => {});
  }, [
    data,
    effectiveParams,
    loadingTypeIdentification,
    reloadTypeIdentification,
    shouldAutoLoad,
    typeIdentification,
  ]);

  const items = useMemo(() => {
    const source =
      Array.isArray(data) && data.length ? data : typeIdentification;
    const normalized = (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((x) => ({
        id: String(x?.id ?? "").trim(),
        name: String(x?.name ?? "").trim(),
      }))
      .filter((x) => x.id && x.name);

    return normalized;
  }, [data, typeIdentification]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled || loadingTypeIdentification}
      >
        <option value="">
          {loadingTypeIdentification ? "Cargando tipos..." : placeholder}
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

export default TypeDocumentSelector;
