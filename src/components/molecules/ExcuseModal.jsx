import React, { useState } from "react";
import Modal from "../atoms/Modal";
import FileChooser from "../atoms/FileChooser";
import SimpleButton from "../atoms/SimpleButton";
import PDFViewer from "../atoms/PDFViewer";
import { FileText } from "lucide-react";
import excusePDF from "../../assets/formulario.pdf";
import { upload } from "../../services/uploadService";
import { registerExcuse } from "../../services/studentService";
import { useNotify } from "../../lib/hooks/useNotify";

const ExcuseModal = ({
  isOpen,
  onClose,
  mode = "load",
  file = excusePDF,
  fk_estudiante,
  fk_sede,
  etapa,
  identificacion,
}) => {
  const notify = useNotify();
  const [selectedFile, setSelectedFile] = useState(
    mode === "view" ? file : null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("identificacion", identificacion || "");
      form.append("excusa", selectedFile);
      form.append("etapa", etapa?.replace(" etapa", "") || "");

      const uploadRes = await upload(form, "upload/excusas");

      let linkExcuse = null;
      if (
        uploadRes &&
        uploadRes.status === 200 &&
        Array.isArray(uploadRes.data)
      ) {
        const entry = uploadRes.data.find((e) => e.field === "excusa");
        if (entry?.files?.[0]) {
          const folder = entry.files[0].folder?.replace("/var/www", "") ?? "";
          const fileName = entry.files[0].fileName ?? "";
          linkExcuse = `https://www.nexusplataforma.com${folder}/${fileName}`;
        }
      }

      if (!linkExcuse) {
        notify.error("Error al subir el archivo de excusa.");
        return;
      }

      await registerExcuse({
        fk_estudiante,
        fk_sede,
        link_excuse: linkExcuse,
        etapa,
      });

      notify.success("Excusa registrada correctamente.");
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error("Error registrando excusa:", err);
      notify.error("Error al registrar la excusa.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (selectedFile) {
      // Si es una URL
      if (typeof selectedFile === "string") {
        const a = document.createElement("a");
        a.href = selectedFile;
        a.download = selectedFile.split("/").pop() || "documento.pdf";
        a.target = "_blank";
        a.click();
      }
      // Si es un objeto File
      else if (selectedFile instanceof File) {
        const url = URL.createObjectURL(selectedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedFile.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (selectedFile) {
      if (typeof selectedFile === "string") {
        window.open(selectedFile, "_blank");
      } else if (selectedFile instanceof File) {
        const url = URL.createObjectURL(selectedFile);
        window.open(url, "_blank");
      }
    }
  };

  const getFileType = (file) => {
    if (!file) return "unknown";

    if (file instanceof File) {
      return file.type;
    }

    if (typeof file === "string") {
      const cleanPath = file.split("?")[0].split("#")[0];
      const extension = cleanPath.split(".").pop()?.toLowerCase();
      return extension || "unknown";
    }

    return "unknown";
  };

  const isImage = (file) => {
    const type = getFileType(file);
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const imageMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    return imageExtensions.includes(type) || imageMimeTypes.includes(type);
  };

  const isPDF = (file) => {
    const type = getFileType(file);
    return type === "pdf" || type === "application/pdf";
  };

  const getFileName = (file) => {
    if (!file) return "Documento";

    if (file instanceof File) {
      return file.name;
    }

    if (typeof file === "string") {
      const cleanPath = file.split("?")[0].split("#")[0];
      return cleanPath.split("/").pop() || "documento.pdf";
    }

    return "Documento";
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "view" ? "Ver excusa" : "Cargar excusa"}
    >
      <div className="flex flex-col gap-4">
        {mode === "view" && selectedFile ? (
          <div className="flex flex-col gap-4">
            {/* Vista previa del archivo */}
            <div className="border rounded-lg p-4 bg-bg">
              {isImage(selectedFile) ? (
                <img
                  src={
                    typeof selectedFile === "string"
                      ? selectedFile
                      : URL.createObjectURL(selectedFile)
                  }
                  alt="Excusa"
                  className="w-full h-auto max-h-96 object-contain rounded"
                />
              ) : isPDF(selectedFile) ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={32} className="text-red-600" />
                    <div>
                      <p className="text-lg font-semibold">Documento PDF</p>
                      <p className="text-sm text-gray-600">
                        {getFileName(selectedFile)}
                      </p>
                    </div>
                  </div>

                  {/* Usar PDFViewer en lugar de iframe */}
                  <PDFViewer
                    file={
                      typeof selectedFile === "string"
                        ? selectedFile
                        : URL.createObjectURL(selectedFile)
                    }
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <FileText size={64} className="text-blue-600" />
                  <p className="text-lg font-semibold">Documento</p>
                  <p className="text-sm text-gray-600">
                    {getFileName(selectedFile)}
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción para vista */}
            <div className="modal-actions grid grid-cols-3 gap-2">
              <SimpleButton
                onClick={onClose}
                msj="Cerrar"
                bg="bg-secondary"
                icon="X"
                text="text-surface"
              />
              <SimpleButton
                onClick={handleOpenInNewTab}
                msj="Abrir"
                bg="bg-primary"
                icon="ExternalLink"
                text="text-surface"
              />
              <SimpleButton
                onClick={handleDownload}
                msj="Descargar"
                bg="bg-accent"
                icon="Download"
                text="text-surface"
              />
            </div>
          </div>
        ) : (
          // Modo de carga de archivo
          <>
            <div className="form-group">
              <FileChooser
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                value={selectedFile}
              />

              {selectedFile && (
                <div className="mt-2 p-2 bg-bg rounded">
                  <p className="text-sm">
                    <span className="font-semibold">Archivo seleccionado:</span>{" "}
                    {getFileName(selectedFile)}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions grid grid-cols-2 gap-4">
              <SimpleButton
                onClick={onClose}
                msj="Cancelar"
                bg="bg-secondary"
                icon="X"
                text="text-surface"
                disabled={isUploading}
              />
              <SimpleButton
                onClick={handleSubmit}
                msj={isUploading ? "Subiendo..." : "Enviar"}
                bg="bg-accent"
                icon="Send"
                text="text-surface"
                disabled={!selectedFile || isUploading}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ExcuseModal;
