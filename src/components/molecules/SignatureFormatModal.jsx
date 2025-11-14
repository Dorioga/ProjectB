import React, { useState } from "react";
import Modal from "../atoms/Modal";
import { SignatureFormatPreview } from "../../pages/Dashboard/Reports.jsx";

const SignatureFormatModal = ({ isOpen, onClose, idEstudiante }) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log("ID Estudiante en SignatureFormatModal:", idEstudiante);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Formato de Firma" size="xl">
      <div className="signature-format-modal">
        <div className="modal-content">
          <SignatureFormatPreview id_student={idEstudiante} />
        </div>
      </div>
    </Modal>
  );
};

export default SignatureFormatModal;
