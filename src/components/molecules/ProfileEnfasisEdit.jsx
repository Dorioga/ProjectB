import { useState, useEffect, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import JourneySelect from "../atoms/JourneySelect";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getAreasByMode,
  updateEnfasisAsignatura,
} from "../../services/enfasisService";

const ProfileEnfasisEdit = ({ initialData, modalidadId, onSave, onClose }) => {
  const notify = useNotify();
  const safeData = initialData || {};

  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [form, setForm] = useState({
    name: "",
    state: "Activo",
    area: "",
    intensidad: "",
    workday: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: safeData.name_asignatura_enfasis ?? "",
      state: safeData.state_asignatura_enfasis ?? "Activo",
      area: safeData.fk_area_enfasis ?? "",
      intensidad: safeData.intensidad_horaria ?? "",
      workday: safeData.fk_workday ?? "",
    });
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    if (!modalidadId) {
      setAreas([]);
      return;
    }
    let mounted = true;
    setLoadingAreas(true);
    getAreasByMode(modalidadId)
      .then((res) => {
        if (mounted) setAreas(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("ProfileEnfasisEdit - getAreasByMode error:", err);
        if (mounted) setAreas([]);
      })
      .finally(() => {
        if (mounted) setLoadingAreas(false);
      });
    return () => {
      mounted = false;
    };
  }, [modalidadId]);

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
      next.name = "El nombre de la asignatura es obligatorio.";
    }
    if (!String(form.area ?? "").trim()) next.area = "Selecciona un área.";
    if (!String(form.workday ?? "").trim())
      next.workday = "Selecciona una jornada.";
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm(true)) return;
    setSaving(true);
    try {
      await updateEnfasisAsignatura({
        name: String(form.name).trim(),
        state: form.state || "Activo",
        area: Number(form.area),
        intensidad: form.intensidad ? Number(form.intensidad) : null,
        workday: Number(form.workday),
        id: Number(safeData.id_asignatura_enfasis),
      });
      notify.success("Asignatura de énfasis actualizada exitosamente.");
      if (typeof onSave === "function") onSave();
    } catch (err) {
      console.error("ProfileEnfasisEdit - updateEnfasisAsignatura error:", err);
      notify.error(err?.message || "Error al actualizar la asignatura.");
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, safeData, onSave, notify]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="font-semibold">Nombre asignatura</label>
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
          <label className="font-semibold">Área</label>
          <select
            name="area"
            value={form.area}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingAreas ? "Cargando áreas..." : "Selecciona un área"}
            </option>
            {!loadingAreas &&
              areas.map((a) => (
                <option key={a.id_area_enfasis} value={a.id_area_enfasis}>
                  {a.name_area_enfasis ?? a.name ?? a.nombre ?? a.id_area_enfasis}
                </option>
              ))}
          </select>
          {errors.area && (
            <div className="text-sm text-red-600 mt-1">{errors.area}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">Intensidad horaria</label>
          <input
            name="intensidad"
            type="number"
            min="0"
            value={form.intensidad}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <JourneySelect
            name="workday"
            labelClassName="font-semibold"
            value={form.workday}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.workday && (
            <div className="text-sm text-red-600 mt-1">{errors.workday}</div>
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

export default ProfileEnfasisEdit;