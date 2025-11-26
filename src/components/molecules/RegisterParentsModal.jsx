import React from "react";
import Modal from "../atoms/Modal"; // Ajusta la ruta según tu estructura
import RegisterParents from "../../pages/Student/RegisterParents"; // Ajusta la ruta según tu estructura

const RegisterParentsModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar acudiente"
      size="xl"
    >
      <RegisterParents />
    </Modal>
  );
};

export default RegisterParentsModal;
