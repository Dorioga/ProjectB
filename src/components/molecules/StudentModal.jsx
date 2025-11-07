import React, { useState, useEffect } from "react";
import Modal from "../atoms/Modal";
import ProfileStudent from "./ProfileStudent";

const StudentModal = ({ isOpen, onClose, student, onSave }) => {
  console.log("StudentModal props:", { isOpen, onClose, student, onSave });
  // Determina el título del modal
  const modalTitle = student
    ? "Perfil del Estudiante"
    : "Crear Nuevo Estudiante";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      showCloseButton={false}
      size="4xl" // Ocultamos el botón por defecto para usar los nuestros
    >
      <ProfileStudent data={student} onSave={onSave} />
    </Modal>
  );
};

export default StudentModal;
