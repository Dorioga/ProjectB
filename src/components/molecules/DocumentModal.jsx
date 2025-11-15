import { useState } from "react";
import Modal from "../atoms/Modal";
import useStudent from "../../lib/hooks/useStudent";
import SimpleButton from "../atoms/SimpleButton";

const DocumentModal = ({ isOpen, onClose }) => {
  const { students } = useStudent();
  console.log(students.length);
  const [downloadType, setDownloadType] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Descarga Masiva Documentos Auditoria"
    >
      <div className="space-y-4 w-full text-center">
        <h2 className="text-lg font-bold">
          Existen {students.length} Estudiantes con los 4 Documentos Cargados
        </h2>
        <div className="flex flex-col gap-2 ">
          <h3 className="font-semibold text-left">Modo de Descarga Masiva</h3>
          <select
            className="border p-2 rounded"
            onChange={(e) => setDownloadType(e.target.value)}
            value={downloadType}
          >
            <option></option>
            <option value="1">
              Documento por Estudiante ( 1 PDF por estudiante)
            </option>
            <option value="4">
              Documentos Separados por Tipo ( 4 PDFs por estudiante )
            </option>
          </select>
        </div>
        <SimpleButton
          msj="Descargar Documentos"
          bg="bg-blue-600"
          text="text-white"
          icon="DownloadCloud"
        />
      </div>
    </Modal>
  );
};

export default DocumentModal;
