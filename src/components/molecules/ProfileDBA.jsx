import { useCallback, useEffect, useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import Loader from "../atoms/Loader";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

/**
 * ProfileDBA – muestra los DBA de un propósito con modo edición.
 *
 * Props:
 *  - purposeId   : id del propósito (fk_bank_purpose)
 *  - purposeName : nombre del propósito (para el encabezado)
 *  - onClose     : callback para cerrar el modal
 */
const ProfileDBA = ({ purposeId, purposeName, onClose }) => {
  const { getDbasByPurposeInstitution } = useData();
  const notify = useNotify();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modo edición global
  const [isEditing, setIsEditing] = useState(false);
  // Copia de trabajo: { [id_dba]: { nombre_dba, estado_dba } }
  const [editValues, setEditValues] = useState({});

  // ── Cargar DBA al montar ──────────────────────────────────────────────────
  const loadDbas = useCallback(async () => {
    if (!purposeId) return;
    setLoading(true);
    try {
      const res = await getDbasByPurposeInstitution(purposeId);
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("ProfileDBA - error cargando DBA:", err);
      notify.error("Error al cargar los DBA del propósito.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [purposeId, getDbasByPurposeInstitution, notify]);

  useEffect(() => {
    loadDbas();
  }, [loadDbas]);

  // ── Activar/cancelar edición ──────────────────────────────────────────────
  const handleToggleEdit = () => {
    if (!isEditing) {
      // Inicializar copia de trabajo con valores actuales
      const initial = {};
      items.forEach((item) => {
        initial[item.id_dba] = {
          nombre_dba: item.nombre_dba ?? "",
          estado_dba: item.estado_dba ?? "Activo",
        };
      });
      setEditValues(initial);
    }
    setIsEditing((prev) => !prev);
  };

  // ── Cambio en un campo de edición ─────────────────────────────────────────
  const handleFieldChange = (id, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // ── Guardar cambios (actualiza estado local; conectar a PATCH cuando esté disponible) ──
  const handleSave = () => {
    setItems((prev) =>
      prev.map((item) => {
        const draft = editValues[item.id_dba];
        if (!draft) return item;
        return {
          ...item,
          nombre_dba: draft.nombre_dba,
          estado_dba: draft.estado_dba,
        };
      }),
    );
    setIsEditing(false);
    notify.success("Cambios aplicados localmente.");
  };

  // ── Formato de fecha ──────────────────────────────────────────────────────
  const formatDate = (raw) => {
    if (!raw) return "—";
    try {
      return new Date(raw).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return raw;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-text/60">Propósito</p>
          <p className="font-semibold text-text">
            {purposeName ?? `ID ${purposeId}`}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <SimpleButton
                type="button"
                msj="Guardar"
                icon="Save"
                bg="bg-secondary"
                text="text-surface"
                onClick={handleSave}
              />
              <SimpleButton
                type="button"
                msj="Cancelar"
                icon="X"
                bg="bg-orange-500"
                text="text-white"
                onClick={handleToggleEdit}
              />
            </>
          ) : (
            <SimpleButton
              type="button"
              msj="Editar"
              icon="Pencil"
              bg="bg-primary"
              text="text-surface"
              onClick={handleToggleEdit}
              disabled={loading || items.length === 0}
            />
          )}
        </div>
      </div>

      {/* ── Lista de DBA ─────────────────────────────────────────────────── */}
      {loading ? (
        <Loader message="Cargando DBA..." size={64} />
      ) : items.length === 0 ? (
        <p className="text-center text-text/50 py-6">
          No hay DBA registrados para este propósito.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-text/70">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Nombre DBA</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const draft = editValues[item.id_dba];
                const isInactivo =
                  (isEditing ? draft?.estado_dba : item.estado_dba) ===
                  "Inactivo";
                return (
                  <tr
                    key={item.id_dba}
                    className={`border-t border-border transition-colors ${
                      isInactivo
                        ? "opacity-50 bg-surface2"
                        : "hover:bg-surface2/50"
                    }`}
                  >
                    {/* ID / índice */}
                    <td className="px-3 py-2 text-text/50 shrink-0">
                      {idx + 1}
                    </td>

                    {/* Nombre DBA */}
                    <td className="px-3 py-2 text-text">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draft?.nombre_dba ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.id_dba,
                              "nombre_dba",
                              e.target.value,
                            )
                          }
                          className="w-full min-w-[200px] border border-border rounded px-2 py-1 bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        (item.nombre_dba ?? "—")
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <select
                          value={draft?.estado_dba ?? "Activo"}
                          onChange={(e) =>
                            handleFieldChange(
                              item.id_dba,
                              "estado_dba",
                              e.target.value,
                            )
                          }
                          className="border border-border rounded px-2 py-1 bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.estado_dba === "Activo"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {item.estado_dba ?? "—"}
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-3 py-2 text-text/70 whitespace-nowrap">
                      {formatDate(item.fecha_dba)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pie: cerrar ──────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <SimpleButton
          type="button"
          msj="Cerrar"
          icon="X"
          bg="bg-surface2"
          text="text-text"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default ProfileDBA;
