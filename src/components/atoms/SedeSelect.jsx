import React, { useEffect, useMemo } from "react";
import useSchool from "../../lib/hooks/useSchool";

const SedeSelect = ({
  name = "sedeId",
  label = "Sede",
  labelClassName = "",
  value = "",
  onChange,
  placeholder = "Selecciona una sede",
  className = "w-full p-2 border rounded bg-white",
  disabled = false,
  autoSelectPrincipal = false,
}) => {
  const { sedes, loadingSedes } = useSchool();

  const sedeOptions = useMemo(() => {
    const source = Array.isArray(sedes) ? sedes : [];

    const normalized = source
      .filter(Boolean)
      .map((sede) => {
        const id = String(sede?.id ?? "").trim();
        const nombre = String(sede?.nombre ?? "").trim();
        const tipo = String(sede?.tipo ?? "")
          .toUpperCase()
          .trim();
        const estado = String(sede?.estado ?? "")
          .toUpperCase()
          .trim();

        const isPrincipal = tipo === "PRINCIPAL";
        const isActive = estado === "ACTIVA";
        const labelBase = nombre || id || "Sede";
        const optionLabel = `${
          isPrincipal ? `Principal (${labelBase})` : labelBase
        }${isActive ? "" : " (Inactiva)"}`;

        return { id, label: optionLabel, isPrincipal, isActive };
      })
      .filter((opt) => opt.id);

    if (normalized.length === 0) {
      return [
        { id: "SED-PRINCIPAL", label: "Principal", isPrincipal: true },
        { id: "SED-EJ-01", label: "Sede A (ejemplo)", isPrincipal: false },
        { id: "SED-EJ-02", label: "Sede B (ejemplo)", isPrincipal: false },
      ];
    }

    return normalized.sort((a, b) => {
      if (a.isPrincipal !== b.isPrincipal) return a.isPrincipal ? -1 : 1;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
    });
  }, [sedes]);

  useEffect(() => {
    if (!autoSelectPrincipal) return;
    if (String(value ?? "").trim()) return;
    if (typeof onChange !== "function") return;

    const principal = sedeOptions.find((opt) => opt.isPrincipal);
    if (!principal) return;

    onChange({ target: { name, value: principal.id } });
  }, [autoSelectPrincipal, name, onChange, sedeOptions, value]);

  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled}
      >
        <option value="">
          {loadingSedes ? "Cargando sedes..." : placeholder}
        </option>
        {sedeOptions.map((sede) => (
          <option key={sede.id} value={sede.id}>
            {sede.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SedeSelect;
