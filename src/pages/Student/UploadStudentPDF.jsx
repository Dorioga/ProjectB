import React, { useMemo, useState, useCallback, useEffect } from "react";
import FileChooser from "../../components/atoms/FileChooser";
import Loader from "../../components/atoms/Loader";
import SimpleButton from "../../components/atoms/SimpleButton";
import { useNotify } from "../../lib/hooks/useNotify";
import { upload } from "../../services/uploadService";

/**
 * Componente para seleccionar y subir múltiples archivos PDF usando el
 * servicio <code>upload</code>. El campo enviado en <code>FormData</code> se
 * llamará siempre <code>file</code> y el parámetro <code>folder</code> se usa
 * como nombre en la llamada a <code>upload</code>.
 *
 * Props:
 *   - <code>folder</code> (string): el valor que se pasará al servicio como
 *     nombre. Por defecto se inicializa en "estudiantes" tal como pide la
 *     especificación del usuario. Puede pasarse otro valor si se requiere un
 *     directorio dinámico.
 *   - <code>onSuccess</code> (function): callback opcional tras subida exitosa.
 */
const UploadStudentPDF = ({ onSuccess } = {}) => {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [tipoSubida, setTipoSubida] = useState("");

  const folder = `uploads/${tipoSubida}`;
  const busy = useMemo(() => submitting, [submitting]);

  const validateFile = useCallback((f) => {
    if (!f) return { valid: false, message: "Selecciona al menos un PDF." };
    const name = f.name || "";
    const isPdf = name.toLowerCase().endsWith(".pdf") || /pdf/i.test(f.type);
    if (!isPdf) return { valid: false, message: "Cada archivo debe ser PDF." };
    return { valid: true };
  }, []);

  const handleFilesChange = useCallback((selected) => {
    // FileChooser devuelve array si multiple=true
    setFiles(Array.isArray(selected) ? selected : selected ? [selected] : []);
    setStatus(null);
  }, []);

  const notify = useNotify();

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      const msg = "No se ha seleccionado ningún archivo.";
      setStatus({ type: "error", message: msg });
      notify.error(msg);
      return;
    }

    console.log(
      "handleUpload iniciado —",
      files.length,
      "archivos seleccionados",
    );

    // validar tamaño máximo 2 MB por archivo
    const oversized = files.filter((f) => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      console.log(
        "Archivos que exceden 2MB:",
        oversized.map((f) => f.name),
      );
      const msg = `El(los) archivo(s) ${names} pesa(n) más de 2 MB.`;
      setStatus({ type: "error", message: msg });
      notify.error(msg);
      return;
    }

    // validar tipo PDF
    for (const f of files) {
      const { valid, message } = validateFile(f);
      if (!valid) {
        setStatus({ type: "error", message });
        notify.error(message);
        return;
      }
    }

    console.log("Validaciones pasadas —", files.length, "archivos listos");

    setSubmitting(true);
    setStatus(null);

    try {
      const CHUNK_SIZE = 25;
      let res;

      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        console.log(
          "Lote",
          Math.floor(i / CHUNK_SIZE) + 1,
          "de",
          Math.ceil(files.length / CHUNK_SIZE),
          "—",
          chunk.length,
          "archivos",
        );
        const form = new FormData();
        chunk.forEach((f) => form.append("file", f));

        res = await upload(form, folder);

        if (!res || res.status !== 200) {
          throw new Error("Error en la subida de archivos.");
        }
      }

      console.log("Todos los lotes procesados (simulado, sin llamada real)");

      setFiles([]);
      const successMessage = "PDF(s) subidos correctamente.";
      setStatus({ type: "success", message: successMessage });
      notify.success(successMessage);
      if (typeof onSuccess === "function") onSuccess(res);
    } catch (err) {
      console.error("Error durante la subida:", err);
      const msg =
        err?.message ||
        err?.data?.mensaje ||
        err?.response?.data?.message ||
        "No fue posible subir los archivos.";
      setStatus({ type: "error", message: msg });
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [files, folder, onSuccess, notify, validateFile]);

  // limpa mensaje de éxito tras unos segundos
  useEffect(() => {
    if (status?.type === "success") {
      const t = setTimeout(() => setStatus(null), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Cargar PDF(s)</h2>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo de documento</label>
          <select
            value={tipoSubida}
            onChange={(e) => setTipoSubida(e.target.value)}
            disabled={busy}
            className="border p-2 rounded bg-surface"
          >
            <option value="">Seleccione un tipo</option>
            <option value="estudiantes">Estudiantes</option>
            <option value="acudientes">Acudientes</option>
            {/* <option value="observador">Otros</option> */}
          </select>
        </div>
        <p>
          <strong>IMPORTANTE:</strong> Los nombres de los archivos deben ser
          exclusivamente las identificaciones de los{" "}
          {tipoSubida ? tipoSubida : "usuarios"}.
        </p>
        <FileChooser
          value={files}
          onChange={handleFilesChange}
          accept=".pdf,application/pdf"
          multiple={true}
          disabled={busy}
          label="Seleccionar PDF(s)"
          mode="default"
        />
        <SimpleButton
          type="button"
          msj={busy ? "Subiendo…" : "Subir archivos"}
          icon={"Upload"}
          onClick={handleUpload}
          disabled={busy || files.length === 0 || !tipoSubida}
          bg={"bg-secondary"}
          text={"text-surface"}
          hover={"hover:bg-secondary/80"}
        />
      </div>

      {busy && (
        <div className="flex flex-col gap-2">
          {busy && <Loader message="Procesando…" />}
        </div>
      )}
    </div>
  );
};

export default UploadStudentPDF;
