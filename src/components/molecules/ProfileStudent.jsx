import { useState } from "react";
import PreviewIMG from "../atoms/PreviewIMG";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import CameraModal from "./CameraModal";
import ExcuseModal from "./ExcuseModal";
import HabeasDataModal from "./HabeasDataFormatModal.jsx";
import PDFViewerModal from "./PDFViewerModal.jsx";

const ProfileStudent = ({ data, state = false, onSave }) => {
  console.log("Data en ProfileStudent:", data);
  ///Preguntar el State
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isOpenExcuse, setIsOpenExcuse] = useState(false);
  const [isOpenHabeasDataFormat, setIsOpenHabeasDataFormat] = useState(false);
  const [isOpenDocument, setIsOpenDocument] = useState(false);
  const [habeasDataMode, setHabeasDataMode] = useState("view");
  const [documentSelected, setDocumentSelected] = useState({
    file: null,
    name: "",
  }); // Estado para el modo de Habeas Data

  // Estados para manejar archivos y previews
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data.url_photo);
  const [documentFiles, setDocumentFiles] = useState({
    habeas_data: null,
    id_Student: null,
    id_Acudiente: null,
  });

  const [editedData, setEditedData] = useState({
    state_first: data?.state_first || "Ausente",
    state_second: data?.state_second || "Pendiente",
    state_beca: data?.state_beca || "Inactivo",
    state_process: data?.state_process || "Incompleto",
  });

  const toggleEditing = () => {
    if (isEditing) {
      // Aquí puedes llamar a la función para guardar los cambios
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };
  const handleSaveChanges = () => {
    const updatedData = {
      ...editedData,
      ultima_actualizacion: new Date().toISOString().split("T")[0],
    };

    if (photoFile) {
      if (data.state_first === "Ausente") {
        updatedData.state_first = "Registrado";
      } else {
        if (data.state_second === "Ausente") {
          updatedData.state_second = "Validado";
        }
      }
      ///Pendiente Subir la foto al servidor y obtener la URL
      //updatedData.url_photo = photoPreview;
    }

    if (documentFiles.documento3) {
      updatedData.documento3 = documentFiles.documento3.name;
    }

    if (documentFiles.documento4) {
      updatedData.documento4 = documentFiles.documento4.name;
    }

    if (onSave) {
      onSave(data.identification, updatedData);
    }

    console.log("Cambios guardados:", updatedData);
  };

  const handleImageCapture = (file, preview) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleDocumentChange = (documentName, file) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };
  const handleStateChange = (field, value) => {
    console.log("Cambiando campo:", field, "a valor:", value);
    if (field === "state_beca" && value === "Retirado") {
      setEditedData((prev) => ({
        ...prev,
        ["state_process"]: "Retirado",
      }));
    }
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleExcuseSubmit = ({ file }) => {
    if (file) {
      console.log("Archivo de excusa:", file);
    } else {
      console.log("No se adjuntó ningún archivo.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-11/12 flex flex-col gap-4">
        <div className="w-full flex justify-end">
          <div className="grid grid-cols-2 gap-2">
            <SimpleButton
              onClick={() => {
                setHabeasDataMode("create");
                setIsOpenHabeasDataFormat(true);
              }}
              msj={"Habeas Data"}
              bg={"bg-primary"}
              icon={"Download"}
              text={"text-white"}
            />
            <SimpleButton
              onClick={toggleEditing}
              msj={isEditing ? "Guardar" : "Editar"}
              bg={isEditing ? "bg-accent" : "bg-secondary"}
              icon={isEditing ? "Save" : "Pencil"}
              text={"text-white"}
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 p-4 bg-bg rounded-lg shadow-md">
          <div className="flex flex-col gap-2 items-center justify-center">
            <PreviewIMG path={photoPreview} size="profile" />
          </div>
          <div className="flex flex-col pb-4 lg:col-span-2">
            <h2 className="text-2xl font-semibold pb-4">Información básica</h2>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Tipo de identificación:
              </label>
              <p>{data.identificationType}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Número de identificación:
              </label>
              <p>{data.identification}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Nombre completo:</label>
              <p>
                {data.first_name} {data.second_name} {data.first_lastname}{" "}
                {data.second_lastname}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Género:</label>
              <p>{data.genre}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Fecha de nacimiento:
              </label>
              <p>{data.birthday}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Información escolar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Institución:</label>
            <p>{data.name_school}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grado:</label>
            <p>{data.grade_scholar}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grupo:</label>
            <p>{data.group_grade}</p>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Información familiar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Tipo Documento Acudiente:
            </label>
            <p>{data.tipo_documento_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Número Identificación Acudiente:
            </label>
            <p>{data.numero_identificacion_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Nombre Acudiente:</label>
            <p>{data.nombre_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Teléfono Acudiente:</label>
            <p>{data.telefono_acudiente}</p>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">
            Estados del estudiante
          </h2>

          <div className="flex flex-col gap-3">
            {/* Estado Primera Etapa */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">Primera Etapa:</label>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                  editedData.state_first === "Registrado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_first}
              </span>
              {data.state_first === "Ausente" ? (
                <div className="">
                  <SimpleButton
                    onClick={() => setIsOpenCamera(true)}
                    msj="Tomar foto"
                    bg="bg-accent"
                    icon="Camera"
                    text="text-white"
                  />
                </div>
              ) : null}
            </div>
            {/* Estado Segunda Etapa */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">Segunda Etapa:</label>

              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                  editedData.state_second === "Validado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_second}
              </span>
              {data.state_first === "Registrado" &&
                data.state_second === "Ausente" && (
                  <div className="">
                    <SimpleButton
                      onClick={() => setIsOpenCamera(true)}
                      msj="Tomar Foto"
                      bg="bg-accent"
                      icon="Camera"
                      text="text-white"
                    />
                  </div>
                )}
            </div>

            {/* Estado Institucional */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado de la beca:
              </label>

              {isEditing ? (
                <select
                  value={editedData.state_beca}
                  onChange={(e) =>
                    handleStateChange("state_beca", e.target.value)
                  }
                  className="border p-2 rounded bg-white text-center"
                >
                  <option value="Activo">Activo</option>
                  <option value="Retirado">Retirado</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                    editedData.state_beca === "Activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {editedData.state_beca}
                </span>
              )}
            </div>

            {/* Estado Proceso */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado del proceso:
              </label>

              {isEditing ? (
                <select
                  value={editedData.state_process}
                  onChange={(e) =>
                    handleStateChange("state_process", e.target.value)
                  }
                  className="border p-2 rounded bg-white text-center"
                >
                  <option value="Conforme">Completo</option>
                  <option value="Retirado">Retirado</option>
                  <option value="SinExcusa">Sin Excusa</option>
                  <option value="Excusa">Excusa</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                    editedData.state_process === "Conforme"
                      ? "bg-green-100 text-green-800"
                      : editedData.state_process === "Retirado"
                      ? "bg-gray-100 text-gray-800"
                      : editedData.state_process === "Reasignado"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {editedData.state_process}
                </span>
              )}

              {(editedData.state_process === "Excusa" ||
                editedData.state_process === "SinExcusa") && (
                <SimpleButton
                  onClick={() => setIsOpenExcuse(true)}
                  msj={isEditing ? "Cargar excusa" : "Ver excusa"}
                  bg="bg-accent"
                  icon="Save"
                  text="text-white"
                />
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2">
          <h2 className="text-2xl font-semibold pb-4">Documentos Auditoria</h2>
          <div
            className={`w-full grid grid-cols-1  gap-4 items-center ${
              documentFiles.habeas_data ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            <label className="text-lg font-medium">Habeas Data:</label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                data.auDoc_habeas
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data.auDoc_habeas.includes("https://")
                ? "Cargado"
                : "No cargado"}
            </span>

            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.habeas_data ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  onChange={(file) => handleDocumentChange("habeas_data", file)}
                  accept=".pdf"
                  label={
                    documentFiles.habeas_data
                      ? documentFiles.habeas_data.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : data.auDoc_habeas.includes("https://") ? (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_habeas,
                    name: "Documento Habeas Data",
                  });
                }}
                msj="Ver documento"
                bg="bg-accent"
                icon="View"
                text="text-white"
              />
            ) : (
              <FileChooser
                onChange={(file) => handleDocumentChange("habeas_data", file)}
                accept=".pdf"
                label={
                  documentFiles.habeas_data
                    ? documentFiles.habeas_data.name
                    : "Cargar archivo"
                }
              />
            )}
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium">Ficha de matrícula:</label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                data.auDoc_matricula.includes("https://")
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data.auDoc_matricula.includes("https://")
                ? "Cargado"
                : "No cargado"}
            </span>

            {data.auDoc_matricula.includes("https://") && (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_matricula,
                    name: "Documento Matricula",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-white"
              />
            )}
          </div>
          <div
            className={`w-full grid grid-cols-1  gap-4 items-center ${
              documentFiles.id_Acudiente ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Acudiente:
            </label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                data.auDoc_idAcudiente.includes("https://")
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data.auDoc_idAcudiente.includes("https://")
                ? "Cargado"
                : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Acudiente ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) =>
                    handleDocumentChange("id_Acudiente", file)
                  }
                  label={
                    documentFiles.id_Acudiente
                      ? documentFiles.id_Acudiente.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : data.auDoc_idAcudiente.includes("https://") ? (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_idAcudiente,
                    name: "Documento Acudiente",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-white"
              />
            ) : (
              <FileChooser
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => handleDocumentChange("id_Acudiente", file)}
                label={
                  documentFiles.id_Acudiente
                    ? documentFiles.id_Acudiente.name
                    : "Cargar archivo"
                }
              />
            )}
          </div>
          <div
            className={`w-full grid grid-cols-1  gap-4 items-center ${
              documentFiles.id_Student ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Estudiante:
            </label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                data.auDoc_idEstudiante.includes("https://")
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data.auDoc_idEstudiante.includes("https://")
                ? "Cargado"
                : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Student ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleDocumentChange("id_Student", file)}
                  label={
                    documentFiles.id_Student
                      ? documentFiles.id_Student.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : data.auDoc_idEstudiante.includes("https://") ? (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_idEstudiante,
                    name: "Documento Estudiante",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-white"
              />
            ) : (
              <FileChooser
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => handleDocumentChange("id_Student", file)}
                label={
                  documentFiles.id_Student
                    ? documentFiles.id_Student.name
                    : "Cargar archivo"
                }
              />
            )}
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de ingreso: {data.fecha_ingreso}</p>
          <p>Última actualización: {data.ultima_actualizacion}</p>
        </div>
      </div>
      <CameraModal
        isOpen={isOpenCamera}
        onClose={() => setIsOpenCamera(false)}
        onImageCapture={handleImageCapture}
      />
      <ExcuseModal
        isOpen={isOpenExcuse}
        onClose={() => setIsOpenExcuse(false)}
        mode={isEditing ? "upload" : "view"}
        onSubmit={handleExcuseSubmit}
      />
      <HabeasDataModal
        idEstudiante={data.identification}
        isOpen={isOpenHabeasDataFormat}
        onClose={() => setIsOpenHabeasDataFormat(false)}
        mode={habeasDataMode}
      />
      <PDFViewerModal
        isOpen={isOpenDocument}
        onClose={() => setIsOpenDocument(false)}
        pdfUrl={documentSelected.file}
        title={documentSelected.name}
      />
    </div>
  );
};

export default ProfileStudent;
