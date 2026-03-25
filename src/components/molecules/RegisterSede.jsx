import { useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import JourneySelect from "../atoms/JourneySelect";
import { createSede } from "../../services/schoolService";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";

const EMPTY_SEDE = {
  nombre_sede: "",
  direccion: "",
  telefono: "",
  fk_jornada: "",
  sede_tip: "secundaria",
};

const RegisterSede = ({ onSuccess }) => {
  const { idInstitution } = useAuth();
  const notify = useNotify();

  const [sedes, setSedes] = useState([{ ...EMPTY_SEDE }]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleChange = (index, field, value) => {
    setSedes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((prev) => {
      const next = [...prev];
      if (next[index]) {
        const { [field]: _, ...rest } = next[index];
        next[index] = rest;
      }
      return next;
    });
  };

  const handleAddSede = () => {
    setSedes((prev) => [...prev, { ...EMPTY_SEDE }]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleRemoveSede = (index) => {
    if (sedes.length === 1) return;
    setSedes((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = sedes.map((s) => {
      const e = {};
      if (!String(s.nombre_sede || "").trim()) e.nombre_sede = "Requerido";
      if (!String(s.direccion || "").trim()) e.direccion = "Requerido";
      if (!String(s.telefono || "").trim()) e.telefono = "Requerido";
      if (!s.fk_jornada && s.fk_jornada !== 0) e.fk_jornada = "Requerido";
      return e;
    });
    setErrors(newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        sedes: sedes.map((s) => ({
          nombre_sede: String(s.nombre_sede).trim(),
          direccion: String(s.direccion).trim(),
          telefono: String(s.telefono).trim(),
          fk_jornada: Number(s.fk_jornada),
          fk_institucion: Number(idInstitution),
          sede_tip: String(s.sede_tip).trim(),
        })),
      };
      await createSede(payload);
      notify.success(
        `${payload.sedes.length} sede${payload.sedes.length > 1 ? "s" : ""} registrada${payload.sedes.length > 1 ? "s" : ""} exitosamente`,
      );
      setSedes([{ ...EMPTY_SEDE }]);
      setErrors([]);
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      console.error("RegisterSede - error al guardar:", err);
      notify.error(err?.message || "Error al registrar la sede");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {sedes.map((sede, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 bg-surface flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm opacity-70">
              Sede #{index + 1}
            </span>
            {sedes.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSede(index)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Eliminar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre sede */}
            <div>
              <label className="font-semibold text-sm">Nombre de la sede</label>
              <input
                type="text"
                value={sede.nombre_sede}
                onChange={(e) =>
                  handleChange(index, "nombre_sede", e.target.value)
                }
                className="w-full p-2 border rounded bg-surface mt-1"
                placeholder="Ej: Sede Central"
                disabled={isSaving}
              />
              {errors[index]?.nombre_sede && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].nombre_sede}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="font-semibold text-sm">Dirección</label>
              <input
                type="text"
                value={sede.direccion}
                onChange={(e) =>
                  handleChange(index, "direccion", e.target.value)
                }
                className="w-full p-2 border rounded bg-surface mt-1"
                placeholder="Ej: Carrera 4 # 10-20"
                disabled={isSaving}
              />
              {errors[index]?.direccion && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].direccion}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="font-semibold text-sm">Teléfono</label>
              <input
                type="tel"
                value={sede.telefono}
                onChange={(e) =>
                  handleChange(index, "telefono", e.target.value)
                }
                className="w-full p-2 border rounded bg-surface mt-1"
                placeholder="Ej: 3001234567"
                disabled={isSaving}
              />
              {errors[index]?.telefono && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].telefono}
                </p>
              )}
            </div>

            {/* Jornada */}
            <div>
              <JourneySelect
                label="Jornada"
                labelClassName="font-semibold text-sm"
                name={`fk_jornada_${index}`}
                value={sede.fk_jornada ? String(sede.fk_jornada) : ""}
                onChange={(e) =>
                  handleChange(index, "fk_jornada", e.target.value)
                }
                className="w-full p-2 border rounded bg-surface mt-1"
                disabled={isSaving}
              />
              {errors[index]?.fk_jornada && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].fk_jornada}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <SimpleButton
          type="button"
          onClick={handleAddSede}
          msj="Agregar otra sede"
          icon="Plus"
          bg="bg-secondary"
          text="text-surface"
          disabled={isSaving}
        />
        <SimpleButton
          type="button"
          onClick={handleSubmit}
          msj={isSaving ? "Guardando..." : "Guardar sedes"}
          icon={isSaving ? "Loader2" : "Save"}
          bg="bg-accent"
          text="text-surface"
          disabled={isSaving}
          className={isSaving ? "animate-pulse" : ""}
        />
      </div>
    </div>
  );
};

export default RegisterSede;
