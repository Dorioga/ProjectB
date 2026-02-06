import React, { useState, useEffect } from "react";
import Modal from "../atoms/Modal.jsx";
import useStudent from "../../lib/hooks/useStudent.js";
import useData from "../../lib/hooks/useData";
import SedeSelect from "../atoms/SedeSelect.jsx";
import SimpleButton from "../atoms/SimpleButton.jsx";
import RegisterParentsModal from "./RegisterParentsModal.jsx";
const HabeasDataModal = ({ isOpen, onClose, idEstudiante, mode = "view" }) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log("ID del estudiante en HabeasDataModal:", idEstudiante);

  const { getStudent } = useStudent();
  const { institutionSedes } = useData();

  const [idStudentSelected, setIdStudentSelected] = useState(
    idEstudiante || "",
  );
  const [sedeSelected, setSedeSelected] = useState("");
  const [studentSelected, setStudentSelected] = useState(null);
  const [isOpenRegisterParents, setIsOpenRegisterParents] = useState(false);
  const [stateFormParents, setStateFormParents] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // controla visibilidad del bloque de pregunta y la confirmación para mostrar la vista previa
  const [showAcudienteQuestion, setShowAcudienteQuestion] = useState(false);
  const [confirmedAcudiente, setConfirmedAcudiente] = useState(false);

  // considera prop inicial y valor del input, evita cadenas vacías o espacios
  const hasId = Boolean(
    (idEstudiante || idStudentSelected || "").toString().trim(),
  );

  const handleStudentChange = async (id = null) => {
    const idToUse = id ?? idStudentSelected;
    if (!idToUse) return;

    // asegurarse de tener sede seleccionada
    const sedeId =
      sedeSelected ||
      (Array.isArray(institutionSedes) && institutionSedes.length
        ? String(institutionSedes[0].id)
        : "");
    if (!sedeId) {
      alert("Selecciona una sede antes de buscar.");
      return;
    }

    setLoadingStudent(true);
    // resetear estados relacionados a la confirmación antes de nueva búsqueda
    setConfirmedAcudiente(false);
    setShowAcudienteQuestion(false);
    try {
      const payload = {
        id_estudiante: Number(idToUse),
        fk_sede: Number(sedeId),
      };

      const student = await getStudent(payload);
      setStudentSelected(student);
      setStateFormParents(true);
      // mostrar la pregunta después de obtener el estudiante
      setShowAcudienteQuestion(true);
    } catch (err) {
      setStudentSelected(null);
      console.error("Error buscando estudiante:", err);
    } finally {
      setLoadingStudent(false);
    }
  };

  useEffect(() => {
    // si llega id_student por prop, sincronizar input y disparar la búsqueda
    if (idEstudiante) {
      setIdStudentSelected(idEstudiante);
      // si ya hay sedes cargadas, preseleccionar la primera
      if (Array.isArray(institutionSedes) && institutionSedes.length) {
        setSedeSelected(String(institutionSedes[0].id));
        handleStudentChange(idEstudiante);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEstudiante, institutionSedes]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Formato de firma" size="xl">
      <div className="signature-format-modal">
        <div className="modal-content">
          <div className="p-4 border-2 border-dashed rounded-lg w-full">
            <h3 className="text-center font-bold text-lg">Habeas Data</h3>

            <div className="mt-2 mb-2 w-full max-w-md mx-auto">
              <label className="block mb-1">Sede</label>
              <div className="flex gap-2">
                <SedeSelect
                  value={sedeSelected}
                  onChange={(e) => setSedeSelected(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
                {idEstudiante ? (
                  <SimpleButton
                    msj="Buscar"
                    bg="bg-blue-600"
                    text="text-surface"
                    icon="Search"
                    onClick={() => handleStudentChange(idStudentSelected)}
                    disabled={!sedeSelected}
                  />
                ) : null}
              </div>
            </div>

            {/* Mostrar input mientras no exista idEstudiante prop */}
            {!idEstudiante && !loadingStudent && (
              <div className="w-full flex flex-col gap-4">
                <p>
                  No se ha seleccionado ningún estudiante. Ingresa la
                  identificación para buscarlo.
                </p>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  <SedeSelect
                    value={sedeSelected}
                    onChange={(e) => setSedeSelected(e.target.value)}
                    className="w-full p-2 border rounded bg-surface col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="Identificación"
                    value={idStudentSelected}
                    onChange={(e) => setIdStudentSelected(e.target.value)}
                    className="w-full p-2 border rounded bg-surface col-span-1"
                  />
                  <SimpleButton
                    msj="Buscar"
                    bg="bg-blue-600"
                    text="text-surface"
                    icon="Search"
                    onClick={() => handleStudentChange()}
                    disabled={!idStudentSelected || !sedeSelected}
                  />
                </div>
              </div>
            )}

            {/* Caso: hay id pero aún cargando */}
            {hasId && loadingStudent && (
              <div className="mt-4">Buscando estudiante...</div>
            )}

            {/* Pregunta: se muestra cuando la búsqueda fue exitosa y existe un id (input o prop) */}
            {showAcudienteQuestion &&
              studentSelected &&
              Boolean(
                (idEstudiante || idStudentSelected || "").toString().trim(),
              ) && (
                <div className="gap-2 mt-4 flex flex-row items-center">
                  <h3>¿Es usted el acudiente actual del estudiante?</h3>
                  <div className="w-1/3 flex flex-row gap-4">
                    <SimpleButton
                      msj="Sí"
                      bg="bg-accent"
                      text="text-surface"
                      icon="Check"
                      onClick={() => setConfirmedAcudiente(true)}
                    />
                    <SimpleButton
                      msj="No"
                      bg="bg-error"
                      text="text-surface"
                      icon="X"
                      onClick={() => setIsOpenRegisterParents(true)}
                    />
                  </div>
                </div>
              )}

            {/* Mostrar autorización solo si se confirmó "Si" */}
            {hasId &&
              !loadingStudent &&
              studentSelected &&
              confirmedAcudiente && (
                <div>
                  <div>
                    <p className="mt-4 text-sm">
                      AUTORIZACIÓN. Yo,
                      <strong>
                        {" " + studentSelected?.nombre_acudiente + ", "}
                      </strong>
                      identificado(a) con{" "}
                      {studentSelected?.tipo_documento_acudiente} n.º{" "}
                      <strong>
                        {studentSelected?.numero_identificacion_acudiente}
                      </strong>
                      , en calidad de acudiente del estudiante{" "}
                      <strong>
                        {studentSelected?.first_name +
                          " " +
                          studentSelected?.second_name +
                          " " +
                          studentSelected?.first_lastname +
                          " " +
                          studentSelected?.second_lastname}
                      </strong>
                      , identificado(a) con{" "}
                      {studentSelected?.identificationType} n.º{" "}
                      {studentSelected?.identification}, autorizo de manera
                      expresa a la institución{" "}
                      <strong>{studentSelected?.name_school}</strong> para la
                      expedición correspondiente al estudiante mencionado.
                    </p>
                    <p className="mt-6 text-center text-xs">
                      Válido hasta: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-4 mt-8">
                    <div className="col-end-6 ">
                      <SimpleButton
                        msj="Descargar"
                        bg="bg-green-600"
                        text="text-surface"
                        icon="DownloadCloud"
                      />
                    </div>
                  </div>
                </div>
              )}

            <RegisterParentsModal
              isOpen={isOpenRegisterParents}
              onClose={() => setIsOpenRegisterParents(false)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HabeasDataModal;
