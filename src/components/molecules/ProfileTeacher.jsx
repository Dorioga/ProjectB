import { useState, useEffect } from "react";
import SimpleButton from "../atoms/SimpleButton";

const ProfileTeacher = ({ data = {}, onSave, initialEditing = false }) => {
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [form, setForm] = useState({
    first_name: data.first_name || "",
    second_name: data.second_name || "",
    first_lastname: data.first_lastname || "",
    second_lastname: data.second_lastname || "",
    telephone: data.telephone || "",
    email: data.email || "",
  });

  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    setForm({
      first_name: data.first_name || "",
      second_name: data.second_name || "",
      first_lastname: data.first_lastname || "",
      second_lastname: data.second_lastname || "",
      telephone: data.telephone || "",
      email: data.email || "",
    });
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // save
      if (typeof onSave === "function")
        onSave(data.id_docente ?? data.id ?? null, form);
    }
    setIsEditing((s) => !s);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <SimpleButton
          onClick={handleToggleEdit}
          msj={isEditing ? "Guardar" : "Editar"}
          icon={isEditing ? "Save" : "Pencil"}
          bg={isEditing ? "bg-accent" : "bg-secondary"}
          text="text-surface"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Primer nombre</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Segundo nombre</label>
          <input
            name="second_name"
            value={form.second_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Primer apellido</label>
          <input
            name="first_lastname"
            value={form.first_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Segundo apellido</label>
          <input
            name="second_lastname"
            value={form.second_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Teléfono</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Correo</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTeacher;
