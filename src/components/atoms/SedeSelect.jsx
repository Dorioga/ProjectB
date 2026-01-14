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
  data = null, // Permite pasar data manualmente (ej. para docentes)
}) => {
  const { institutionSedes, loadingInstitutionSedes, loadInstitutionSedes } =
    useData();
  const { idInstitution } = useAuth();

  // Cargar sedes cuando se monta el componente o cambia idInstitution
  useEffect(() => {
    // Si hay data manual, no cargar desde el contexto
    if (data) return;

    console.log("SedeSelect - idInstitution:", idInstitution);
    if (idInstitution) {
      console.log(
        "SedeSelect - Cargando sedes para institución:",
        idInstitution
      );

      loadInstitutionSedes(idInstitution).catch((err) => {
        console.error("SedeSelect - Error al cargar sedes:", err);
      });
    } else {
      console.warn("SedeSelect - No hay idInstitution disponible");
    }
  }, [idInstitution, loadInstitutionSedes, data]);

  const sedeOptions = useMemo(() => {
    // Si hay data manual (ej. para docentes), usar esa
    const source = data
      ? Array.isArray(data)
        ? data
        : []
      : Array.isArray(institutionSedes)
      ? institutionSedes
      : [];

    console.log("SedeSelect - institutionSedes:", institutionSedes);
    console.log("SedeSelect - data (manual):", data);
    console.log("SedeSelect - source length:", source.length);

    const normalized = source
      .filter(Boolean)
      .map((sede) => {
        const id = String(sede?.id ?? "").trim();
        const nombre = String(sede?.name ?? sede?.nombre ?? "").trim();

        const labelBase = nombre || id || "Sede";
        const optionLabel = labelBase;

        return { id, label: optionLabel, isPrincipal: false, isActive: true };
      })
      .filter((opt) => opt.id && opt.label);

    console.log("SedeSelect - normalized sedes:", normalized);

    // Solo mostrar datos de ejemplo si no hay data manual Y no hay sedes del contexto
    if (normalized.length === 0 && !data) {
      console.warn("SedeSelect - No hay sedes, mostrando datos de ejemplo");
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
  }, [institutionSedes, data]);

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
