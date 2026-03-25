import { useState, useEffect, useRef } from "react";
import SimpleButton from "../atoms/SimpleButton";

const ProfileAssignature = ({ data, onSave, initialEditing = false }) => {
  const safeData = data || {};
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name_asignature:
      safeData.nombre_asignatura || safeData.name_asignature || "",
    code_asignature:
      safeData.codigo_asignatura || safeData.code_asignature || "",
    description: safeData.descripcion || safeData.description || "",
    estado: safeData.estado || "",
  });

  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    const d = data || {};
    setForm({
      name_asignature: d.nombre_asignatura || d.name_asignature || "",
      code_asignature: d.codigo_asignatura || d.code_asignature || "",
      description: d.descripcion || d.description || "",
      estado: d.estado || "",
    });
    // limpiar errores cuando cambian los datos
    setErrors({});
  }, [data]);

  const validateForm = (showErrors = true) => {
    const next = {};
    if (!form.name_asignature || !String(form.name_asignature).trim()) {
      next.name_asignature = "El nombre de la asignatura es obligatorio.";
    }
    if (!form.code_asignature || !String(form.code_asignature).trim()) {
      next.code_asignature = "El código de la asignatura es obligatorio.";
    }
    if (!form.description || !String(form.description).trim()) {
      next.description = "La descripción es obligatoria.";
    }
    if (!form.estado || !String(form.estado).trim()) {
      next.estado = "El estado es obligatorio.";
    }

    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isFormValid =
    Boolean(form.name_asignature && String(form.name_asignature).trim()) &&
    Boolean(form.code_asignature && String(form.code_asignature).trim()) &&
    Boolean(form.description && String(form.description).trim()) &&
    Boolean(form.estado && String(form.estado).trim());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpiar error del campo al modificarlo
    setErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      // Before saving, validate required fields
      const ok = validateForm(true);
      if (!ok) return; // show errors and don't proceed

      if (typeof onSave === "function") {
        setIsSaving(true);
        try {
          const payload = {
            // payload con claves esperadas (campos en español)
            nombre_asignatura: String(form.name_asignature || "").trim(),
            codigo_asignatura: String(form.code_asignature || "").trim(),
            descripcion: String(form.description || "").trim(),
            estado: form.estado || "",
          };

          // Llamar callback con payload (ManageAsignature espera solo payload)
          await onSave(payload);

          // sólo salir de edición si el guardado fue exitoso
          setIsEditing(false);
          setErrors({});
        } catch (err) {
          console.error("ProfileAssignature - save error:", err);
          // mantener modo edición si falla
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

  const nombreRef = useRef(null);

  // Auto resize textarea para nombre
  useEffect(() => {
    if (nombreRef.current) {
      nombreRef.current.style.height = "auto";
      nombreRef.current.style.height = `${nombreRef.current.scrollHeight}px`;
    }
  }, [form.name_asignature, isEditing]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-semibold">Nombre Asignatura</label>
          <input
            ref={nombreRef}
            name="name_asignature"
            value={form.name_asignature}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
            title={form.name_asignature}
          />
          {errors.name_asignature && (
            <div className="text-sm text-red-600 mt-1">
              {errors.name_asignature}
            </div>
          )}
        </div>
        <div>
          <label className="font-semibold">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
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

        <div>
          <label className="font-semibold">Código</label>
          <input
            name="code_asignature"
            value={form.code_asignature}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
          />
          {errors.code_asignature && (
            <div className="text-sm text-red-600 mt-1">
              {errors.code_asignature}
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <label className="font-semibold">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
            style={{ resize: "vertical" }}
          />
          {errors.description && (
            <div className="text-sm text-red-600 mt-1">
              {errors.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAssignature;
