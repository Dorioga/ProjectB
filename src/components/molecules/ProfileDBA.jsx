import { useCallback, useEffect, useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import Loader from "../atoms/Loader";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";
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
  const {
    getDbasByPurposeInstitution,
    getPurposes,
    transitionPurpose,
    transitionDba,
    registerPurposes,
  } = useData();
  const { idInstitution, idDocente } = useAuth();
  const notify = useNotify();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Edición del propósito ─────────────────────────────────────────────────
  const [editingPurpose, setEditingPurpose] = useState(false);
  const [purposeDraft, setPurposeDraft] = useState(purposeName ?? "");
  const [displayName, setDisplayName] = useState(purposeName ?? "");
  // Select de propósitos
  const [purposes, setPurposes] = useState([]);
  const [loadingPurposes, setLoadingPurposes] = useState(false);
  const [selectedPurposeId, setSelectedPurposeId] = useState(purposeId);
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [savingPurpose, setSavingPurpose] = useState(false);

  // ID de la fila en edición (null = ninguna)
  const [editingId, setEditingId] = useState(null);
  // Copia de trabajo para la fila activa: { nombre_dba, estado_dba }
  const [editDraft, setEditDraft] = useState({});
  const [savingDba, setSavingDba] = useState(false);

  // ── Agregar nuevos DBA ────────────────────────────────────────────────────
  const [showAddDba, setShowAddDba] = useState(false);
  const [newDbaCount, setNewDbaCount] = useState("");
  const [newDbaList, setNewDbaList] = useState([]);
  const [savingNewDba, setSavingNewDba] = useState(false);

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

  // ── Cargar propósitos cuando se abre el modo edición ─────────────────────
  const loadPurposes = useCallback(async () => {
    if (!idInstitution || !getPurposes) return;
    setLoadingPurposes(true);
    try {
      const res = await getPurposes(idInstitution);
      setPurposes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("ProfileDBA - error cargando propósitos:", err);
      notify.error("Error al cargar los propósitos.");
    } finally {
      setLoadingPurposes(false);
    }
  }, [idInstitution, getPurposes, notify]);

  const handleOpenEditPurpose = useCallback(() => {
    setSelectedPurposeId(purposeId);
    setPurposeDraft(displayName);
    setShowChangeWarning(false);
    setEditingPurpose(true);
    loadPurposes();
  }, [purposeId, displayName, loadPurposes]);

  // ── Cambio en el select de propósito ────────────────────────────────────
  const handlePurposeSelectChange = (newId) => {
    const id = Number(newId);
    setSelectedPurposeId(id);
    if (id !== purposeId) {
      setShowChangeWarning(true);
      const found = purposes.find((p) => (p.id_proposito ?? p.id) === id);
      if (found) {
        setPurposeDraft(found.nombre_proposito ?? found.nombre ?? "");
      }
    } else {
      setShowChangeWarning(false);
      setPurposeDraft(displayName);
    }
  };

  // ── Guardar propósito ────────────────────────────────────────────────────
  const handleSavePurpose = async () => {
    setSavingPurpose(true);
    try {
      const estadoProposito = showChangeWarning ? "Inactivo" : "Activo";

      // Actualizar el propósito actual
      await transitionPurpose(purposeId, {
        nombre_proposito: purposeDraft,
        estado_proposito: estadoProposito,
      });

      // Si cambió el propósito seleccionado, inactivar todos los DBA
      if (showChangeWarning && items.length > 0) {
        await Promise.all(
          items.map((item) =>
            transitionDba(item.id_dba, {
              nombre_dba: item.nombre_dba ?? "",
              estado_dba: "Inactivo",
            }),
          ),
        );
        setItems((prev) =>
          prev.map((item) => ({ ...item, estado_dba: "Inactivo" })),
        );
      }

      setDisplayName(purposeDraft);
      setEditingPurpose(false);
      setShowChangeWarning(false);
      notify.success("Propósito actualizado correctamente.");
    } catch (err) {
      console.error("ProfileDBA - error guardando propósito:", err);
      notify.error("Error al actualizar el propósito.");
    } finally {
      setSavingPurpose(false);
    }
  };

  const handleCancelEditPurpose = () => {
    setPurposeDraft(displayName);
    setSelectedPurposeId(purposeId);
    setShowChangeWarning(false);
    setEditingPurpose(false);
  };

  // ── Activar edición de una fila ──────────────────────────────────────────
  const handleStartEdit = (item) => {
    setEditingId(item.id_dba);
    setEditDraft({
      nombre_dba: item.nombre_dba ?? "",
      estado_dba: item.estado_dba ?? "Activo",
    });
  };

  // ── Cancelar edición ──────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  // ── Cambio en un campo de la fila activa ──────────────────────────────────
  const handleFieldChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  // ── Guardar cambios de la fila activa ─────────────────────────────────────
  const handleSave = async () => {
    setSavingDba(true);
    try {
      await transitionDba(editingId, {
        nombre_dba: editDraft.nombre_dba,
        estado_dba: editDraft.estado_dba,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id_dba === editingId
            ? {
                ...item,
                nombre_dba: editDraft.nombre_dba,
                estado_dba: editDraft.estado_dba,
              }
            : item,
        ),
      );
      setEditingId(null);
      setEditDraft({});
      notify.success("DBA actualizado correctamente.");
    } catch (err) {
      console.error("ProfileDBA - error guardando DBA:", err);
      notify.error("Error al actualizar el DBA.");
    } finally {
      setSavingDba(false);
    }
  };

  // ── Generar campos de nuevos DBA ──────────────────────────────────────────
  const handleGenerateNewDba = () => {
    const n = parseInt(newDbaCount, 10);
    if (!n || n < 1 || n > 50) {
      notify.warning("Ingresa una cantidad válida (1–50).");
      return;
    }
    setNewDbaList(Array.from({ length: n }, () => ({ nombre: "" })));
  };

  const handleNewDbaChange = (idx, value) => {
    setNewDbaList((prev) => {
      const next = [...prev];
      next[idx] = { nombre: value };
      return next;
    });
  };

  const handleSaveNewDba = async () => {
    if (newDbaList.length === 0) {
      notify.warning("Genera al menos un DBA antes de guardar.");
      return;
    }
    for (let i = 0; i < newDbaList.length; i++) {
      if (!newDbaList[i].nombre.trim()) {
        notify.warning(`El DBA #${i + 1} no tiene nombre.`);
        return;
      }
    }
    setSavingNewDba(true);
    try {
      const found = purposes.find(
        (p) => (p.id_proposito ?? p.id) === purposeId,
      );
      const nombreProposito =
        found?.nombre_proposito ?? found?.nombre ?? displayName;
      await registerPurposes({
        fk_institucion: idInstitution ? Number(idInstitution) : undefined,
        fk_docente: idDocente ? Number(idDocente) : undefined,
        propositos: [
          {
            name_proposito: nombreProposito,
            dba: newDbaList.map((d) => ({ nombre_dba: d.nombre.trim() })),
          },
        ],
      });
      notify.success(
        `${newDbaList.length} DBA agregado${newDbaList.length !== 1 ? "s" : ""} correctamente.`,
      );
      setShowAddDba(false);
      setNewDbaCount("");
      setNewDbaList([]);
      await loadDbas();
    } catch (err) {
      console.error("ProfileDBA - error agregando DBA:", err);
      notify.error(err?.message || "Error al agregar los DBA.");
    } finally {
      setSavingNewDba(false);
    }
  };

  const handleCancelNewDba = () => {
    setShowAddDba(false);
    setNewDbaCount("");
    setNewDbaList([]);
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
        <div className="flex-1">
          <p className="text-sm text-text/60">Propósito</p>
          {editingPurpose ? (
            <div className="flex flex-col gap-2 mt-1">
              {/* Select de propósitos */}
              {loadingPurposes ? (
                <p className="text-sm text-text/50">Cargando propósitos...</p>
              ) : (
                <select
                  value={selectedPurposeId ?? ""}
                  onChange={(e) => handlePurposeSelectChange(e.target.value)}
                  className="border border-border rounded px-2 py-1 bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-sm"
                >
                  {purposes.map((p) => {
                    const id = p.id_proposito ?? p.id;
                    const nombre = p.nombre_proposito ?? p.nombre ?? `ID ${id}`;
                    return (
                      <option key={id} value={id}>
                        {nombre}
                      </option>
                    );
                  })}
                </select>
              )}
              {/* Input nombre editable */}
              <input
                type="text"
                value={purposeDraft}
                onChange={(e) => setPurposeDraft(e.target.value)}
                className="border border-border rounded px-2 py-1 bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-sm"
                placeholder="Nombre del propósito"
              />
              {/* Advertencia de cambio */}
              {showChangeWarning && (
                <div className="flex items-start gap-2 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 max-w-sm">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>
                    Si cambias el propósito,{" "}
                    <strong>
                      todos los DBA actuales pasarán a estado Inactivo
                    </strong>{" "}
                    y los valores actuales se perderán.
                  </span>
                </div>
              )}
              {/* Acciones */}
              <div className="flex gap-2">
                <SimpleButton
                  type="button"
                  msj="Guardar"
                  icon="Save"
                  bg="bg-secondary"
                  text="text-surface"
                  onClick={handleSavePurpose}
                  disabled={savingPurpose}
                />
                <SimpleButton
                  type="button"
                  msj="Cancelar"
                  icon="X"
                  bg="bg-orange-500"
                  text="text-white"
                  onClick={handleCancelEditPurpose}
                  disabled={savingPurpose}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <p className="font-semibold text-text">
                {displayName || `ID ${purposeId}`}
              </p>
              <SimpleButton
                type="button"
                msj="Editar"
                icon="Pencil"
                bg="bg-primary"
                text="text-surface"
                onClick={handleOpenEditPurpose}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Agregar nuevos DBA ─────────────────────────────────────────── */}
      <div className="border border-border rounded-lg p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Agregar DBA</p>
          {!showAddDba && (
            <SimpleButton
              type="button"
              msj="Agregar"
              icon="Plus"
              bg="bg-primary"
              text="text-surface"
              onClick={() => {
                setShowAddDba(true);
                loadPurposes();
              }}
            />
          )}
        </div>
        {showAddDba && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={50}
                value={newDbaCount}
                onChange={(e) => setNewDbaCount(e.target.value)}
                placeholder="Cantidad de DBA"
                className="border border-border rounded px-2 py-1 text-sm bg-surface text-text w-40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <SimpleButton
                type="button"
                msj="Generar"
                icon="RefreshCw"
                bg="bg-secondary"
                text="text-surface"
                onClick={handleGenerateNewDba}
                disabled={savingNewDba}
              />
            </div>
            {newDbaList.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {newDbaList.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-text/50 w-6 shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={d.nombre}
                      onChange={(e) => handleNewDbaChange(idx, e.target.value)}
                      placeholder={`Nombre DBA ${idx + 1}`}
                      className="flex-1 border border-border rounded px-2 py-1 text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <SimpleButton
                type="button"
                msj="Guardar"
                icon="Save"
                bg="bg-secondary"
                text="text-surface"
                onClick={handleSaveNewDba}
                disabled={savingNewDba || newDbaList.length === 0}
              />
              <SimpleButton
                type="button"
                msj="Cancelar"
                icon="X"
                bg="bg-orange-500"
                text="text-white"
                onClick={handleCancelNewDba}
                disabled={savingNewDba}
              />
            </div>
          </div>
        )}
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
                <th className="px-3 py-2 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isRowEditing = editingId === item.id_dba;
                const isInactivo =
                  (isRowEditing ? editDraft.estado_dba : item.estado_dba) ===
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
                      {isRowEditing ? (
                        <input
                          type="text"
                          value={editDraft.nombre_dba}
                          onChange={(e) =>
                            handleFieldChange("nombre_dba", e.target.value)
                          }
                          className="w-full min-w-[200px] border border-border rounded px-2 py-1 bg-surface text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        (item.nombre_dba ?? "—")
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2">
                      {isRowEditing ? (
                        <select
                          value={editDraft.estado_dba}
                          onChange={(e) =>
                            handleFieldChange("estado_dba", e.target.value)
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

                    {/* Acciones */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isRowEditing ? (
                        <div className="flex gap-1">
                          <SimpleButton
                            type="button"
                            msj="Guardar"
                            icon="Save"
                            bg="bg-secondary"
                            text="text-surface"
                            onClick={handleSave}
                            disabled={savingDba}
                          />
                          <SimpleButton
                            type="button"
                            msj="Cancelar"
                            icon="X"
                            bg="bg-orange-500"
                            text="text-white"
                            onClick={handleCancelEdit}
                            disabled={savingDba}
                          />
                        </div>
                      ) : (
                        <SimpleButton
                          type="button"
                          msj="Editar"
                          icon="Pencil"
                          bg="bg-primary"
                          text="text-surface"
                          onClick={() => handleStartEdit(item)}
                          disabled={editingId !== null}
                        />
                      )}
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
