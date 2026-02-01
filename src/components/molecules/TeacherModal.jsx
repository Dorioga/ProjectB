import Modal from "../atoms/Modal";
import ProfileTeacher from "./ProfileTeacher";

const TeacherModal = ({
  isOpen,
  onClose,
  teacher,
  initialEditing = false,
  onSave,
}) => {
  const title = teacher ? "Perfil del docente" : "Crear nuevo docente";
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="4xl">
      <ProfileTeacher
        data={teacher}
        initialEditing={initialEditing}
        onSave={onSave}
      />
    </Modal>
  );
};

export default TeacherModal;
