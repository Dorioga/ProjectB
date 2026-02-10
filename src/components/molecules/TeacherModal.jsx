import { useEffect, useState } from "react";
import Modal from "../atoms/Modal";
import ProfileTeacher from "./ProfileTeacher";

const TeacherModal = ({
  isOpen,
  onClose,
  teacher,
  initialEditing = false,
  onSave,
  onReload,
}) => {
  const title = teacher ? "Perfil del docente" : "Crear nuevo docente";
  console.log("TeacherModal teacher:", teacher);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="7xl">
      <ProfileTeacher
        data={
          teacher && teacher.basic
            ? {
                ...teacher.basic,
                id_docente: teacher.id_docente,
                estado: teacher.estado,
                groups: teacher.groups,
                subjects: teacher.subjects,
              }
            : teacher
        }
        initialEditing={initialEditing}
        onSave={onSave}
        onClose={onClose}
        onReload={onReload}
      />
    </Modal>
  );
};

export default TeacherModal;
