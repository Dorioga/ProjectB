import React from "react";
import Modal from "../atoms/Modal";
import RegisterParents from "../../pages/Student/RegisterParents";

const RegisterParentsModal = ({ isOpen, onClose, fkEstudiante }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar acudiente"
      size="xl"
    >
      <RegisterParents fkEstudiante={fkEstudiante} onSuccess={onClose} />
    </Modal>
  );
};

export default RegisterParentsModal;
