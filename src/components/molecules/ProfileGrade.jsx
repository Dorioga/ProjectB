import { useState, useEffect, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import JourneySelect from "../atoms/JourneySelect";
import tourProfileGrade from "../../tour/tourProfileGrade";

const ProfileGrade = ({ data, onSave, initialEditing = false }) => {
  const safeData = data || {};
  console.log("ProfileGrade - render - data prop:", data);
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isTourMode, setIsTourMode] = useState(false);

  const startTour = useCallback(() => {
    setIsTourMode(true);
    tourProfileGrade();
    const checkVisible = () =>
      !!document.querySelector(
        ".driver-popover, .driver-overlay, .driver-container, .driver",
      );
    const observer = new MutationObserver(() => {
      if (!checkVisible()) {
        setIsTourMode(false);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(
      () => {
        setIsTourMode(false);
        observer.disconnect();
      },
      3 * 60 * 1000,
    );
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const [form, setForm] = useState(() => {
    const wday =
      safeData.idWorkDay ??
      safeData.id_workday ??
      safeData.fk_workday ??
      safeData.fk_jornada ??
      null;
    return {
      nombre_grado: safeData.nombre_grado || safeData.name_grade || "",
      idWorkDay: wday != null ? String(wday) : "",
      grupo: safeData.grupo || safeData.name_group || "",
      estado: safeData.estado || "",
    };
  });
  console.log("ProfileGrade - data:", form);
  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    const d = data || {};
    const wday =
      d.idWorkDay ??
      d.id_workday ??
      d.fk_workday ??
      d.fk_jornada ??
      d.id_jornada ??
      d.workday ??
      null;
    setForm({
      nombre_grado: d.nombre_grado || d.name_grade || "",
      idWorkDay: wday != null ? String(wday) : "",
      grupo: d.grupo || d.name_group || "",
      estado: d.estado || "",
    });
    setErrors({});
  }, [data]);

  const validateForm = (showErrors = true) => {
    const next = {};
    if (!form.nombre_grado || !String(form.nombre_grado).trim()) {
      next.nombre_grado = "El nombre del grado es obligatorio.";
    }
    if (!form.idWorkDay && form.idWorkDay !== 0) {
      next.idWorkDay = "La jornada es obligatoria.";
    }
    if (!form.grupo || !String(form.grupo).trim()) {
      next.grupo = "El grupo es obligatorio.";
    }
    if (!form.estado || !String(form.estado).trim()) {
      next.estado = "El estado es obligatorio.";
    }
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

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

  const handleToggleEdit = async () => {
    if (isEditing) {
      const ok = validateForm(true);
      if (!ok) return;

      if (typeof onSave === "function") {
        setIsSaving(true);
        try {
          const payload = {
            nombre_grado: String(form.nombre_grado || "").trim(),
            idWorkDay: Number(form.idWorkDay),
            grupo: String(form.grupo || "").trim(),
            estado: form.estado || "",
          };
          await onSave(payload);
          setIsEditing(false);
          setErrors({});
        } catch (err) {
          console.error("ProfileGrade - save error:", err);
          throw err;
        } finally {
          setIsSaving(false);
        }
      } else {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div id="tour-pg-edit" className="flex justify-end gap-2">
        <SimpleButton
          type="button"
          onClick={startTour}
          icon="HelpCircle"
          msjtooltip="Iniciar tutorial"
          noRounded={false}
          bg="bg-info"
          text="text-surface"
          className="w-auto px-3 py-1.5"
        />
        <div className="w-40">
          <SimpleButton
            onClick={handleToggleEdit}
            msj={isSaving ? "Guardando..." : isEditing ? "Guardar" : "Editar"}
            icon={isEditing ? "Save" : "Pencil"}
            bg={isEditing ? "bg-accent" : "bg-secondary"}
            text="text-surface"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Datos de solo lectura (no editables) */}
      {(safeData.id_grado || safeData.id) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded border">
          {(safeData.id_grado || safeData.id) && (
            <div>
              <span className="font-semibold text-sm text-gray-500">
                ID Grado
              </span>
              <p className="mt-1 text-base">
                {safeData.id_grado ?? safeData.id}
              </p>
            </div>
          )}
          {safeData.workday_name && (
            <div>
              <span className="font-semibold text-sm text-gray-500">
                Jornada
              </span>
              <p className="mt-1 text-base">{safeData.workday_name}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del grado */}
        <div id="tour-pg-name">
          <label className="">Nombre del Grado</label>
          <input
            name="nombre_grado"
            value={form.nombre_grado}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${
              isEditing && !isSaving ? "" : "opacity-80 text-gray-700"
            }`}
            disabled={!isEditing || isSaving}
            placeholder="Ej: 6°"
          />
          {errors.nombre_grado && (
            <div className="text-sm text-red-600 mt-1">
              {errors.nombre_grado}
            </div>
          )}
        </div>

        {/* Grupo */}
        <div id="tour-pg-group">
          <label className="">Grupo</label>
          <input
            name="grupo"
            value={form.grupo}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${
              isEditing && !isSaving ? "" : "opacity-80 text-gray-700"
            }`}
            disabled={!isEditing || isSaving}
            placeholder="Ej: A"
          />
          {errors.grupo && (
            <div className="text-sm text-red-600 mt-1">{errors.grupo}</div>
          )}
        </div>

        {/* Jornada */}
        <div id="tour-pg-journey">
          <JourneySelect
            name="idWorkDay"
            value={form.idWorkDay}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, idWorkDay: e.target.value }))
            }
            className={`w-full p-2 border rounded bg-surface ${
              isEditing && !isSaving ? "" : "opacity-80 text-gray-700"
            }`}
            disabled={!isEditing || isSaving}
            includeAmbas={false}
          />
          {errors.idWorkDay && (
            <div className="text-sm text-red-600 mt-1">{errors.idWorkDay}</div>
          )}
        </div>

        {/* Estado */}
        <div id="tour-pg-status">
          <label className="">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${
              isEditing && !isSaving ? "" : "opacity-80 text-gray-700"
            }`}
            disabled={!isEditing || isSaving}
          >
            <option value="">Selecciona estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          {errors.estado && (
            <div className="text-sm text-red-600 mt-1">{errors.estado}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileGrade;
