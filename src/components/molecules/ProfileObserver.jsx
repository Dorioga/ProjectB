import { useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";
import useAuth from "../../lib/hooks/useAuth";
import { useNotification } from "../../lib/context/NotificationContext";
import PdfObservador from "./PdfObservador";

/**
 * ProfileObserver – muestra los datos completos de un registro del observador,
 * lista cada entrada de observación (separadas por |-|) y permite agregar una nueva.
 *
 * Props:
 *  - data: objeto fila del observador (viene de ManageObserver / getObservationData)
 *  - onClose: callback para cerrar el modal
 *  - onSaved: callback opcional tras guardar exitosamente
 */
const ProfileObserver = ({ data, onClose, onSaved }) => {
  console.log("ProfileObserver - data received:", data);
  const { updateObservation } = useStudent();
  const {
    idInstitution,
    fkInstitucion,
    nameRole,
    rol,
    idDocente,
    nameSchool,
    imgSchool,
    userName,
  } = useAuth();
  const { addNotification } = useNotification();
  console.log("ProfileObserver - data received:", fkInstitucion);
  const isDocenteRole =
    (typeof nameRole === "string" &&
      nameRole.toLowerCase().includes("docente")) ||
    String(rol) === "7";
  console.log("ProfileObserver - AuthContext values:", isDocenteRole);
  const effectiveInstitution = isDocenteRole ? fkInstitucion : idInstitution;

  const [newEntry, setNewEntry] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Parseo de observaciones existentes ───────────────────────────────────
  const parseEntries = (raw) => {
    if (!raw) return [];
    return raw
      .split("|-|")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const existingEntries = parseEntries(data?.observacion);

  // ── Descargar PDF ─────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    const student = {
      identification: data?.identificacion_estudiante || "",
      first_name: data?.nombre_estudiante || "",
      birthday: data?.fecha_estudiante || "",
      grade_scholar: data?.nombre_grado || "",
      group_grade: data?.grupo || "",
      journey: data?.nombre_jornada || "",
      nombre_docente: data?.nombre_docente || "",
      nombre_acudiente: data?.nombre_acudiente || "",
      numero_identificacion_acudiente: data?.identificacion_padre || "",
      telefono_acudiente: data?.telefono_observacion || "",
      direccion: data?.direccion_observacion || "",
    };

    const studentName = data?.nombre_estudiante || "";

    const entries = existingEntries.map((entry) => {
      const colonIdx = entry.indexOf(":");
      const fecha = colonIdx > -1 ? entry.slice(0, colonIdx).trim() : "";
      const observacion =
        colonIdx > -1 ? entry.slice(colonIdx + 1).trim() : entry;
      return {
        fecha,
        observacion,
        docente: student.nombre_docente,
        estudiante: studentName,
        acudiente: student.nombre_acudiente,
      };
    });
    console.log(
      "ProfileObserver - Prepared student and entries for PDF:",
      imgSchool,
    );
    try {
      console.log("ProfileObserver - Generando PDF con student y entries:", {
        student,
        entries,
      });
      await PdfObservador({
        student,
        entries,
        nameSchool: nameSchool || "Institución Educativa",
        logoSrc: imgSchool || null,
      });
      addNotification("PDF descargado correctamente.", "success");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      addNotification("Error al generar el PDF.", "error");
    }
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!newEntry.trim()) return;

    const datePrefix = new Date().toISOString().slice(0, 10);
    const newBlock = `${datePrefix}: ${newEntry.trim()}  ${userName} |-|`;

    // Unir todo: existente (ya tiene |-| al final) + nueva entrada
    const existingRaw = data?.observacion ? data.observacion.trim() : "";
    const combined = existingRaw ? `${existingRaw} ${newBlock}` : newBlock;
    const payload = {
      id_observador: Number(data.id_observador),
      observacion: combined,
      fk_institucion: Number(effectiveInstitution),
    };
    if (isDocenteRole) {
      payload.id_docente = Number(idDocente);
    }
    console.log("ProfileObserver - payload for updateObservation:", payload);
    setSaving(true);
    try {
      await updateObservation(payload);
      addNotification("¡Observación actualizada correctamente!", "success");
      setNewEntry("");
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("ProfileObserver - handleSave error:", err);
      addNotification("Error al actualizar la observación.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("es-CO");
  };

  const Field = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* ── Datos del estudiante ── */}
      <section>
        <h3 className="font-bold text-base bg-primary text-surface rounded-lg p-2 ">
          Información del Estudiante
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
          <Field label="ID Estudiante" value={data?.id_estudiante} />
          <Field
            label="Identificación"
            value={data?.identificacion_estudiante}
          />
          <Field label="Nombre" value={data?.nombre_estudiante} />
          <Field label="Fecha Nacimiento" value={fmt(data?.fecha_estudiante)} />
          <Field label="Grado" value={data?.nombre_grado} />
          <Field label="Grupo" value={data?.grupo} />
          <Field label="Jornada" value={data?.nombre_jornada} />
        </div>
      </section>

      {/* ── Datos del acudiente ── */}
      <section>
        <h3 className="font-bold text-base bg-primary text-surface rounded-lg p-2 ">
          Información del Acudiente
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
          <Field label="ID Acudiente" value={data?.id_acudiente} />
          <Field label="Nombre Acudiente" value={data?.nombre_acudiente} />
          <Field
            label="Identificación Acudiente"
            value={data?.identificacion_padre}
          />
          <Field label="Teléfono" value={data?.telefono_observacion} />
          <Field label="Dirección" value={data?.direccion_observacion} />
        </div>
      </section>

      {/* ── Observaciones existentes ── */}
      <section>
        <h3 className="font-bold text-base bg-primary text-surface rounded-lg p-2 ">
          Historial de Observaciones
          <span className="ml-2 text-xs font-normal text-gray-400 p-2">
            ({existingEntries.length} entrada
            {existingEntries.length !== 1 ? "s" : ""})
          </span>
        </h3>
        {existingEntries.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin observaciones.</p>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            {existingEntries.map((entry, i) => (
              <div
                key={i}
                className="bg-surface border rounded px-4 py-3 text-sm whitespace-pre-wrap"
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Nueva observación ── */}
      <section className="flex flex-col gap-2">
        <h3 className="font-bold text-base bg-primary text-surface rounded-lg p-2 ">
          Agregar Nueva Observación
        </h3>
        <textarea
          rows={4}
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Escribe la nueva observación..."
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-secondary resize-y text-sm"
        />
      </section>

      {/* ── Acciones ── */}
      <div className="grid grid-cols-6 justify-end gap-3">
        <div className="col-span-3"></div>
        <div className="">
          <SimpleButton
            msj="Descargar PDF"
            type="button"
            onClick={handleDownloadPdf}
            bg="bg-accent"
            text="text-white"
            hover="hover:bg-accent/80"
            icon="FileText"
          />
        </div>
        {onClose && (
          <div className="">
            <SimpleButton
              msj="Cancelar"
              type="button"
              onClick={onClose}
              bg="bg-gray-200"
              text="text-gray-700"
              hover="hover:bg-gray-300"
            />
          </div>
        )}
        <div className="">
          <SimpleButton
            msj={saving ? "Guardando…" : "Guardar"}
            type="button"
            onClick={handleSave}
            bg="bg-secondary"
            text="text-surface"
            hover="hover:bg-secondary/80"
            icon="Save"
            disabled={saving || !newEntry.trim()}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileObserver;
