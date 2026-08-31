import { useState } from "react";
import Modal from "../../components/atoms/Modal";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProfileEnfasis from "../../components/molecules/ProfileEnfasis";

const ManageEnfasis = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-me-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Énfasis</h2>
        </div>
        <div
          id="tour-me-add-btn"
          className="grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsRegisterOpen(true)}
            msj="Registrar Enfasis"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-500">
        Módulo de énfasis académicos
      </div>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrar Enfasis"
        size="5xl"
      >
        <ProfileEnfasis
          onSave={() => setIsRegisterOpen(false)}
          onClose={() => setIsRegisterOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ManageEnfasis;