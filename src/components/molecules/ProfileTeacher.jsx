import { useState, useEffect, useRef, useMemo } from "react";
import SimpleButton from "../atoms/SimpleButton";

const ProfileTeacher = ({
  data = {},
  onSave,
  initialEditing = false,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [form, setForm] = useState({
    first_name: data.first_name || "",
    second_name: data.second_name || "",
    first_lastname: data.first_lastname || "",
    second_lastname: data.second_lastname || "",
    telephone: data.telefono || data.telephone || "",
    email: data.correo || data.email || "",
  });

  const [estado, setEstado] = useState(data.estado || "");

  const originalRef = useRef({ form: null, estado: null });

  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    const initialForm = {
      first_name: data.first_name || "",
      second_name: data.second_name || "",
      first_lastname: data.first_lastname || "",
      second_lastname: data.second_lastname || "",
      telephone: data.telefono || data.telephone || "",
      email: data.correo || data.email || "",
    };
    setForm(initialForm);
    setEstado(data.estado || "");
    originalRef.current = { form: initialForm, estado: data.estado || "" };
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e) => {
    const newVal = e.target.value;
    if (newVal === estado) return;
    const ok = window.confirm(`¿Confirmas cambiar el estado a "${newVal}"?`);
    if (ok) setEstado(newVal);
  };

  const handleStartEdit = () => setIsEditing(true);

  const handleCancel = () => {
    // reset to original
    const orig = originalRef.current || {};
    setForm(
      orig.form || {
        first_name: data.first_name || "",
        second_name: data.second_name || "",
        first_lastname: data.first_lastname || "",
        second_lastname: data.second_lastname || "",
        telephone: data.telefono || data.telephone || "",
        email: data.correo || data.email || "",
      },
    );
    setEstado(orig.estado || data.estado || "");
    setIsEditing(false);
    if (typeof onClose === "function") onClose();
  };

  const isDirty = useMemo(() => {
    const orig = originalRef.current || { form: null, estado: null };
    const formChanged =
      JSON.stringify(orig.form || {}) !== JSON.stringify(form || {});
    const estadoChanged = (orig.estado || "") !== (estado || "");
    return formChanged || estadoChanged;
  }, [form, estado]);

  const handleSave = async () => {
    if (!isDirty) return;

    const payload = {
      first_name: form.first_name,
      second_name: form.second_name,
      first_lastname: form.first_lastname,
      second_lastname: form.second_lastname,
      telefono: form.telephone,
      correo: form.email,
      estado,
    };

    if (typeof onSave === "function") {
      await onSave(data.id_docente ?? data.id ?? null, payload);
    }

    // actualizar snapshot
    originalRef.current = { form: { ...form }, estado };
    setIsEditing(false);
  };

  return (
    <div
      className={`w-full flex flex-col gap-4 ${isEditing ? "ring-2 ring-primary/30 rounded-md p-2" : ""}`}
    >
      <div className="grid grid-cols-5 items-center gap-4">
        <div className="col-span-4 flex items-center gap-3">
          <h3 className="font-bold text-xl">Información basica del docente</h3>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${isEditing ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
          >
            {isEditing ? "Modo edición" : "Solo lectura"}
          </span>
        </div>
        {!isEditing && (
          <SimpleButton
            onClick={handleStartEdit}
            msj={"Editar"}
            icon={"Pencil"}
            bg={"bg-secondary"}
            text="text-surface"
          />
        )}
      </div>

      {/* 1) Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Primer nombre</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Segundo nombre</label>
          <input
            name="second_name"
            value={form.second_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Primer apellido</label>
          <input
            name="first_lastname"
            value={form.first_lastname}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Segundo apellido</label>
          <input
            name="second_lastname"
            value={form.second_lastname}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Teléfono</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Correo</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* 2) Asignaturas/Groups */}
      <div className="p-4 border rounded bg-surface">
        <h4 className="font-semibold mb-2">Asignaturas por Grupo</h4>
        {Array.isArray(data?.groups) && data.groups.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {data.groups.map((grp) => (
              <div key={grp.grupo} className="p-2 bg-white border rounded">
                <div className="font-medium">Grupo: {grp.grupo}</div>
                <div className="mt-2 grid gap-2">
                  {grp.assignments.map((a) => (
                    <div
                      key={`${a.id_asignatura}-${a.nombre_grado}`}
                      className="p-2 border rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{a.asignatura}</div>
                        <div className="text-sm text-gray-600">
                          Grado: {a.nombre_grado}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {a.id_asignatura}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Array.isArray(data?.subjects) && data.subjects.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {data.subjects.map((s) => (
              <div
                key={s.id_asignatura}
                className="p-2 bg-white border rounded"
              >
                <div className="font-medium">{s.asignatura}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {Array.isArray(s.groups) && s.groups.length > 0 ? (
                    s.groups.map((grp, gi) => (
                      <div key={gi} className="mb-1">
                        <div className="font-medium text-xs">
                          Grupo: {grp.grupo}
                        </div>
                        <div className="text-xs ml-2">
                          {(Array.isArray(grp.grados) ? grp.grados : []).join(
                            ", ",
                          )}
                        </div>
                      </div>
                    ))
                  ) : Array.isArray(s.grades) && s.grades.length > 0 ? (
                    s.grades.map((g, gi) => (
                      <div key={gi}>
                        Grado: {g.nombre_grado} — Grupo: {g.grupo}
                      </div>
                    ))
                  ) : (
                    <div>No hay información de grados</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            No hay asignaturas registradas.
          </div>
        )}
      </div>

      {/* 3) Estado */}
      <div className="p-4 border rounded bg-surface">
        <h4 className="font-semibold mb-2">Estado del docente</h4>
        <select
          value={estado}
          onChange={handleEstadoChange}
          className={`p-2 border rounded w-48 ${isEditing ? "bg-white border-gray-300" : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed"}`}
          disabled={!isEditing}
        >
          <option value="Activo">Activo</option>
          <option value="Desactivado">Desactivado</option>
        </select>
      </div>

      {/* 4) Botones */}
      <div className="flex gap-3 justify-end">
        <SimpleButton
          msj="Cancelar"
          bg="bg-surface"
          text="text-primary"
          onClick={handleCancel}
        />
        <div className="flex items-center gap-3">
          <SimpleButton
            msj="Guardar"
            msjtooltip={!isEditing || !isDirty ? "Sin cambios" : null}
            tooltip={!isEditing || !isDirty}
            bg="bg-accent"
            text="text-surface"
            onClick={handleSave}
            disabled={!isEditing || !isDirty}
          />
          {!isEditing || !isDirty ? (
            <span className="text-sm text-gray-500">Sin cambios</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileTeacher;
