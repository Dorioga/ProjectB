import React, { useMemo, useState, useCallback, useEffect } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";

const UploadStudentExcel = ({ onSuccess } = {}) => {
  const { uploadStudentsExcel, loading, error } = useStudent();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const ACCEPT_EXCEL =
    ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

  const busy = useMemo(() => submitting || loading, [submitting, loading]);

  const validateFile = useCallback((f) => {
    if (!f) return { valid: false, message: "Selecciona un archivo Excel." };
    const name = f.name || "";
    const isExcel =
      /\.(xlsx|xls)$/i.test(name) || /excel|spreadsheet/i.test(f.type || "");
    if (!isExcel)
      return { valid: false, message: "El archivo debe ser .xlsx o .xls." };
    return { valid: true };
  }, []);

  const handleFileChange = useCallback((selected) => {
    const f = Array.isArray(selected) ? selected[0] : selected;
    setFile(f ?? null);
    setStatus(null);
  }, []);

  const handleUpload = useCallback(async () => {
    const { valid, message } = validateFile(file);
    if (!valid) {
      setStatus({ type: "error", message });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setProgress(0);

    try {
      await uploadStudentsExcel(file, {
        onUploadProgress: (ev) => {
          if (ev && ev.total) {
            const pct = Math.round((ev.loaded * 100) / ev.total);
            setProgress(pct);
          }
        },
      });

      setProgress(100);
      setFile(null);
      setStatus({ type: "success", message: "Archivo enviado correctamente." });

      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      setProgress(0);
      const msg =
        err?.message ||
        err?.data?.mensaje ||
        err?.response?.data?.message ||
        "No fue posible subir el archivo.";
      setStatus({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  }, [file, uploadStudentsExcel, onSuccess, validateFile]);

  // Auto-clear success message after a short delay
  useEffect(() => {
    if (status?.type === "success") {
      const t = setTimeout(() => {
        setStatus(null);
        setProgress(0);
      }, 4000);
      return () => clearTimeout(t);
    }

    // Limpiar la barra de progreso si el estado vuelve a null
    if (!status) setProgress(0);
  }, [status]);

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="flex flex-col gap-2">
        <div className="">
          <h2 className="text-xl font-semibold">Cargar Excel</h2>
        </div>
        <FileChooser
          value={file}
          onChange={handleFileChange}
          accept={ACCEPT_EXCEL}
          multiple={false}
          disabled={busy}
          label="Seleccionar Excel"
          mode="default"
        />

        <SimpleButton
          type="button"
          msj={busy ? "Subiendo…" : "Subir archivo"}
          icon={"Upload"}
          onClick={handleUpload}
          disabled={busy}
          bg={"bg-secondary"}
          text={"text-surface"}
          hover={"hover:bg-secondary/80"}
        />
      </div>

      {(busy || error || progress > 0) && (
        <div className="flex flex-col gap-2">
          {/* Mostrar barra de progreso si hay progreso conocido */}
          {progress > 0 && progress < 100 && (
            <div className="w-full">
              <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                <div
                  className="h-2 bg-secondary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">{progress}%</div>
            </div>
          )}

          {/* Si no hay progreso numérico mostrar loader indeterminado */}
          {busy && progress === 0 && <Loader message="Procesando…" />}

          {!busy && error && (
            <div className="p-3 rounded border border-error bg-error/10 text-error">
              {error?.message || "Ocurrió un error."}
            </div>
          )}
        </div>
      )}

      {status && (
        <div
          className={`p-3 rounded border ${
            status.type === "success"
              ? "border-secondary bg-secondary/10 text-secondary"
              : "border-error bg-error/10 text-error"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default UploadStudentExcel;
