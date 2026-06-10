import { useState } from "react";
import FileChooser from "../atoms/FileChooser";
import SimpleButton from "../atoms/SimpleButton";
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
  const [documents, setDocuments] = useState(
    Object.fromEntries(
      DOCUMENT_TYPES.map(({ key }) => [key, { selected: false, file: null }]),
    ),
  );

  const handleCheckChange = (key, checked) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: { ...prev[key], selected: checked },
    }));
  };

  const handleFileChange = (key, file) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: { selected: true, file },
    }));
  };

  const handleSubmit = async () => {
    const selected = Object.entries(documents).filter(
      ([, v]) => v.selected && v.file,
    );
    if (selected.length === 0) {
      notify.error(
        "Selecciona al menos un tipo de documento y adjunta su archivo",
      );
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      selected.forEach(([key, { file }]) => {
        fd.append(key, file, file.name);
      });
      const res = await upload(fd, "upload/auditoria");
      if (res?.status === 200) {
        notify.success("Documentos de auditoría subidos correctamente");
        onSuccess?.();
      } else {
        notify.error("Error al subir los documentos");
      }
    } catch (err) {
      console.error("Error en auditoría:", err);
      notify.error("Error al subir documentos de auditoría");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {DOCUMENT_TYPES.map(({ key, label }) => (
          <div
            key={key}
            className="grid grid-cols-[auto_1fr] gap-3 items-center"
          >
            <input
              type="checkbox"
              checked={documents[key].selected}
              onChange={(e) => handleCheckChange(key, e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium min-w-[180px]">{label}</span>
              {documents[key].selected && (
                <FileChooser
                  editing
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleFileChange(key, file)}
                  label={
                    documents[key].file
                      ? documents[key].file.name
                      : "Seleccionar archivo"
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
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
