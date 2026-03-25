import React, { useMemo, useState, useCallback, useEffect } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";
import { useNotify } from "../../lib/hooks/useNotify";

const UploadStudentExcel = ({ onSuccess } = {}) => {
  const { uploadStudentsExcel, loading, error } = useStudent();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadResult, setUploadResult] = useState(null); // { message, errores[] }

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
    setUploadResult(null);
  }, []);

  const notify = useNotify();

  const handleUpload = useCallback(async () => {
    const { valid, message } = validateFile(file);
    if (!valid) {
      setStatus({ type: "error", message });
      notify.error(message);
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await uploadStudentsExcel(file);

      // Normalizar respuesta: soporta res directo o res.data
      const resData = res?.data ?? res ?? {};
      const errores = Array.isArray(resData?.errores)
        ? resData.errores
        : Array.isArray(res?.errores)
          ? res.errores
          : [];
      const summaryMessage =
        res?.message || resData?.message || "Archivo enviado correctamente.";

      setUploadResult({ message: summaryMessage, errores });
      setFile(null);

      if (errores.length === 0) {
        setStatus({ type: "success", message: summaryMessage });
        notify.success(summaryMessage);
      } else {
        setStatus({
          type: "success",
          message: `${summaryMessage} — ${errores.length} fila(s) con errores.`,
        });
        notify.success(summaryMessage);
      }

      if (errores.length === 0 && typeof onSuccess === "function") onSuccess();
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.mensaje ||
        err?.response?.data?.message ||
        "No fue posible subir el archivo.";
      setStatus({ type: "error", message: msg });
      setUploadResult(null);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, uploadStudentsExcel, onSuccess, validateFile]);

  // Auto-clear success message after a short delay
  useEffect(() => {
    if (status?.type === "success") {
      const t = setTimeout(() => {
        setStatus(null);
      }, 4000);
      return () => clearTimeout(t);
    }
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

      {(busy || error) && (
        <div className="flex flex-col gap-2">
          {busy && <Loader message="Procesando…" />}

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

      {/* Tabla de errores del servidor */}
      {uploadResult?.errores?.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-error">
              Filas con errores ({uploadResult.errores.length})
            </h3>
            <button
              type="button"
              onClick={() => setUploadResult(null)}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-x-auto rounded border border-error/30">
            <table className="w-full text-sm text-left">
              <thead className="bg-primary text-surface">
                <tr>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">
                    Fila
                  </th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">
                    Documento
                  </th>
                  <th className="px-3 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {uploadResult.errores.map((e, i) => (
                  <tr
                    key={i}
                    className={`border-t border-error/20 ${
                      i % 2 === 0 ? "" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2 text-center font-mono">
                      {e.row ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {e.documento ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-black">{e.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStudentExcel;
