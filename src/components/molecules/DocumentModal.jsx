import React from "react";
import Modal from "../atoms/Modal";
import useStudent from "../../lib/hooks/useStudent";
import SimpleButton from "../atoms/SimpleButton";

const DocumentModal = ({ isOpen, onClose }) => {
  const { students } = useStudent();
  console.log(students.length);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Descarga Masiva Documentos Auditoria"
    >
      <div className="space-y-4 w-full text-center">
        <h2 className="text-xl font-bold">
          Existen {students.length} Estudiantes
        </h2>
        <p>con los 4 Documentos Cargados</p>
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
