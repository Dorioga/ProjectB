import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";

const BecaSelector = ({
  name = "fk_beca",
  label = "Beca",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona una beca",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  autoLoad = true,
}) => {
  const { statusBeca, loadingStatusBeca, reloadStatusBeca } = useData();

  // Cargar becas cuando se monta el componente
  useEffect(() => {
    if (autoLoad && (!statusBeca || statusBeca.length === 0)) {
      reloadStatusBeca().catch(() => {});
    }
  }, [autoLoad, reloadStatusBeca, statusBeca]);

  const becas = useMemo(() => {
    const source = Array.isArray(statusBeca) ? statusBeca : [];
    return source
      .filter(Boolean)
      .map((beca) => ({
        id: beca.id_beca || beca.id,
        nombre: beca.name || beca.nombre,
      }))
      .filter((b) => b.id && b.nombre);
  }, [statusBeca]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled || loadingStatusBeca}
      >
        <option value="">
          {loadingStatusBeca ? "Cargando becas..." : placeholder}
        </option>
        {becas.map((beca) => (
          <option key={beca.id} value={beca.id}>
            {beca.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BecaSelector;
