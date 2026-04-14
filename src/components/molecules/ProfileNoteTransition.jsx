import { useState, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import useTeacher from "../../lib/hooks/useTeacher";
import { useNotify } from "../../lib/hooks/useNotify";

/**
 * ProfileNoteTransition – muestra y permite editar las notas de transición
 * de un docente, filtrando por grado/asignatura/periodo.
 *
 * Props:
 *  - initialNotes: Array de notas cargadas desde /transition/notes/data
 *    { id_nota_transicion, descripcion_nota, id_proposito, nombre_proposito, ... }
 *  - onClose: callback para cerrar el modal
 */
const ProfileNoteTransition = ({ initialNotes = [], onClose }) => {
  const { updateNoteTransition } = useTeacher();
  const notify = useNotify();

  const [records, setRecords] = useState(() =>
    initialNotes.map((n) => ({
      id_nota_transicion: n.id_nota_transicion,
      descripcion_nota: n.descripcion_nota ?? "",
      id_proposito: n.id_proposito,
      nombre_proposito: n.nombre_proposito ?? "-",
      estado_nota: n.estado_nota ?? "Activo",
      // campos originales para detectar cambios
      _orig_descripcion: n.descripcion_nota ?? "",
      _orig_estado: n.estado_nota ?? "Activo",
      editing: false,
      saving: false,
    })),
  );

  const handleEdit = useCallback((index) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, editing: true } : r)),
    );
  }, []);

  const handleCancel = useCallback((index) => {
    setRecords((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              descripcion_nota: r._orig_descripcion,
              estado_nota: r._orig_estado,
              editing: false,
            }
          : r,
      ),
    );
  }, []);

  const handleChange = useCallback((index, field, value) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }, []);

  const handleSave = useCallback(
    async (index) => {
      const rec = records[index];
      if (!rec.id_nota_transicion) {
        notify.error("Esta nota no tiene ID para actualizar.");
        return;
      }
      setRecords((prev) =>
        prev.map((r, i) => (i === index ? { ...r, saving: true } : r)),
      );
      try {
        await updateNoteTransition(rec.id_nota_transicion, {
          descripcion_nota: rec.descripcion_nota,
          estado_nota: rec.estado_nota,
        });
        setRecords((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  ...r,
                  saving: false,
                  editing: false,
                  _orig_descripcion: rec.descripcion_nota,
                  _orig_estado: rec.estado_nota,
                }
              : r,
          ),
        );
      } catch (err) {
        notify.error(err?.message ?? "Error al actualizar la nota.");
        setRecords((prev) =>
          prev.map((r, i) => (i === index ? { ...r, saving: false } : r)),
        );
      }
    },
    [records, updateNoteTransition, notify],
  );

  return (
    <div className="flex flex-col gap-4">
      {records.length === 0 && (
        <p className="text-center text-muted py-6">
          No hay notas de transición para mostrar.
        </p>
      )}

      {records.length > 0 && (
        <div className="overflow-x-auto rounded border border-surface-alt">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-surface text-left">
                <th className="px-3 py-2 font-semibold">ID</th>
                <th className="px-3 py-2 font-semibold">Propósito</th>
                <th className="px-3 py-2 font-semibold">Descripción</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => {
                const rowBg = idx % 2 === 0 ? "bg-surface" : "bg-surface-alt";
                return (
                  <tr key={rec.id_nota_transicion ?? idx} className={rowBg}>
                    <td className="px-3 py-2 text-muted text-xs">
                      {rec.id_nota_transicion ?? "-"}
                    </td>
                    <td className="px-3 py-2 max-w-[200px] wrap-break-word">
                      {rec.nombre_proposito}
                    </td>
                    <td className="px-3 py-2 min-w-[180px]">
                      {rec.editing ? (
                        <input
                          type="text"
                          value={rec.descripcion_nota}
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "descripcion_nota",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-2 py-1 text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={rec.saving}
                          autoFocus
                        />
                      ) : (
                        <span>{rec.descripcion_nota || "-"}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[120px]">
                      {rec.editing ? (
                        <select
                          value={rec.estado_nota}
                          onChange={(e) =>
                            handleChange(idx, "estado_nota", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1 text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={rec.saving}
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      ) : (
                        <span
                          className={
                            rec.estado_nota === "Activo"
                              ? "text-success font-semibold"
                              : "text-error font-semibold"
                          }
                        >
                          {rec.estado_nota}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 justify-center">
                        {rec.editing ? (
                          <>
                            <SimpleButton
                              type="button"
                              msj="Guardar"
                              icon="Save"
                              bg="bg-secondary"
                              text="text-surface"
                              disabled={rec.saving}
                              onClick={() => handleSave(idx)}
                            />
                            <SimpleButton
                              type="button"
                              msj="Cancelar"
                              icon="X"
                              bg="bg-error"
                              text="text-surface"
                              disabled={rec.saving}
                              onClick={() => handleCancel(idx)}
                            />
                          </>
                        ) : (
                          <SimpleButton
                            type="button"
                            msj="Editar"
                            icon="Pencil"
                            bg="bg-accent"
                            text="text-surface"
                            onClick={() => handleEdit(idx)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <SimpleButton
          type="button"
          msj="Cerrar"
          icon="X"
          bg="bg-primary"
          text="text-surface"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default ProfileNoteTransition;
