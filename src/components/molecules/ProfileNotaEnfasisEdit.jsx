import { useState, useEffect, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import PeriodSelector from "../atoms/PeriodSelector";
import { useNotify } from "../../lib/hooks/useNotify";
import { updateNotaEnfasis } from "../../services/enfasisService";

const ProfileNotaEnfasisEdit = ({
  initialData,
  asignaturas,
  onSave,
  onClose,
}) => {
  const notify = useNotify();
  const safeData = initialData || {};

  const [form, setForm] = useState({
    name: "",
    state: "Activo",
    porcentaje: "",
    logro: "",
    asignatura: "",
    periodo: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: safeData.name_nota_asignatura_enfasis ?? "",
      state: safeData.state_nota_asignatura_enfasis ?? "Activo",
      porcentaje: safeData.porcentaje_nota_asignatura_enfasis ?? "",
      logro: safeData.logro_nota_asignatura_enfasis ?? "",
      asignatura: safeData.id_asignatura_enfasis ?? "",
      periodo: safeData.id_periodo ?? "",
    });
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateForm = (showErrors = true) => {
    const next = {};
    if (!String(form.name ?? "").trim()) {
      next.name = "El nombre de la nota es obligatorio.";
    }
    if (form.porcentaje === "" || form.porcentaje == null) {
      next.porcentaje = "El porcentaje es obligatorio.";
    }
    if (!String(form.asignatura ?? "").trim()) {
      next.asignatura = "Selecciona una asignatura.";
    }
    if (!String(form.periodo ?? "").trim()) {
      next.periodo = "Selecciona un período.";
    }
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm(true)) return;
    setSaving(true);
    try {
      await updateNotaEnfasis({
        name: String(form.name).trim(),
        state: form.state || "Activo",
        porcentaje: Number(form.porcentaje),
        logro: String(form.logro ?? "").trim(),
        asignatura: Number(form.asignatura),
        periodo: Number(form.periodo),
        id: Number(safeData.id_nota_asignatura_enfasis),
      });
      notify.success("Nota actualizada exitosamente.");
      if (typeof onSave === "function") onSave();
    } catch (err) {
      console.error("ProfileNotaEnfasisEdit - updateNotaEnfasis error:", err);
      notify.error(err?.message || "Error al actualizar la nota.");
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, safeData, onSave, notify]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="font-semibold">Nombre de la nota</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.name && (
            <div className="text-sm text-red-600 mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">Estado</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Porcentaje</label>
          <input
            name="porcentaje"
            type="number"
            min="0"
            step="0.01"
            value={form.porcentaje}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.porcentaje && (
            <div className="text-sm text-red-600 mt-1">
              {errors.porcentaje}
            </div>
          )}
        </div>

        <div>
          <label className="font-semibold">Logro</label>
          <input
            name="logro"
            value={form.logro}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label className="font-semibold">Asignatura</label>
          <select
            name="asignatura"
            value={form.asignatura}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">Selecciona asignatura</option>
            {Array.isArray(asignaturas) &&
              asignaturas.map((a) => (
                <option
                  key={a.id_asignatura_enfasis}
                  value={a.id_asignatura_enfasis}
                >
                  {a.name_asignatura_enfasis}
                </option>
              ))}
          </select>
          {errors.asignatura && (
            <div className="text-sm text-red-600 mt-1">
              {errors.asignatura}
            </div>
          )}
        </div>

        <div>
          <PeriodSelector
            labelClassName="font-semibold"
            value={form.periodo}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            autoLoad={true}
          />
          {errors.periodo && (
            <div className="text-sm text-red-600 mt-1">{errors.periodo}</div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <div className="w-36">
          <SimpleButton
            type="button"
            onClick={onClose}
            msj="Cancelar"
            icon="X"
            bg="bg-gray-200"
            text="text-gray-700"
            noRounded={false}
          />
        </div>
        <div className="w-44">
          <SimpleButton
            onClick={handleSubmit}
            msj={saving ? "Guardando..." : "Guardar"}
            icon={saving ? "Loader" : "Save"}
            bg="bg-primary"
            text="text-surface"
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileNotaEnfasisEdit;