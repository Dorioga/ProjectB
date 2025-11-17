import { useState } from "react";
import Modal from "../atoms/Modal";
import useStudent from "../../lib/hooks/useStudent";
import SimpleButton from "../atoms/SimpleButton";
import { downloadFileFromPublic } from "../../utils/downloadUtils";

const DocumentModal = ({ isOpen, onClose, type = "all", title }) => {
  const { students } = useStudent();
  const [downloadType, setDownloadType] = useState("");

  const handleDownload = () => {
    if (type === "all" && !downloadType) {
      alert("Por favor selecciona un modo de descarga");
      return;
    }

    // Descargar directamente el archivo ZIP desde public
    downloadFileFromPublic(
      "/CENTRO DE CAPACITACION ESPECIAL CENCAES.zip",
      "CENTRO DE CAPACITACION ESPECIAL CENCAES.zip"
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Descarga Masiva " + title}>
      <div className="space-y-4 w-full text-center">
        <h2 className="text-lg font-bold">
          Existen {students.length} Estudiantes{" "}
          {type === "all"
            ? "con los 4 Documentos Cargados"
            : " con el Documento de Habeas Data"}
        </h2>

        {type === "all" ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-left">Modo de Descarga Masiva</h3>
            <select
              className="border p-2 rounded"
              onChange={(e) => setDownloadType(e.target.value)}
              value={downloadType}
            >
              <option value="">Selecciona una opción</option>
              <option value="1">
                Documento por Estudiante (1 PDF por estudiante)
              </option>
              <option value="4">
                Documentos Separados por Tipo (4 PDFs por estudiante)
              </option>
            </select>
          </div>
        ) : null}

        <SimpleButton
          msj="Descargar Documentos"
          bg="bg-blue-600"
          text="text-white"
          icon="DownloadCloud"
          onClick={handleDownload}
        />
      </div>
    </Modal>
  );
};

export default DocumentModal;
