import Modal from "../atoms/Modal";
import ProfileStudent from "./ProfileStudent";

const StudentModal = ({
  isOpen,
  onClose,
  student,
  onSave,
  initialEditing = false,
  isLoading = false,
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
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-surface/60">
            <div className="text-center py-8 bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-primary">
                Cargando datos...
              </div>
            </div>
          </div>
        )}

        <ProfileStudent
          data={student}
          onSave={onSave}
          initialEditing={initialEditing}
        />
      </div>
    </Modal>
  );
};

export default StudentModal;
