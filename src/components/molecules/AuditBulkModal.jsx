import { useState } from "react";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import { upload } from "../../services/uploadService";
import { useNotify } from "../../lib/hooks/useNotify";

const DOCUMENT_TYPES = [
  { key: "id_estudiante", label: "Identificación estudiante" },
  { key: "acudiente", label: "Acudiente" },
  { key: "ficha_academica", label: "Ficha académica" },
  { key: "habeas_data", label: "Habeas data" },
];

const AuditBulkModal = ({ onClose, onSuccess, mode = "upload" }) => {
  const notify = useNotify();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState(
    Object.fromEntries(DOCUMENT_TYPES.map(({ key }) => [key, false])),
  );
  const [files, setFiles] = useState(null);

  const handleCheckChange = (key, checked) => {
    setSelectedDocs((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async () => {
    const selected = Object.entries(selectedDocs)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selected.length === 0) {
      notify.error("Selecciona al menos un tipo de documento");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      selected.forEach((key) => fd.append("tipos[]", key));
      const res = await upload(fd, "upload/auditoria");
      if (res?.status === 200) {
        notify.success("Documentos de auditoría procesados correctamente");
        onSuccess?.();
      } else {
        notify.error("Error al procesar los documentos");
      }
    } catch (err) {
      console.error("Error en auditoría:", err);
      notify.error("Error al procesar documentos de auditoría");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {DOCUMENT_TYPES.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedDocs[key]}
              onChange={(e) => handleCheckChange(key, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>
      {mode === "upload" && (
        <FileChooser
          value={files}
          onChange={setFiles}
          multiple
          label="Seleccionar archivos"
        />
      )}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <SimpleButton
          onClick={onClose}
          msj="Cancelar"
          bg="bg-secondary"
          icon="X"
          text="text-surface"
        />
        <SimpleButton
          onClick={handleSubmit}
          msj={
            submitting
              ? mode === "download"
                ? "Descargando..."
                : "Subiendo..."
              : mode === "download"
                ? "Descargar documentos"
                : "Subir documentos"
          }
          bg="bg-accent"
          icon={mode === "download" ? "Download" : "Upload"}
          text="text-surface"
          disabled={submitting}
        />
      </div>
    </div>
  );
};

export default AuditBulkModal;
