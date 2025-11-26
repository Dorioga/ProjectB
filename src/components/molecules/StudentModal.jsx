import Modal from "../atoms/Modal";
import ProfileStudent from "./ProfileStudent";

const StudentModal = ({ isOpen, onClose, student, onSave }) => {
  // Determina el título del modal
  const modalTitle = student
    ? "Perfil del estudiante"
    : "Crear nuevo estudiante";

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
