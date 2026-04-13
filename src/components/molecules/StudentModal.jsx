import Modal from "../atoms/Modal";
import ProfileStudent from "./ProfileStudent";
import Loader from "../atoms/Loader";

const StudentModal = ({
  isOpen,
  onClose,
  student,
  onSave,
  initialEditing = false,
  isLoading = false,
  showStates = true,
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
      <div className="relative">
        {isLoading || !student ? (
          <Loader message="Cargando datos..." size={56} />
        ) : (
          <ProfileStudent
            data={student}
            onSave={onSave}
            initialEditing={initialEditing}
            showStates={showStates}
          />
        )}
      </div>
    </Modal>
  );
};

export default StudentModal;
