import { useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import { useNotify } from "../../lib/hooks/useNotify";
import useData from "../../lib/hooks/useData";
import useAuth from "../../lib/hooks/useAuth";

// ── Estructura inicial de un propósito ──────────────────────────────────────
const buildPurpose = () => ({
  nombre: "",
  cantidadDBA: "",
  derechos: [],
});

// ── Estructura inicial de un derecho básico ──────────────────────────────────
const buildDerecho = () => ({ nombre: "" });

const RegisterDBA = ({ onClose, sedeId, gradeId, asignatureId, periodId }) => {
  const notify = useNotify();
  const { registerPurposes, loadingRegisterPurposes } = useData();
  const { idInstitution, idDocente } = useAuth();
  const fkInstitucion = idInstitution;
  const fkDocente = idDocente;

  // Cantidad de propósitos ingresada por el usuario
  const [cantidadPurposes, setCantidadPurposes] = useState("");
  // Lista de propósitos generados
  const [purposes, setPurposes] = useState([]);
  const isSaving = loadingRegisterPurposes;

  // ── Generar/regenerar propósitos al confirmar la cantidad ──────────────────
  const handleGenerate = () => {
    const n = parseInt(cantidadPurposes, 10);
    if (!n || n < 1 || n > 50) {
      notify.warning("Ingresa una cantidad válida de propósitos (1–50).");
      return;
    }
    setPurposes(Array.from({ length: n }, () => buildPurpose()));
  };

  // ── Cambios en campos del propósito ────────────────────────────────────────
  const handlePurposeChange = (pIdx, field, value) => {
    setPurposes((prev) => {
      const next = [...prev];
      next[pIdx] = { ...next[pIdx], [field]: value };
      return next;
    });
  };

  // ── Generar derechos básicos para un propósito ─────────────────────────────
  const handleGenerateDerechos = (pIdx) => {
    const n = parseInt(purposes[pIdx].cantidadDBA, 10);
    if (!n || n < 1 || n > 50) {
      notify.warning("Ingresa una cantidad válida de derechos básicos (1–50).");
      return;
    }
    setPurposes((prev) => {
      const next = [...prev];
      next[pIdx] = {
        ...next[pIdx],
        derechos: Array.from({ length: n }, () => buildDerecho()),
      };
      return next;
    });
  };

  // ── Cambios en los derechos básicos ───────────────────────────────────────
  const handleDerechoChange = (pIdx, dIdx, value) => {
    setPurposes((prev) => {
      const next = [...prev];
      const derechos = [...next[pIdx].derechos];
      derechos[dIdx] = { nombre: value };
      next[pIdx] = { ...next[pIdx], derechos };
      return next;
    });
  };

  // ── Validación básica ──────────────────────────────────────────────────────
  const validate = () => {
    if (purposes.length === 0) {
      notify.warning("Genera al menos un propósito antes de guardar.");
      return false;
    }
    for (let i = 0; i < purposes.length; i++) {
      const p = purposes[i];
      if (!p.nombre.trim()) {
        notify.warning(`El propósito #${i + 1} no tiene nombre.`);
        return false;
      }
      for (let j = 0; j < p.derechos.length; j++) {
        if (!p.derechos[j].nombre.trim()) {
          notify.warning(
            `El derecho básico #${j + 1} del propósito #${i + 1} no tiene nombre.`,
          );
          return false;
        }
      }
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        fk_institucion: fkInstitucion ? Number(fkInstitucion) : undefined,
        fk_docente: fkDocente ? Number(fkDocente) : undefined,
        propositos: purposes.map((p) => ({
          name_proposito: p.nombre.trim(),
          dba: p.derechos.map((d) => ({ nombre_dba: d.nombre.trim() })),
        })),
      };
      console.log("RegisterDBA - payload:", payload);
      await registerPurposes(payload);
      notify.success(
        `${purposes.length} propósito${purposes.length !== 1 ? "s" : ""} registrado${purposes.length !== 1 ? "s" : ""} correctamente.`,
      );
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("RegisterDBA - error:", err);
      notify.error(err?.message || "Error al registrar los DBA.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* ── Paso 1: cantidad de propósitos ──────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm text-on-surface">
          ¿Cuántos propósitos deseas registrar?
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            max={50}
            value={cantidadPurposes}
            onChange={(e) => setCantidadPurposes(e.target.value)}
            placeholder="Ej: 3"
            className="border border-gray-300 rounded-lg px-3 py-2 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <SimpleButton
            type="button"
            onClick={handleGenerate}
            msj="Generar"
            icon="RefreshCw"
            bg="bg-primary"
            text="text-surface"
            className="w-auto px-4 py-2"
          />
        </div>
      </div>

      {/* ── Paso 2: formulario de propósitos ────────────────────────────── */}
      {purposes.length > 0 && (
        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1">
          {purposes.map((purpose, pIdx) => (
            <div
              key={pIdx}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 bg-gray-50"
            >
              {/* Título del propósito */}
              <h3 className="font-bold text-base text-primary">
                Propósito {pIdx + 1}
              </h3>

              {/* Nombre del propósito */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface">
                  Nombre
                </label>
                <input
                  type="text"
                  value={purpose.nombre}
                  onChange={(e) =>
                    handlePurposeChange(pIdx, "nombre", e.target.value)
                  }
                  placeholder="Nombre del propósito"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Cantidad de derechos básicos */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-on-surface">
                  ¿Cuántos Derechos Básicos de Aprendizaje tiene este propósito?
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={purpose.cantidadDBA}
                    onChange={(e) =>
                      handlePurposeChange(pIdx, "cantidadDBA", e.target.value)
                    }
                    placeholder="Ej: 2"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <SimpleButton
                    type="button"
                    onClick={() => handleGenerateDerechos(pIdx)}
                    msj="Agregar"
                    icon="ListPlus"
                    bg="bg-secondary"
                    text="text-surface"
                    className="w-auto px-3 py-2"
                  />
                </div>
              </div>

              {/* Derechos básicos de aprendizaje */}
              {purpose.derechos.length > 0 && (
                <div className="flex flex-col gap-2 pl-2 border-l-2 border-secondary/40">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                    Derechos Básicos de Aprendizaje
                  </p>
                  {purpose.derechos.map((derecho, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-5 shrink-0">
                        {dIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={derecho.nombre}
                        onChange={(e) =>
                          handleDerechoChange(pIdx, dIdx, e.target.value)
                        }
                        placeholder={`Derecho básico #${dIdx + 1}`}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Acciones ────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <div className="w-32">
          <SimpleButton
            type="button"
            onClick={onClose}
            msj="Cancelar"
            icon="X"
            bg="bg-gray-200"
            text="text-gray-700"
            disabled={isSaving}
          />
        </div>
        <div className="w-36">
          <SimpleButton
            type="button"
            onClick={handleSubmit}
            msj="Guardar"
            icon="Save"
            bg="bg-primary"
            text="text-surface"
            disabled={isSaving || purposes.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterDBA;
