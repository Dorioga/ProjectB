import React, { useEffect, useMemo } from "react";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";

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
  const { institutionSedes, loadingInstitutionSedes, loadInstitutionSedes } =
    useData();
  const { idInstitution } = useAuth();

  // Cargar sedes cuando se monta el componente o cambia idInstitution
  useEffect(() => {
    if (idInstitution) {
      loadInstitutionSedes(idInstitution).catch(() => {});
    }
  }, [idInstitution, loadInstitutionSedes]);

  const sedeOptions = useMemo(() => {
    const source = Array.isArray(institutionSedes) ? institutionSedes : [];

    const normalized = source
      .filter(Boolean)
      .map((sede) => {
        const id = String(sede?.id ?? "").trim();
        const nombre = String(sede?.nombre ?? "").trim();

        const labelBase = nombre || id || "Sede";
        const optionLabel = labelBase;

        return { id, label: optionLabel, isPrincipal: false, isActive: true };
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
  }, [institutionSedes]);

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
          {loadingInstitutionSedes ? "Cargando sedes..." : placeholder}
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
