import { useState, useEffect, useRef } from "react";
import SimpleButton from "../atoms/SimpleButton";

const ProfileSede = ({ data, onSave, initialEditing = false }) => {
  // data puede ser null mientras se carga; usar un objeto seguro
  const safeData = data || {};
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nombre_sede: safeData.nombre_sede || safeData.nombre || "",
    direccion: safeData.direccion || safeData.address || "",
    telefono: safeData.telefono || safeData.telefono_sede || "",
    estado: safeData.estado || safeData.status || "",
    fk_jornada: safeData.fk_jornada || safeData.fk_workday || "",
  });

  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    const d = data || {};
    setForm({
      nombre_sede: d.nombre_sede || d.nombre || "",
      direccion: d.direccion || d.address || "",
      telefono: d.telefono || d.telefono_sede || "",
      estado: d.estado || d.status || "",
      fk_jornada: d.fk_jornada || d.fk_workday || "",
    });
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      // save
      if (typeof onSave === "function") {
        const id = data?.id ?? data?.id_sede ?? null;
        setIsSaving(true);
        try {
          await onSave(id, form);
          // only exit edit mode on success
          setIsEditing(false);
        } catch (err) {
          console.error("ProfileSede - save error:", err);
          // keep editing if save failed
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

  // Auto resize textarea for nombre_sede
  useEffect(() => {
    if (nombreRef.current) {
      nombreRef.current.style.height = "auto";
      nombreRef.current.style.height = `${nombreRef.current.scrollHeight}px`;
    }
  }, [form.nombre_sede, isEditing]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Nombre Sede</label>
          <textarea
            ref={nombreRef}
            name="nombre_sede"
            value={form.nombre_sede}
            onChange={handleChange}
            rows={2}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
            style={{ resize: "none", overflow: "hidden" }}
            title={form.nombre_sede}
          />
        </div>

        <div>
          <label className="font-semibold">Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
          />
        </div>

        <div>
          <label className="font-semibold">Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
          />
        </div>

        <div>
          <label className="font-semibold">Estado</label>
          <input
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
          />
        </div>

        <div>
          <label className="font-semibold">ID Jornada</label>
          <input
            name="fk_jornada"
            value={form.fk_jornada}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-surface ${isEditing && !isSaving ? "ring-2 ring-accent/30" : "opacity-80 text-gray-700"}`}
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSede;
