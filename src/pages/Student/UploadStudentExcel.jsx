import React, { useMemo, useState } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";

const UploadStudentExcel = () => {
  const { uploadStudentsExcel, loading, error } = useStudent();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const busy = useMemo(() => submitting || loading, [submitting, loading]);

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Selecciona un archivo Excel." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await uploadStudentsExcel(file);
      setStatus({
        type: "success",
        message: "Archivo enviado correctamente.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "No fue posible subir el archivo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="text-xl font-semibold">Cargar estudiantes (Excel)</h2>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <h2>Subir Excel con los estudiantes Registrados</h2>
        </div>
        <FileChooser
          value={file}
          onChange={setFile}
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          multiple={false}
          disabled={busy}
          label="Seleccionar Excel"
          mode="default"
        />

        <div className="max-w-sm flex items-center justify-center">
          <SimpleButton
            type="button"
            msj={busy ? "Subiendo…" : "Subir archivo"}
            icon={"Upload"}
            onClick={handleUpload}
            disabled={busy}
            bg={"bg-secondary"}
            text={"text-white"}
            hover={"hover:bg-secondary/80"}
          />
        </div>
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
    </div>
  );
};

export default UploadStudentExcel;
