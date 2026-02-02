import Modal from "../atoms/Modal";
import ProfileSede from "./ProfileSede";

const SedeModal = ({
  isOpen,
  onClose,
  sede,
  onSave,
  initialEditing = false,
}) => {
  const modalTitle = sede ? "Perfil de la Sede" : "Crear nueva sede";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      showCloseButton={false}
      size="4xl"
    >
      <ProfileSede
        data={sede}
        onSave={onSave}
        initialEditing={initialEditing}
      />
    </Modal>
  );
};

export default SedeModal;
