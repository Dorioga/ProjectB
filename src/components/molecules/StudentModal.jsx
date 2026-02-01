import Modal from "../atoms/Modal";
import ProfileStudent from "./ProfileStudent";

const StudentModal = ({
  isOpen,
  onClose,
  student,
  onSave,
  initialEditing = false,
}) => {
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
      size="4xl"
    >
      <ProfileStudent
        data={student}
        onSave={onSave}
        initialEditing={initialEditing}
      />
    </Modal>
  );
};

export default StudentModal;
