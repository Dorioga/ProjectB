import React, { useEffect, useState } from "react";
import useStudent from "../../lib/hooks/useStudent";
import SimpleButton from "../../components/atoms/SimpleButton";
import RegisterParentsModal from "../../components/molecules/RegisterParentsModal";
// Componente de ejemplo para la vista previa de un certificado
const CertificadoPreview = () => (
  <div className="p-4 border-2 border-dashed rounded-lg">
    <h3 className="text-center font-bold text-lg">CERTIFICADO ESCOLAR</h3>
    <p className="mt-4 text-sm">
      La institución <strong>Nombre de la Institución</strong> certifica que el
      estudiante <strong>Nombre del Estudiante</strong>, identificado con NUI{" "}
      <strong>123456789</strong>, se encuentra matriculado en el grado{" "}
      <strong>Décimo</strong> para el presente año lectivo.
    </p>
    <p className="mt-6 text-center text-xs">
      Generado el: {new Date().toLocaleDateString()}
    </p>
  </div>
);

// Componente de ejemplo para la vista previa de un paz y salvo
const PazYSalvoPreview = () => (
  <div className="p-4 border-2 border-dashed rounded-lg">
    <h3 className="text-center font-bold text-lg">PAZ Y SALVO</h3>
    <p className="mt-4 text-sm">
      La institución <strong>Nombre de la Institución</strong> hace constar que
      el estudiante <strong>Nombre del Estudiante</strong> se encuentra a paz y
      salvo por todo concepto con la institución a la fecha.
    </p>
    <p className="mt-6 text-center text-xs">
      Válido hasta: {new Date().toLocaleDateString()}
    </p>
  </div>
);
export const SignatureFormatPreview = ({ id_student = null }) => {
  const { getStudent } = useStudent();
  const [idStudentSelected, setIdStudentSelected] = useState(id_student || "");
  const [studentSelected, setStudentSelected] = useState(null);
  const [isOpenRegisterParents, setIsOpenRegisterParents] = useState(false);
  const [stateFormParents, setStateFormParents] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // controla visibilidad del bloque de pregunta y la confirmación para mostrar la vista previa
  const [showAcudienteQuestion, setShowAcudienteQuestion] = useState(false);
  const [confirmedAcudiente, setConfirmedAcudiente] = useState(false);

  // considera prop inicial y valor del input, evita cadenas vacías o espacios
  const hasId = Boolean(
    (id_student || idStudentSelected || "").toString().trim()
  );

  const handleStudentChange = async (id = null) => {
    const idToUse = id ?? idStudentSelected;
    if (!idToUse) return;
    setLoadingStudent(true);
    // resetear estados relacionados a la confirmación antes de nueva búsqueda
    setConfirmedAcudiente(false);
    setShowAcudienteQuestion(false);
    try {
      const student = await getStudent(idToUse);
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
    if (id_student) {
      setIdStudentSelected(id_student);
      handleStudentChange(id_student);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_student]);

  return (
    <div className="p-4 border-2 border-dashed rounded-lg w-full">
      <h3 className="text-center font-bold text-lg">Autorizacion Firma</h3>

      {/* Mostrar input mientras no exista id_student prop */}
      {!id_student && !loadingStudent && (
        <div className="w-full flex flex-col gap-4">
          <p>
            No se ha seleccionado ningún estudiante. Ingresa la identificación
            para buscarlo.
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            <input
              type="text"
              placeholder="Identificación"
              value={idStudentSelected}
              onChange={(e) => setIdStudentSelected(e.target.value)}
              className="w-full p-2 border rounded bg-white col-span-2"
            />
            <SimpleButton
              msj="Buscar"
              bg="bg-blue-600"
              text="text-white"
              icon="Search"
              onClick={() => handleStudentChange()}
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
        Boolean((id_student || idStudentSelected || "").toString().trim()) && (
          <div className="gap-2 mt-4 flex flex-row items-center">
            <h3>Es usted el acudiente actual del estudiante?</h3>
            <div className="w-1/3 flex flex-row gap-4">
              <SimpleButton
                msj="Si"
                bg="bg-accent"
                text="text-white"
                icon="Check"
                onClick={() => setConfirmedAcudiente(true)}
              />
              <SimpleButton
                msj="No"
                bg="bg-error"
                text="text-white"
                icon="X"
                onClick={() => setIsOpenRegisterParents(true)}
              />
            </div>
          </div>
        )}

      {/* Mostrar autorización solo si se confirmó "Si" */}
      {hasId && !loadingStudent && studentSelected && confirmedAcudiente && (
        <div>
          <div>
            <p className="mt-4 text-sm">
              AUTORIZACIÓN Yo,
              <strong>{" " + studentSelected?.nombre_acudiente + ", "}</strong>
              identificado(a) con {
                studentSelected?.tipo_documento_acudiente
              }{" "}
              No.
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
              , identificado(a) con {studentSelected?.identificationType} No.
              {studentSelected?.identification}, autorizo de manera expresa a la
              institución <strong>{studentSelected?.name_school}</strong> para
              la expedición correspondiente al estudiante mencionado.
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
                text="text-white"
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
  );
};
// Componente de ejemplo para la vista previa de un carnet

const Reports = () => {
  const reportOptions = [
    { value: "none", label: "Seleccione un formato" },
    { value: "certificado", label: "Certificado Escolar" },
    { value: "pazysalvo", label: "Paz y Salvo" },
    { value: "firma", label: "Formato Firma" },
  ];

  const [selectedReport, setSelectedReport] = useState("none");

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };

  const renderPreview = () => {
    switch (selectedReport) {
      case "certificado":
        return <CertificadoPreview />;
      case "pazysalvo":
        return <PazYSalvoPreview />;
      case "firma":
        return <SignatureFormatPreview />;
      default:
        return (
          <p className="text-center text-gray-500">
            Seleccione un formato para ver la vista previa.
          </p>
        );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-6 flex flex-col">
      <div>
        <h2 className="text-xl font-bold mb-4">Generador de Reportes</h2>
        <div className="max-w-sm">
          <label
            htmlFor="report-select"
            className="block mb-2 text-sm font-medium"
          >
            Formato de Reporte:
          </label>
          <select
            id="report-select"
            value={selectedReport}
            onChange={handleReportChange}
            className="w-full p-2 border rounded bg-white"
          >
            {reportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grow border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
        <div className="p-4 rounded bg-background  flex  justify-center">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
