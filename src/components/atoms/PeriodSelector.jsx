import React, { useEffect, useMemo, useState } from "react";
import useSchool from "../../lib/hooks/useSchool";

const PeriodSelector = ({
  name = "periodId",
  label = "Período",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona un período",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  autoLoad = true,
}) => {
  const { periods, loadingPeriods, loadPeriods } = useSchool();
  const [localLoading, setLocalLoading] = useState(false);

  // Cargar períodos cuando se monta el componente
  useEffect(() => {
    if (!autoLoad) return;

    const loadData = async () => {
      setLocalLoading(true);
      try {
        console.log("PeriodSelector - Cargando períodos");
        await loadPeriods();
      } catch (err) {
        console.error("PeriodSelector - Error al cargar períodos:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    // Solo cargar si no hay períodos ya cargados
    if (!periods || periods.length === 0) {
      loadData();
    }
  }, [autoLoad, loadPeriods, periods]);

  const periodOptions = useMemo(() => {
    if (!Array.isArray(periods)) return [];

    return periods
      .filter(Boolean)
      .map((period) => ({
        id: period.id_periodo || period.id || period.id_period,
        nombre:
          period.nombre_periodo ||
          period.nombre ||
          period.name ||
          period.periodo ||
          period.period ||
          "",
      }))
      .filter((p) => p.id && p.nombre);
  }, [periods]);

  const isLoading = localLoading || loadingPeriods;

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    console.log("PeriodSelector - Período seleccionado:", selectedValue);

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className={labelClassName || "block text-sm font-medium mb-1"}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className={className}
        aria-label={label}
      >
        <option value="">
          {isLoading ? "Cargando períodos..." : placeholder}
        </option>
        {periodOptions.map((period) => (
          <option key={period.id} value={period.id}>
            {period.nombre}
          </option>
        ))}
      </select>
      {isLoading && (
        <p className="text-xs text-gray-500 mt-1">Cargando períodos...</p>
      )}
      {!isLoading && periodOptions.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          No hay períodos disponibles
        </p>
      )}
    </div>
  );
};

export default PeriodSelector;
